/**
 * OpenRouter Service
 *
 * Service for integrating with OpenRouter API to enrich chat interactions
 * with Large Language Model (LLM) capabilities.
 */

import type { ModelParameters, RequestPayload, ResponseFormat, ParsedResponse } from "./openrouter.types";
import { OpenRouterError } from "./openrouter.types";

/**
 * OpenRouter service for interacting with LLM models via OpenRouter API
 */
export class OpenRouterService {
  // Public properties
  public readonly apiKey: string;
  public readonly endpoint: string;
  public readonly defaultModelName: string;
  public readonly defaultModelParams: ModelParameters;

  // Private properties
  private readonly _retryCount: number;
  private readonly _timeout: number;

  /**
   * Creates a new OpenRouter service instance
   *
   * @param config - Configuration for the OpenRouter service
   * @param config.apiKey - API key for authentication with OpenRouter
   * @param config.endpoint - Endpoint URL for OpenRouter API
   * @param config.defaultModelName - Default model to use (e.g. "gpt-4")
   * @param config.defaultModelParams - Default parameters for the model
   * @param config.retryCount - Number of retry attempts for failed requests
   * @param config.timeout - Timeout in milliseconds for API requests
   */
  constructor(config: {
    apiKey: string;
    endpoint?: string;
    defaultModelName?: string;
    defaultModelParams?: ModelParameters;
    retryCount?: number;
    timeout?: number;
  }) {
    // Validate API key
    if (!config.apiKey) {
      throw new Error("API key is required for OpenRouter service");
    }

    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || "https://openrouter.ai/api/v1/chat/completions";
    this.defaultModelName = config.defaultModelName || "gpt-4";
    this.defaultModelParams = config.defaultModelParams || {
      temperature: 0.7,
      max_tokens: 150,
    };

    // Private fields
    this._retryCount = config.retryCount || 3;
    this._timeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Builds a request payload for the OpenRouter API
   *
   * @param systemMessage - System message that guides model behavior
   * @param userMessage - User message/query to process
   * @param modelParams - Optional parameters to customize model behavior
   * @param responseFormat - Optional format specification for the response
   * @returns Complete request payload for the API
   */
  public buildRequestPayload(
    systemMessage: string,
    userMessage: string,
    modelParams?: Partial<ModelParameters>,
    responseFormat?: ResponseFormat
  ): RequestPayload {
    // Early validation
    if (!systemMessage || !userMessage) {
      throw new OpenRouterError("System message and user message are required");
    }

    // Sanitize inputs
    const sanitizedSystemMessage = this._formatSystemMessage(systemMessage);
    const sanitizedUserMessage = userMessage.trim();

    // Combine default and provided model parameters
    const combinedModelParams: ModelParameters = {
      ...this.defaultModelParams,
      ...modelParams,
    };

    // Build the messages array
    const messages = [
      { role: "system" as const, content: sanitizedSystemMessage },
      { role: "user" as const, content: sanitizedUserMessage },
    ];

    // Construct the payload
    const payload: RequestPayload = {
      messages,
      model: modelParams?.model || this.defaultModelName,
      ...combinedModelParams,
    };

    // Add response format if provided
    if (responseFormat) {
      payload.response_format = responseFormat;
    }

    return payload;
  }

  /**
   * Sends a request to the OpenRouter API
   *
   * @param payload - Complete request payload for the API
   * @returns Parsed response from the API
   * @throws OpenRouterError if the request fails
   */
  public async sendRequest(payload: RequestPayload): Promise<ParsedResponse> {
    // Early validation
    if (!payload || !payload.messages || !payload.messages.length) {
      throw new OpenRouterError("Invalid payload: messages array is required");
    }

    let currentRetry = 0;
    let lastError: Error | null = null;

    // Attempt to send the request with retries
    while (currentRetry <= this._retryCount) {
      try {
        // Calculate the backoff time for retries (exponential backoff)
        if (currentRetry > 0) {
          const backoffTime = Math.min(1000 * Math.pow(2, currentRetry - 1), 10000);
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }

        // Send the request
        const response = await this._sendApiRequest(payload);

        // Validate the response
        if (!this.validateResponse(response)) {
          throw new OpenRouterError("Invalid response from OpenRouter API", {
            responseData: response,
          });
        }

        // Process the response
        return this._handleApiResponse(response);
      } catch (error: any) {
        lastError = error;

        // Don't retry if it's a validation error or auth error
        if (error instanceof OpenRouterError) {
          if (error.statusCode === 401 || error.statusCode === 403) {
            throw error; // Don't retry auth errors
          }
        }

        // Log the error and increment retry counter
        this._logError(error);
        currentRetry++;
      }
    }

    // If we've exhausted retries, throw the last error
    throw new OpenRouterError(`Failed to send request after ${this._retryCount} retries`, {
      cause: lastError as Error,
    });
  }

  /**
   * Validates that the response from the API matches the expected format
   *
   * @param response - Raw response from the API
   * @returns True if the response is valid, false otherwise
   */
  public validateResponse(response: any): boolean {
    if (!response) return false;

    // Check if we have choices array with at least one item
    if (!response.choices || !Array.isArray(response.choices) || response.choices.length === 0) {
      return false;
    }

    // Check if first choice has message with content
    const firstChoice = response.choices[0];
    if (!firstChoice.message || typeof firstChoice.message.content === "undefined") {
      return false;
    }

    return true;
  }

  /**
   * Formats the system message to ensure it meets requirements
   *
   * @param message - Raw system message to format
   * @returns Formatted system message
   * @private
   */
  private _formatSystemMessage(message: string): string {
    // Sanitize and format the system message
    let formattedMessage = message.trim();

    // Ensure the message isn't too long
    if (formattedMessage.length > 4000) {
      formattedMessage = formattedMessage.substring(0, 4000);
    }

    return formattedMessage;
  }

  /**
   * Sends a request to the OpenRouter API
   *
   * @param payload - Request payload to send
   * @returns Raw API response
   * @throws OpenRouterError if the request fails
   * @private
   */
  private async _sendApiRequest(payload: RequestPayload): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this._timeout);

      // Przygotowanie nagłówków z obsługą środowiska serwerowego i klienta
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "X-Title": "FlashcardApp", // Application identifier
      };

      // Dodaj HTTP-Referer tylko gdy jesteśmy w środowisku przeglądarki
      if (typeof window !== "undefined") {
        headers["HTTP-Referer"] = window.location.origin;
      } else {
        // W środowisku serwerowym użyj domyślnej wartości lub adresu aplikacji
        headers["HTTP-Referer"] = "https://flashcards.example.com";
      }

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-success status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new OpenRouterError(`OpenRouter API error: ${response.status} ${response.statusText}`, {
          statusCode: response.status,
          responseData: errorData,
          requestData: {
            endpoint: this.endpoint,
            payload: { ...payload, messages: "[REDACTED]" }, // Don't log full messages for privacy
          },
        });
      }

      // Parse JSON response
      return await response.json();
    } catch (error: any) {
      // Handle abort errors (timeouts)
      if (error.name === "AbortError") {
        throw new OpenRouterError(`Request timed out after ${this._timeout}ms`, {
          requestData: {
            endpoint: this.endpoint,
            payload: { ...payload, messages: "[REDACTED]" },
          },
        });
      }

      // Re-throw OpenRouterError instances
      if (error instanceof OpenRouterError) {
        throw error;
      }

      // Wrap other errors
      throw new OpenRouterError("Error sending request to OpenRouter API", {
        cause: error,
        requestData: {
          endpoint: this.endpoint,
          payload: { ...payload, messages: "[REDACTED]" },
        },
      });
    }
  }

  /**
   * Processes the API response into a standardized format
   *
   * @param apiResponse - Raw API response
   * @returns Parsed response in standardized format
   * @private
   */
  private _handleApiResponse(apiResponse: any): ParsedResponse {
    // Extract the content from the response
    const firstChoice = apiResponse.choices[0];
    const content = firstChoice.message.content;

    // Try to parse JSON if response is meant to be JSON
    let parsedContent: any = content;
    if (typeof content === "string") {
      try {
        // Check if content looks like JSON
        if (content.trim().startsWith("{") || content.trim().startsWith("[")) {
          parsedContent = JSON.parse(content);
        }
      } catch {
        // If parsing fails, keep the original string
        parsedContent = content;
      }
    }

    // Build the parsed response
    return {
      content: parsedContent,
      rawResponse: apiResponse,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Logs errors to the console for debugging
   *
   * @param error - Error to log
   * @private
   */
  private _logError(error: Error): void {
    // Log to console in development, or to monitoring service in production
    if (process.env.NODE_ENV !== "production") {
      console.error("[OpenRouter Service Error]", error);

      if (error instanceof OpenRouterError) {
        if (error.statusCode) {
          console.error(`Status code: ${error.statusCode}`);
        }
        if (error.responseData) {
          console.error("Response data:", error.responseData);
        }
      }
    } else {
      // In production, we would send to a proper logging service
      // logger.error('OpenRouter API Error', { error });
    }
  }
}

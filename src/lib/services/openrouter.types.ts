/**
 * OpenRouter Service Types
 * 
 * Typy używane przez serwis integrujący z API OpenRouter.
 */

export interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  model?: string;
}

export interface JsonSchemaProperty {
  type: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  items?: JsonSchemaProperty;
  [key: string]: any;
}

export interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  [key: string]: any;
}

export interface ResponseFormat {
  type: 'json_schema' | 'text';
  json_schema?: {
    name: string;
    strict: boolean;
    schema: JsonSchema;
  };
}

export interface RequestPayload {
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  model: string;
  response_format?: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ParsedResponse {
  content: string | any;
  rawResponse: any;
  timestamp: string;
}

// Custom error class for OpenRouter API errors
export class OpenRouterError extends Error {
  public readonly statusCode?: number;
  public readonly responseData?: any;
  public readonly requestData?: any;

  constructor(message: string, options?: {
    statusCode?: number;
    responseData?: any;
    requestData?: any;
    cause?: Error;
  }) {
    super(message, { cause: options?.cause });
    this.name = 'OpenRouterError';
    this.statusCode = options?.statusCode;
    this.responseData = options?.responseData;
    this.requestData = options?.requestData;
  }
} 
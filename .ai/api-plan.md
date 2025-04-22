# REST API Plan

## 1. Resources

- **Users**
  - Corresponds to the `users` table in the database. Contains user account details such as id, email, password hash, name, and creation date.

- **Flashcards**
  - Corresponds to the `flashcards` table. Stores flashcards with fields for front text (max 200 characters), back text (max 500 characters), status (accepted, rejected, pending), AI generation flag, timestamps, and a reference to the user.

- **Flashcard Generation Logs**
  - Corresponds to the `flashcard_generation_logs` table. Records details of AI flashcard generation including generation time, duration, user input, number of flashcards generated, accepted, and rejected, with a reference to the user.

- **Authentication**
  - Endpoints handling user registration, login, password change, and account deletion. These are integrated with Supabase Auth and enforce security through JWT and RLS on the database side.

## 2. Endpoints

### A. Users / Authentication

### B. Flashcards

1. **GET /api/flashcards**
   - **Description:** Retrieve a paginated list of flashcards for the authenticated user.
   - **Query Parameters:**
     - `page` (optional): Page number for pagination.
     - `limit` (optional): Number of flashcards per page.
     - `status` (optional): Filter by flashcard status (accepted, rejected, pending).
     - `sort` (optional): Sorting criteria (e.g., created_at desc).
   - **Response:**
     ```json
     {
       "data": [ { /* flashcard objects */ } ],
       "pagination": { "page": number, "limit": number, "total": number }
     }
     ```
   - **Errors:** 401 Unauthorized.

2. **POST /api/flashcards**
   - **Description:** Create one or multiple flashcards, supporting both manual creation and AI-generated cards (both full AI and AI-edited).
   - **Request Payload:**
     ```json
     {
       "flashcards": [
         {
           "front": "Text up to 200 characters",
           "back": "Text up to 500 characters",
           "is_ai_generated": false
         }
       ]
     }
     ```
   - **Response:** 201 Created with array of created flashcard objects.
     ```json
     {
       "data": [
         { /* flashcard object */ }
       ],
       "failed": [
         {
           "index": 0,
           "error": "Error message"
         }
       ]
     }
     ```
   - **Validation:** Enforces max lengths for front and back fields, validates AI generation flags.
   - **Errors:** 400 for invalid input, 401 Unauthorized.

3. **GET /api/flashcards/{id}**
   - **Description:** Retrieve a specific flashcard by its ID.
   - **Response:** A flashcard object.
   - **Errors:** 401 Unauthorized, 404 Not Found.

4. **GET /api/flashcards/generation/{generationId}**
   - **Description:** Retrieve all flashcards associated with a specific generation ID.
   - **Response:**
     ```json
     {
       "data": [ { /* flashcard objects */ } ],
       "generation": { /* generation log object */ }
     }
     ```
   - **Errors:** 401 Unauthorized, 404 Not Found.

5. **PUT /api/flashcards/{id}** or **PATCH /api/flashcards/{id}**
   - **Description:** Update an existing flashcard. This endpoint supports both manual edits and reviews (e.g., updating the status to accepted or rejected after AI generation).
   - **Request Payload:**
     ```json
     {
       "front": "Updated text up to 200 characters",
       "back": "Updated text up to 500 characters",
       "status": "accepted" | "rejected" | "pending"
     }
     ```
   - **Response:** 200 OK with the updated flashcard object.
   - **Errors:** 400 for invalid data, 401 Unauthorized, 404 Not Found.

6. **DELETE /api/flashcards/{id}**
   - **Description:** Delete a flashcard.
   - **Response:** 200 OK with a success message.
   - **Errors:** 401 Unauthorized, 404 Not Found.

### C. Flashcard Generation Logs

1. **GET /api/flashcards/logs**
   - **Description:** Retrieve a paginated list of AI flashcard generation logs for the authenticated user.
   - **Query Parameters:**
     - `page` (optional): Page number for pagination.
     - `limit` (optional): Number of log entries per page.
     - `sort` (optional): Sorting criteria.
   - **Response:**
     ```json
     {
       "data": [ { /* log objects */ } ],
       "pagination": { "page": number, "limit": number, "total": number }
     }
     ```
   - **Errors:** 401 Unauthorized.

### D. AI Flashcard Generation

1. **POST /api/flashcards/ai**
   - **Description:** Generate flashcards using AI based on user-provided text. This endpoint integrates with the AI service and creates corresponding logs.
   - **Request Payload:**
     ```json
     {
       "user_input": "Block of text from which flashcards are generated"
     }
     ```
   - **Business Logic:**
     - Validate the input text (minimum 500 characters, maximum 10000 characters, must contain meaningful content).
     - Generate between 5 and 15 flashcards where the front text is limited to 200 characters and the back text to 500 characters.
     - Set `is_ai_generated` to true and initialize `status` as "pending".
     - Create an entry in the `flashcard_generation_logs` table with details of the generation process.
   - **Response:**
     ```json
     {
       "flashcards": [ { /* generated flashcard objects */ } ],
       "log": { /* flashcard generation log object */ }
     }
     ```
   - **Errors:** 400 for invalid input, 401 Unauthorized, 500 Internal Server Error if the AI generation fails.

## 3. Authentication and Authorization

- **Mechanism:** JWT-based authentication.
  - Tokens are issued upon successful login and must be provided in the Authorization header for protected endpoints.
  - Integration with Supabase Auth ensures that the JWT contains the necessary user information.
  - Database Row-Level Security (RLS) policies ensure that users can only access their own data.

## 4. Validation and Business Logic

- **Input Validation:**
  - User input text for AI generation must be between 500 and 10000 characters.
  - User input text must contain meaningful content (not just whitespace or repetitive characters).

- **Input Validation:**
  - Flashcard `front` text must not exceed 200 characters.
  - Flashcard `back` text must not exceed 500 characters.
  - Flashcard `status` is restricted to one of the following values: "accepted", "rejected", or "pending".

- **Business Logic Implementation:**
  - **AI Flashcard Generation:** Validates user text, calls the AI service, limits output to between 5 and 15 flashcards, marks flashcards as AI-generated, and logs generation details.
  - **Manual Flashcard Creation:** Enforces the same character limits and validations as AI-generated flashcards.
  - **Review Process:** Users can update flashcards generated by AI, changing their status to accepted, rejected, or pending as needed. Updates overwrite existing content per the PRD requirements.

- **Additional Considerations:**
  - List endpoints support pagination, filtering by status, and sorting (typically by creation timestamps) to improve performance and scalability.
  - Rate limiting and other security measures should be applied to sensitive endpoints to guard against abuse. 
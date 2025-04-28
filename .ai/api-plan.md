# REST API Plan

## 1. Resources

- **Users**
  - Corresponds to the `users` table in the database. Contains user account details such as id, email, password hash, name, and creation date.

- **Flashcards**
  - Corresponds to the `flashcards` table. Stores flashcards with fields for front text (max 200 characters), back text (max 500 characters), status (accepted, rejected, pending), AI generation flag, timestamps, and a reference to the user.
  - Includes additional fields: category_id, category_name, difficulty

- **Flashcard Generation Logs**
  - Corresponds to the `flashcard_generation_logs` table. Records details of AI flashcard generation including generation time, duration, user input, number of flashcards generated, accepted, and rejected, with a reference to the user.

- **Categories**
  - List of categories for flashcards organization.

- **Authentication**
  - Endpoints handling user registration, login, password change, and account deletion. These are integrated with Supabase Auth and enforce security through JWT and RLS on the database side.

- **Dashboard**
  - Endpoints providing summary statistics and user dashboard data.

## 2. Endpoints

### A. Users / Authentication

1. **POST /api/auth/change-password**
   - **Description:** Change user password.
   - **Request Payload:**
     ```json
     {
       "current_password": "string",
       "new_password": "string",
       "confirm_password": "string"
     }
     ```
   - **Response:** 200 OK with success message.
   - **Validation:** Confirms password match, validates minimum length (8 characters).
   - **Errors:** 400 for invalid input, 401 Unauthorized, 500 for server errors.

2. **DELETE /api/auth/delete-account**
   - **Description:** Delete user account.
   - **Request Payload:**
     ```json
     {
       "password": "string"
     }
     ```
   - **Response:** 200 OK with success message.
   - **Validation:** Verifies password.
   - **Errors:** 400 for invalid input, 401 Unauthorized, 500 for server errors.

### B. Flashcards

1. **GET /api/flashcards**
   - **Description:** Retrieve a paginated list of flashcards for the authenticated user.
   - **Query Parameters:**
     - `page` (optional): Page number for pagination.
     - `limit` (optional): Number of flashcards per page.
     - `status` (optional): Filter by flashcard status (accepted, rejected, pending).
     - `categoryId` (optional): Filter by category ID.
     - `difficulty` (optional): Filter by difficulty level (easy, medium, hard).
     - `createdBefore` (optional): Filter by creation date (before).
     - `createdAfter` (optional): Filter by creation date (after).
     - `sort` (optional): Sorting criteria (e.g., created_at.desc).
   - **Response:**
     ```json
     {
       "data": [ { /* flashcard objects */ } ],
       "pagination": { "page": number, "limit": number, "total": number }
     }
     ```
   - **Errors:** 401 Unauthorized, 400 Bad Request, 500 Internal Server Error.

2. **POST /api/flashcards**
   - **Description:** Create one or multiple flashcards, supporting both manual creation and AI-generated cards.
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
   - **Errors:** 400 for invalid input, 401 Unauthorized, 500 Internal Server Error.

3. **GET /api/flashcards/{id}**
   - **Description:** Retrieve a specific flashcard by its ID.
   - **Response:** A flashcard object.
   - **Errors:** 401 Unauthorized, 404 Not Found, 500 Internal Server Error.

4. **GET /api/flashcards/generation/{generationId}**
   - **Description:** Retrieve all flashcards associated with a specific generation ID.
   - **Response:**
     ```json
     {
       "data": [ { /* flashcard objects */ } ],
       "generation": { /* generation log object */ }
     }
     ```
   - **Errors:** 401 Unauthorized, 404 Not Found, 500 Internal Server Error.

5. **PATCH /api/flashcards/{id}** or **PUT /api/flashcards/{id}**
   - **Description:** Update an existing flashcard. This endpoint supports both manual edits and reviews.
   - **Request Payload:**
     ```json
     {
       "front": "Updated text up to 200 characters",
       "back": "Updated text up to 500 characters",
       "status": "accepted" | "rejected" | "pending"
     }
     ```
   - **Response:** 200 OK with the updated flashcard object.
   - **Errors:** 400 for invalid data, 401 Unauthorized, 404 Not Found, 500 Internal Server Error.

6. **DELETE /api/flashcards/{id}**
   - **Description:** Delete a flashcard.
   - **Response:** 200 OK with a success message.
   - **Errors:** 401 Unauthorized, 404 Not Found, 500 Internal Server Error.

### C. AI Flashcard Generation

1. **POST /api/flashcards/ai**
   - **Description:** Generate flashcards using AI based on user-provided text.
   - **Request Payload:**
     ```json
     {
       "user_input": "Block of text from which flashcards are generated",
       "category_id": "string (optional)",
       "category_name": "string (optional)"
     }
     ```
   - **Business Logic:**
     - Validate the input text (minimum 500 characters, maximum 10000 characters, must contain meaningful content).
     - Generate flashcards where the front text is limited to 200 characters and the back text to 500 characters.
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

### D. Categories

1. **GET /api/categories**
   - **Description:** Retrieve a list of available categories for flashcards.
   - **Response:** Array of category objects.
   - **Errors:** 500 Internal Server Error.

### E. Dashboard

1. **GET /api/dashboard/stats**
   - **Description:** Retrieve statistics for the user dashboard.
   - **Query Parameters:**
     - `userId` (optional): User ID for filtering.
   - **Response:**
     ```json
     {
       "data": [
         { "label": string, "value": number, "icon": string }
       ]
     }
     ```
   - **Errors:** 400 Bad Request, 401 Unauthorized, 500 Internal Server Error.

2. **GET /api/dashboard/summary**
   - **Description:** Retrieve summary data for the user dashboard.
   - **Query Parameters:**
     - `userId` (optional): User ID for filtering.
     - `limit` (optional): Number of recent generations to include.
   - **Response:**
     ```json
     {
       "data": {
         "recentGenerations": [
           { "id": string, "date": string, "count": number }
         ]
       }
     }
     ```
   - **Errors:** 400 Bad Request, 401 Unauthorized, 500 Internal Server Error.

## 3. Authentication and Authorization

- **Mechanism:** JWT-based authentication through Supabase Auth.
  - JWT tokens are obtained via Supabase Auth workflows.
  - Session management with `supabase.auth.getSession()`.
  - Authorization checks with custom `isAuthenticated()` function.
  - Tokens must be provided in the Authorization header or as cookies for protected endpoints.

## 4. Validation and Business Logic

- **Input Validation:**
  - User input for authentication using zod validation schemas:
    - Password change requires current password verification, minimum 8 characters for new passwords.
    - Account deletion requires password verification.
  - Flashcard validation:
    - Front text must not exceed 200 characters.
    - Back text must not exceed 500 characters.
    - Status is restricted to "accepted", "rejected", or "pending".
  - AI generation validation:
    - Input text must be between 500 and 10000 characters.
    - Input text must contain meaningful content.

- **Business Logic Implementation:**
  - **API Routes Structure:** Implemented using Astro API Routes with TypeScript.
  - **Error Handling:** Consistent error formats with appropriate HTTP status codes.
  - **Database Access:** Through Supabase client with parameterized queries and transaction support.
  - **Authentication Flow:** Leverages Supabase Auth features integrated with custom endpoints.
  - **Dashboard Stats:** Provides user-specific analytics data for the dashboard UI. 
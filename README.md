# 10xCards

## Project Description

10xCards is a web application designed to simplify the process of creating educational flashcards. The app allows users to generate flashcards using AI based on provided text as well as manually create flashcards. This dual approach helps users efficiently prepare for spaced repetition learning and enhances overall study effectiveness.

## Tech Stack

- **Frontend**: Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend**: Supabase (PostgreSQL) for authentication and data management
- **AI Integration**: Openrouter.ai for generating flashcards using various artificial intelligence models
- **CI/CD & Hosting**: GitHub Actions for CI/CD pipelines and DigitalOcean for hosting

## Getting Started Locally

1. **Prerequisites**:
   - Node.js version specified in `.nvmrc`: 22.14.0
   - npm or yarn installed on your system

2. **Installation**:
   ```bash
   npm install
   ```

3. **Running the Project**:
   ```bash
   npm run dev
   ```
   This command starts the Astro development server.

## Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production.
- `npm run preview` - Launches a local server to preview the production build.
- `npm run astro` - Runs Astro CLI commands.
- `npm run lint` - Checks code quality using ESLint.
- `npm run lint:fix` - Fixes linting errors with ESLint.
- `npm run format` - Formats the code using Prettier.

## Project Scope

The scope of 10xCards includes:

- **AI Flashcard Generation**: Generate two-sided flashcards where the front is limited to 200 characters and the back to 500 characters.
- **Flashcard Review**: Users can review generated flashcards with options to Accept, Edit, or Reject them.
- **Manual Flashcard Creation**: A form interface allows users to manually enter and create flashcards.
- **Flashcard Management**: Features to view, edit, and delete flashcards stored in the database.
- **User Account Management**: Registration, login, password changes, and account deletion with robust security measures.
- **Reporting**: Logs flashcard generation operations to provide insights into accepted and rejected flashcards.

## Project Status

The project is currently in its early development stage (version 0.0.1). Continuous improvements and new features are under active development.

## Project Structure

```md
.
├── src/
│   ├── layouts/    # Astro layouts
│   ├── pages/      # Astro pages
│   │   └── api/    # API endpoints
│   ├── components/ # UI components (Astro & React)
│   └── assets/     # Static assets
├── public/         # Public assets
``` 

## License

This project is licensed under the [MIT License](LICENSE). 
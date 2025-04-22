# Supabase Configuration for 10xCards

This directory contains database migrations and configuration for the Supabase backend used by 10xCards.

## Structure

- `migrations/` - Contains SQL migration files for database schema updates
- `config.toml` - Supabase configuration for local development

## Migration Files

The migrations are executed in order based on the timestamp prefix in their filename. The current migration includes:

- `20241206121500_initial_schema.sql` - Initial database schema with flashcards and generation logs tables

## Working with Migrations

### Prerequisites

1. Install the Supabase CLI: [Installation Guide](https://supabase.com/docs/guides/cli)
2. Set up your local Supabase development environment: `supabase init`

### Local Development

Start a local Supabase instance:

```bash
supabase start
```

This will apply all migrations in order to your local database.

### Creating New Migrations

To create a new migration file:

```bash
supabase migration new my_migration_name
```

This will create a new timestamped SQL file in the `migrations/` directory.

### Applying Migrations to Production

To apply migrations to your production Supabase project:

```bash
supabase db push --db-url=<DATABASE_URL>
```

Or link your project first:

```bash
supabase link --project-ref <PROJECT_REF>
supabase db push
```

## Database Schema

The database includes the following tables:

1. `auth.users` - Automatically managed by Supabase Auth
2. `flashcards` - Stores user's flashcards with front/back content and status
3. `flashcard_generation_logs` - Tracks statistics about AI-generated flashcards

All tables implement Row Level Security (RLS) to ensure data is only accessible to the appropriate users.

## Local Development with Supabase

1. Copy `.env.example` to `.env.local` and fill in your local Supabase credentials
2. Start the local Supabase instance: `supabase start`
3. Start your application development server: `npm run dev` 
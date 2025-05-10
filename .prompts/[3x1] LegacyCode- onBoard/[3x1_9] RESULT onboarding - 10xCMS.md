# Project Onboarding: 10xCMS

## Welcome

Welcome to the 10xCMS project! This document provides an overview to help you get started. 10xCMS is a Content Management System built with Node.js and Express, focused on managing content collections, a media library, and webhooks.

## Project Overview & Structure

The project is a monolithic application using Node.js/Express for the backend and jQuery/Bootstrap/Bower for the frontend. Key directories include:

*   `src/`: Contains the main source code.
    *   `server/`: Backend logic (API, database, webhooks, media handling, storage, templating).
    *   `pages/`: HTML templates for server-side rendering.
    *   `components/`, `layout/`: Reusable HTML template parts.
*   `public/`: Static assets served to the client (CSS, images, frontend JS like `app.js`, Bower vendor files).
*   `docs/`: Contains minimal additional documentation (currently only a performance ticket).
*   `index.js`: Main application entry point.
*   `package.json`: Node.js dependencies and scripts.
*   `bower.json`: Frontend dependencies (managed via Bower).
*   `.nvmrc`: Specifies Node.js version 16.
*   `.env.development`: Environment variables for development.

## Core Modules

### `Collection Management`

*   **Role:** Defines content structures (collections), allows creating/editing/deleting items within those collections, and exposes them via an API.
*   **Key Files/Areas:** `src/server/api.js`, `src/server/db/` (database interactions via Knex.js), `src/server/storage.js` (potentially older file-based logic, check recent refactoring), `src/pages/collections.html`, `src/pages/collection.html`.
*   **Recent Focus:** Major refactoring to move data persistence from JSON files (`src/server/data/collections.json`) to an SQLite database (`src/server/db/dev.sqlite3`) using Knex.js.

### `Media Library`

*   **Role:** Handles image uploads, storage, and provides an interface for browsing and selecting media.
*   **Key Files/Areas:** `src/server/media.js`, `src/server/storage.js`, Multer middleware setup (likely in `index.js`), `src/pages/media.html`, `public/uploads/` (storage location).
*   **Recent Focus:** Likely impacted by the storage and database changes.

### `Webhooks`

*   **Role:** Sends HTTP notifications to configured URLs when items in a collection are created, updated, or deleted.
*   **Key Files/Areas:** `src/server/webhooks.js`, `src/pages/webhooks.html`, persistence potentially moved to the database (check `dbf9982`).
*   **Recent Focus:** Recent fix related to webhook storage (`dbf9982`).

### `API`

*   **Role:** Provides external access to collection data.
*   **Key Files/Areas:** `src/server/api.js`.
*   **Recent Focus:** Minor updates alongside database and UI changes.

### `Templating & Frontend`

*   **Role:** Renders HTML pages server-side and handles client-side interactions.
*   **Key Files/Areas:** `src/server/templating.js`, `src/pages/`, `src/components/`, `src/layout/`, `public/app.js`, `public/vendor/` (Bower components like jQuery, Bootstrap).
*   **Recent Focus:** UI enhancements and fixes, primarily in `public/app.js` and various HTML templates.

## Key Contributors

*   **Przemek Smyrdek (psmyrdek@gmail.com):** Appears to be the primary or sole recent contributor, involved in all major recent features and fixes (database migration, webhooks, UI, API).

## Overall Takeaways & Recent Focus

*   The project is a functional CMS with core features implemented.
*   **Major Recent Initiative:** Migrating data persistence from flat JSON files to an SQLite database using Knex.js. This touched many parts of the backend (`storage.js`, `index.js`, API, webhooks). Understanding this transition is key.
*   **Frontend Stack:** Uses jQuery and Bootstrap via Bower, which is an older approach. Frontend logic is mainly in `public/app.js` interacting with server-rendered HTML.
*   **Performance:** Known performance concerns exist, particularly around collection management (see `docs/ticket-2331.md`).

## Potential Complexity/Areas to Note

*   **Database Migration:** Ensure you understand the new Knex.js-based data layer (`src/server/db/`) and how it interacts with the rest of the application. Verify the status of the migration (is the old `storage.js` logic fully deprecated?).
*   **Legacy Frontend:** Working with jQuery/Bower requires familiarity with these tools. Debugging frontend issues might involve inspecting `public/app.js` and the server-rendered HTML.
*   **Performance Bottlenecks:** Be mindful of potential performance issues noted in `docs/ticket-2331.md` when working on collection or webhook features.
*   **Limited Documentation:** Beyond the README and one ticket, internal documentation seems sparse. Code reading and potentially git history will be necessary to understand specific implementations.

## Questions for the Team

1.  What is the current status of the migration from JSON files to the SQLite database? Is the old `storage.js` logic still used anywhere?
2.  Are there plans to modernize the frontend stack away from jQuery/Bower?
3.  What are the main pain points regarding the performance issues mentioned in `ticket-2331.md`? Has any specific investigation been done?
4.  Are there any automated test suites beyond the single `templating.test.js` file? How is testing typically handled?
5.  What is the intended deployment environment and process?
6.  Are there external systems that rely on the webhooks or the API?
7.  What is the primary way the team tracks tasks or bugs (e.g., GitHub Issues, Jira)?

## Next Steps

1.  Set up the development environment following the instructions below.
2.  Run the application locally (`npm run dev`) and explore the CMS interface (`http://localhost:3000`).
3.  Review the recent commits related to the database migration (`dd6e629`, `dbf9982`, `06c85ac`, `3ffe559`). Pay close attention to changes in `index.js`, `src/server/storage.js`, `src/server/db/`, and related modules.
4.  Trace the request flow for viewing/editing a collection item, starting from the route definition (likely in `index.js` or `src/server/api.js`) through database interaction (`src/server/db/`) to templating (`src/server/templating.js` and `src/pages/collection.html`).
5.  Try running the tests (`npm test`).

## Development Environment Setup

1.  **Install Node.js v16:** Use a Node version manager like `nvm` (`nvm install 16 && nvm use 16`).
2.  **Install Bower:** If you don't have it, install globally: `npm install -g bower`
3.  **Clone the Repository:** (You've likely already done this) `git clone <repository-url>`
4.  **Navigate to Project Directory:** `cd 10x-cms`
5.  **Install Node Dependencies:** `npm install`
6.  **Install Frontend Dependencies:** `bower install` (This will create/populate `public/vendor/`)
7.  **Configure Environment:** Copy `.env.development.example` to `.env.development` if an example file exists, or ensure `.env.development` has necessary variables (though none seem strictly required for basic startup based on current info).
8.  **Run the Development Server:** `npm run dev`
9.  **Access the Application:** Open `http://localhost:3000` in your browser.

## Helpful Resources

*   **README.md:** Provides basic overview and setup instructions.
*   **docs/ticket-2331.md:** Details on known performance issues.
*   **Node.js:** [https://nodejs.org/](https://nodejs.org/)
*   **Express.js:** [https://expressjs.com/](https://expressjs.com/)
*   **Knex.js:** [https://knexjs.org/](https://knexjs.org/)
*   **jQuery API:** [https://api.jquery.com/](https://api.jquery.com/)
*   **Bootstrap (likely v3 or v4 based on jQuery dependency):** Check `bower.json` or `public/vendor/bootstrap` for version.
*   **Bower:** [https://bower.io/](https://bower.io/) (Note: Bower is largely deprecated in the wider JS ecosystem).

(No links to internal issue trackers or communication channels were found during exploration).
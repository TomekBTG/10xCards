# Project Onboarding: Excalidraw

## Welcome

Welcome to the Excalidraw project! Excalidraw is an open-source virtual hand-drawn style whiteboard that is collaborative and end-to-end encrypted.

## Project Overview & Structure

The core functionality revolves around providing a canvas for creating diagrams, wireframes, and other visuals with a hand-drawn aesthetic. The project is organized as a monorepo using Yarn workspaces, containing the main web application (`excalidraw-app`) and several shared packages under the `packages/` directory (like `@excalidraw/excalidraw`, `@excalidraw/element`, etc.).

## Core Modules

*(**Note:** Descriptions enhanced with findings from module & file analysis)*

### `packages/excalidraw` (Main Package)

- **Role:** Serves as the central integration hub for the Excalidraw library. It combines UI components (`components/`), element logic (`@excalidraw/element`), user actions (`actions/`), data handling (`data/`), and rendering capabilities (`renderer/`), exporting the main `Excalidraw` component/API for use in the web app or other integrations. It defines the core application state (`types.ts`) and manages its lifecycle.
- **Key Files/Areas:**
  - Core Types: `types.ts` (Defines `AppState`, `ExcalidrawElement`, etc.)
  - Main Component: `components/App.tsx` (Orchestrates the entire editor)
  - Data Handling: `data/restore.ts` (Loads/normalizes scene data)
  - Action Management: `actions/manager.tsx`
  - Scene Management: `scene/` directory
  - Rendering: `renderer/` directory
- **Recent Focus (from git):** Bug fixes for element interactions (locking, selection, duplication, erasing), SVG export enhancements, performance optimization (eraser tool, rendering), and adding new features (lasso selection, improved text element handling, container binding).

### `packages/excalidraw/components`

- **Role:** Houses the React UI components that constitute the visual editor interface. This includes the main application shell (`App.tsx`), toolbars, dialogs, popovers, context menus, and specific feature panels like stats or the library.
- **Key Files/Areas:**
  - Main Application Shell: `App.tsx` (Highly active, orchestrates UI and logic)
  - UI Elements: `Button.tsx`, `Modal.tsx`, `Popover.tsx`, `Toolbar.scss`, `Tooltip.tsx`, `LayerUI.tsx`, `Island.tsx`, `ContextMenu.tsx`
  - Feature Components: `Stats/`, `main-menu/`, `footer/`, `Sidebar/`, `LibraryMenu.tsx`, `ImageExportDialog.tsx`, `HelpDialog.tsx`
- **Recent Focus (from git):** UI/UX refinements (styling tweaks for panels, buttons, color swatches), performance improvements (eraser responsiveness), integrating UI aspects of new features (lasso selection, horizontal text label options), and adapting to the refactoring that moved element logic to its own package. `App.tsx` sees constant updates reflecting its central role.

### `packages/element`

- **Role:** Defines and manages the core data structures, types, and manipulation logic for all canvas elements (e.g., shapes, text, lines, arrows). It provides the foundational logic for how elements behave and interact, including geometry, collision, binding, resizing, and editing. Source code resides in `packages/element/src/`.
- **Key Files/Areas:**
  - Element Types: `types.ts` (Core element interfaces)
  - Element Interaction: `binding.ts`, `resizeElements.ts`, `linearElementEditor.ts`, `dragElements.ts`
  - Element Creation: `newElement.ts`
  - Element Checks/Helpers: `typeChecks.ts`, `sizeHelpers.ts`, `bounds.ts`, `collision.ts`
  - Text Handling: `textElement.ts`, `textMeasurements.ts`, `textWrapping.ts`
- **Recent Focus (from git):** As a relatively new package created via refactoring, recent work heavily involves refining core element behaviors (text label orientation, arrow routing, normalization, binding logic), adding selection logic (lasso), fixing geometric bugs (resizing, corners), and establishing utility functions (center point). `binding.ts`, `resizeElements.ts`, and `linearElementEditor.ts` are particularly active.

### `packages/excalidraw/actions`

- **Role:** Manages user-initiated commands and actions within the editor. It translates UI interactions (button clicks, menu selections) or keyboard shortcuts into state updates or operations on canvas elements. It also defines the structure for UI elements in the properties panel.
- **Key Files/Areas:**
  - Action Registration/Management: `manager.tsx`, `index.ts`, `register.tsx`
  - Property Actions: `actionProperties.tsx` (Defines UI for properties panel)
  - Specific Actions: `actionCanvas.tsx`, `actionHistory.tsx`, `actionDeleteSelected.tsx`, `actionGroup.tsx`, `actionExport.tsx`, `actionFrame.tsx`, `actionElementLink.tsx`
- **Recent Focus (from git):** Implementing actions related to new features (lasso selection, text container creation, horizontal labels), fixing bugs in existing actions (element duplication during drag, arrow conversion), adapting to broader refactoring efforts (element logic separation, import cleanup), and updating property panel definitions (`actionProperties.tsx`).

### `packages/excalidraw/tests`

- **Role:** Ensures the stability and correctness of the application through automated testing. It utilizes Vitest for unit and integration tests, including snapshot testing for UI components (context menu) and application state (history).
- **Key Files/Areas:**
  - Test Files: `history.test.tsx`, `contextmenu.test.tsx` (Most active test logic files)
  - Snapshots: `__snapshots__/` directory (Very active, especially `history.test.tsx.snap`, `contextmenu.test.tsx.snap`)
- **Recent Focus (from git):** High activity mirrors development across other modules. Tests and snapshots are frequently added or updated to cover new features (lasso), bug fixes (duplication, normalization, history edge cases), performance improvements (eraser), UI tweaks, and major refactoring (element package separation), indicating a strong emphasis on maintaining quality via regression testing.

## Key Contributors

*(**Note:** Updated based on recent git history analysis across key files/modules)*

- **David Luzar (@dwelle):** Top contributor, highly active across core logic, UI (`App.tsx`), element interactions, history, bug fixing, and refactoring. Seems to touch most parts of the system.
- **Márk Tolmács (@MarkTolmacs):** Frequent contributor focusing significantly on element logic (`binding.ts`, `linearElementEditor.ts`), arrow handling, history fixes, and feature implementation (text labels, binding improvements).
- **Marcel Mraz (@marcelmraz):** Active contributor, notably drove the major refactoring separating `packages/element`. Involved in actions, types, releases, and general maintenance.
- **Ryan Di (@ryandi):** Notable contributor focusing on performance (`App.tsx` eraser perf), new features (lasso selection), and related fixes in components and tests.
- **Other Active Contributors:** jhanma17dev (element utilities), Narek Malkhasyan (text containers), Rubén Norte (SVG export fixes), Ritobroto Kalita (arrow fixes), Mursaleen Nisar (chore/refactoring).

## Overall Takeaways & Recent Focus

*(**Note:** Synthesized from module & file analysis, incorporating git history patterns)*

1.  **Ongoing Element Refinement:** The separation of `packages/element` was a major architectural change. Recent work continues to refine this core logic, particularly around complex interactions like element binding (`binding.ts`), resizing (`resizeElements.ts`), linear element editing (`linearElementEditor.ts`), and selection (lasso feature). This remains a primary focus area.
2.  **`App.tsx` as the Hub:** `components/App.tsx` remains the most frequently changed file, acting as the central integration point for UI, state, actions, and element logic. Its complexity and high activity reflect ongoing feature additions, UI/UX tweaks, and performance optimizations.
3.  **Feature Implementation & Bug Fixing:** Recent commits show a mix of new feature development (lasso selection, horizontal text labels, container binding, eraser performance) and numerous bug fixes related to core interactions (element duplication, arrow handling, history edge cases, selection).
4.  **Data Integrity & Compatibility:** Work on core types (`types.ts`) and data restoration (`data/restore.ts`) continues, driven by new features and refactoring, ensuring data consistency and handling legacy formats.
5.  **Emphasis on Testing:** The high activity in `tests/` and snapshot files (`history.test.tsx.snap`, `contextmenu.test.tsx.snap`) underscores a strong commitment to catching regressions and maintaining stability, especially for core functionalities like undo/redo and context menus, which are frequently affected by changes elsewhere.

## Potential Complexity/Areas to Note

*(**Note:** Updated with insights from file change frequency and commit patterns)*

- **`packages/excalidraw/components/App.tsx`:** Remains the most complex area due to its size, high change frequency (86 changes noted), and role as the central orchestrator. Understanding its state management, event handling, and interactions with other modules is crucial but challenging.
- **Element Interaction Logic (`packages/element/src/*.ts`):** Files like `binding.ts` (36 changes), `resizeElements.ts` (23 changes), and `linearElementEditor.ts` (23 changes) handle intricate geometric calculations and state management for core drawing interactions. These have high change rates and involve multiple key contributors (dwelle, MarkTolmacs, marcelmraz), suggesting complexity and potential need for knowledge sharing.
- **Core Types (`packages/excalidraw/types.ts`):** With 27 changes, this file defines the fundamental data structures. Changes here have wide-ranging impacts, requiring careful consideration. Frequent updates indicate an evolving data model.
- **State Management & Data Flow:** The interaction between `App.tsx`, `AppState` (`types.ts`), the action system (`actions/`), scene management (`scene/`), and element logic (`packages/element`) forms a complex data flow that requires careful study.
- **History Implementation:** While covered by tests, the history mechanism and its interaction with asynchronous operations or collaboration (if applicable) can be complex, as indicated by the activity in `history.test.tsx` and its snapshot.
- **Data Serialization/Restoration (`packages/excalidraw/data/restore.ts`):** With 27 changes, this file handles loading diverse data formats and versions, making its logic potentially intricate.

## Questions for the Team

*(**Note:** Refined based on analysis findings and potential ambiguities)*

1.  Given the complexity and high change rate of `packages/excalidraw/components/App.tsx`, what are the core principles or patterns guiding its state management and component interaction? Are there diagrams or docs explaining its internal architecture?
2.  The `packages/element` module was recently refactored. What was the primary motivation, and are there specific design patterns (e.g., regarding immutability, function purity) expected when contributing to this core logic, especially files like `binding.ts` or `resizeElements.ts`?
3.  How is the application state (`AppState` in `types.ts`) designed to be managed? Are there specific rules about what goes into the global state versus component state or other stores?
4.  The snapshot tests (`history.test.tsx.snap`, `contextmenu.test.tsx.snap`) change frequently. What's the typical workflow for updating them, and how are intentional vs. unintentional snapshot changes differentiated during code review?
5.  Considering the frequent changes in element interaction logic (`binding.ts`, `resizeElements.ts`), what's the best approach for debugging issues related to element positioning, binding, or resizing behavior?

## Next Steps

*(**Note:** Updated with more specific recommendations based on analysis)*

1.  **Set up the development environment:** (Preserved) Follow `dev-docs/docs/introduction/development.mdx` (clone repo, run `yarn`, then `yarn start`).
2.  **Grasp the Core Architecture:** Start by understanding the roles of the main packages: `packages/excalidraw` (integrator), `packages/element` (core logic), `components` (UI), `actions` (commands), `tests` (stability).
3.  **Deep Dive into `App.tsx`:** Since it's central, spend time navigating `packages/excalidraw/components/App.tsx`. Don't aim to understand everything initially, but identify how it renders main UI parts (canvas, toolbars) and handles major events (pointer down/move/up). Use debugger/breakpoints.
4.  **Understand Element Basics:** Review `packages/element/src/types.ts` to understand element data structures. Then, explore `packages/element/src/newElement.ts` to see how elements are created and `packages/element/src/mutateElement.ts` for updates.
5.  **Focus on Key Interactions:** Review the highly active interaction files in `packages/element/src/`: `binding.ts`, `resizeElements.ts`, and `linearElementEditor.ts`. Understand their purpose even if the implementation details are complex initially.
6.  **Run and Understand Tests:** Execute `yarn test`. Examine `packages/excalidraw/tests/history.test.tsx` and `contextmenu.test.tsx` to see how core features are tested. Try making a small change that breaks a snapshot and run `yarn test:update` to see the workflow.
7.  **Trace a Property Change:** Follow the flow of changing an element property (e.g., stroke color) starting from the UI (`actions/actionProperties.tsx` PanelComponent), through action registration (`actions/register.tsx`), action execution (`actionProperties.tsx` perform function), and finally element update (`mutateElement.ts`).
8.  **(Recommendation)** Add more architectural diagrams or documentation explaining the data flow between `App.tsx`, `AppState`, `actions`, and `packages/element`. Documenting the state management philosophy for `App.tsx` would be beneficial.

## Development Environment Setup

1.  **Prerequisites:** Node.js (v18.0.0 - 22.x.x), Yarn (v1 or v2.4.2+), Git.
2.  **Dependency Installation:** `yarn`
3.  **Building the Project (if applicable):** `yarn build` (builds the main app, typically not needed for dev)
4.  **Running the Application/Service:** `yarn start` (runs dev server at `http://localhost:3000`)
5.  **Running Tests:** `yarn test` (runs Vitest tests using configuration likely in `vitest.config.ts` or `package.json`)
6.  **Common Issues:** Section not explicitly found, but ensure correct Node/Yarn versions. Collaboration features require setting up `excalidraw-room` separately.

## Helpful Resources

- **Documentation:** `https://docs.excalidraw.com`
- **Issue Tracker:** `https://github.com/excalidraw/excalidraw/issues`
- **Contribution Guide:** `https://docs.excalidraw.com/docs/introduction/contributing` (Source: `dev-docs/docs/introduction/contributing.mdx`)
- **Communication Channels:** Discord (`https://discord.gg/UexuTaE`)
- **Learning Resources:** Specific learning resources section not found, but the main documentation site is comprehensive.
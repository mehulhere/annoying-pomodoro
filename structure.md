# Project Structure for Annoying Pomodoro

This document outlines the main files and directories in the Annoying Pomodoro React application.

## Root Directory

-   **`package.json`**: Defines project metadata, dependencies, and scripts (like `npm start`, `npm run build`).
-   **`package-lock.json`**: Records the exact versions of dependencies used.
-   **`README.md`**: Provides an overview of the project, setup instructions, and other relevant information.
-   **`deploy.sh`**: A shell script used to build the application and deploy it to GitHub Pages. It handles cleaning, building, branch switching, and pushing to the `gh-pages` branch.
-   **`.gitignore`**: Specifies intentionally untracked files that Git should ignore (e.g., `node_modules`, build artifacts).
-   **`public/`**: Contains static assets that are publicly accessible.
    -   **`index.html`**: The main HTML page that serves as the entry point for the React application.
    -   **`favicon.ico`**: The icon displayed in the browser tab.
    -   **`assets/`**: Directory for other static assets like images or sound files (e.g., `notification.mp3`).
-   **`src/`**: Contains the source code of the React application.
    -   **`index.js`**: The JavaScript entry point. It renders the main `App` component into the DOM.
    -   **`App.js`**: The main application component. It manages the overall state, routing (if any, though current structure is single-view focused with view switching), and layout. It orchestrates interactions between different parts of the application like the timer, task management, and settings.
    -   **`index.css`**: Global CSS styles and Tailwind CSS base/component/utility layers. Contains global styling, theme variables (light/dark), and utility CSS classes.
    -   **`components/`**: Directory for reusable React components.
        -   **`TaskForm.jsx`**: Component for the form used to add new tasks (description and duration).
        -   **`TaskList.jsx`**: Component to display the list of tasks.
        -   **`TaskItem.jsx`**: Component representing a single task item in the list.
        -   **`SpiralForm.jsx`**: Component for the input form to add new "spiral" ideas/thoughts.
        -   **`SpiralList.jsx`**: Component to display the list of spirals.
        -   **`SpiralItem.jsx`**: Component representing a single spiral item.
        -   **`ui/`**: Sub-directory for general-purpose UI components (often "shadcn/ui" inspired or similar).
            -   **`Button.jsx`**: A reusable button component with variants.
            -   **`Card.jsx`**: Components for card-like UI elements (`Card`, `CardHeader`, `CardTitle`, `CardContent`, etc.).
            -   **`Input.jsx`**: A reusable input field component.
            -   **`Label.jsx`**: A reusable label component.
            -   **`Toaster.jsx`**: Component to display toast notifications.
            -   **`PromptDialog.jsx`**: A dialog component used for prompts that require user input (e.g., extending timer).
    -   **`hooks/`**: Directory for custom React hooks.
        -   **`use-toast.js`**: Custom hook for managing and displaying toast notifications.
    -   **`lib/`**: Directory for utility functions or libraries.
        -   **`utils.js`**: General utility functions, often includes `cn` for conditional class names (from `clsx` and `tailwind-merge`).

## Build Process

-   Running `npm run build` (typically using `react-scripts build`) creates a `build/` directory. This directory contains the optimized, static assets (HTML, CSS, JavaScript bundles, images) ready for deployment.
-   The `deploy.sh` script uses the contents of this `build/` directory for deploying to GitHub Pages.

## Key Features Handled in `App.js`

-   **State Management**: Manages tasks, spirals, timer state (active, break, time remaining), user score, settings (theme, sound, quote type, break duration), and current view.
-   **Timer Logic**: Core countdown logic, starting/pausing/resuming tasks and breaks, extending timers.
-   **Task Operations**: Adding, removing, completing tasks.
-   **Spiral Operations**: Adding, removing spirals, moving spirals to tasks.
-   **Daily Stats Calculation**: Computes total planned time, focus time, idle time, and probability of not finishing tasks.
-   **Settings Persistence**: Saves and loads user settings from `localStorage`.
-   **Notifications**: Handles sound and desktop notifications.
-   **Motivational Quotes**: Displays quotes based on selected type.
-   **View Switching**: Manages which main content area is visible (Focus, Plan, Spirals, Settings). 
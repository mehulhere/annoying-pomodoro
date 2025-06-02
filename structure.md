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
    -   **`assets/`**: Directory for other static assets like images or sound files (e.g., `annoyingNotification.mp3`, `annoyingTomato.png`).
-   **`src/`**: Contains the source code of the React application.
    -   **`index.js`**: The JavaScript entry point. It renders the main `App` component into the DOM.
    -   **`App.js`**: The main application component. It manages the overall state, layout, view switching, timer logic, task/spiral operations, daily stats calculation, settings persistence, historical stats management, notifications, and motivational quotes. It also defines the `navItems` array and the `getIconClass` helper function for navigation styling. Manages the `initialTimeForProgress` state for accurate progress bar display during extensions and the tutorial state (`showTutorial`, `currentTutorialStep`) and logic.
    -   **`index.css`**: Global CSS styles and Tailwind CSS base/component/utility layers. Contains global styling, theme variables (light/dark), custom scrollbar styles (`.custom-scrollbar`), and utility CSS classes, including those for the main heading gradients.
    -   **`components/`**: Directory for reusable React components.
        -   **`TaskForm.jsx`**: Component for the form used to add new tasks (description and duration).
        -   **`TaskList.jsx`**: Component to display the list of tasks. Handles its own internal scrolling with a max height and custom scrollbar styling.
        -   **`TaskItem.jsx`**: Component representing a single task item in the list.
        -   **`SpiralForm.jsx`**: Component for the input form to add new "spiral" ideas/thoughts.
        -   **`SpiralList.jsx`**: Component to display the list of spirals.
        -   **`SpiralItem.jsx`**: Component representing a single spiral item.
        -   **`DashboardView.jsx`**: Component for displaying historical statistics and charts using Chart.js.
        -   **`TaskShortcut.jsx`**: Component for the quick task addition button visible in the Focus view.
        -   **`ui/`**: Sub-directory for general-purpose UI components ("shadcn/ui" inspired or similar).
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
        -   **`statsHistory.js`**: Utility functions for saving, retrieving, and managing historical daily statistics.

## Build Process

-   Running `npm run build` (typically using `react-scripts build`) creates a `build/` directory. This directory contains the optimized, static assets (HTML, CSS, JavaScript bundles, images) ready for deployment.
-   The `deploy.sh` script uses the contents of this `build/` directory for deploying to GitHub Pages.

## Key Features Handled in `App.js` (Updated based on recent changes)

-   **State Management**: Manages tasks, spirals, timer state (active, break, time remaining), user score, settings (theme, sound, quote type, break duration, daily reset time, break extension allowance, quick task button enabled), current view, and tutorial state.
-   **Timer Logic**: Core countdown logic, starting/pausing/resuming tasks and breaks, extending timers. Includes logic for timer color changes based on time remaining and state (idle, active, break, warning thresholds).
-   **Task Operations**: Adding, removing, completing tasks. Task list is now sorted to show uncompleted tasks first.
-   **Spiral Operations**: Adding, removing spirals, moving spirals to tasks.
-   **Daily Stats Calculation**: Computes total planned time, focus time, idle time, and probability of not finishing tasks for the current day, including the custom session end time feature.
-   **Settings Persistence**: Saves and loads user settings (including daily reset time and quick task enabled status) from `localStorage`.
-   **Historical Stats Management**: Handles saving daily statistics and provides data for the dashboard view.
-   **Notifications**: Handles sound (using `annoyingNotification.mp3`) and desktop notifications.
-   **Motivational Quotes**: Displays quotes based on selected type, with toggle visibility.
-   **View Switching & Navigation**: Manages which main content area is visible. The sidebar navigation uses the `navItems` array and `getIconClass` helper for styling, with distinct color-coded icons when active and a consistent active background.
-   **Interactive Tutorial**: Manages the state and navigation logic for the step-by-step tutorial modal, displayed for first-time users. The modal is positioned absolutely within the main content area.
-   **Confetti**: Triggers a confetti burst centered on the Focus view card when a task is completed.
-   **Header Styling**: Implements the split-gradient/solid color styling for the "Annoying Pomodoro" title and positions the annoying character and quote.
-   **Quick Task Button**: Controls the visibility of the quick task addition button in the Focus view based on settings.

## Additional Notes

-   **Custom Scrollbar Styles**: The `.custom-scrollbar` class in the `index.css` file is used to apply custom styles to scrollbars.
-   **Heading Gradients**: The main heading gradients are implemented using utility CSS classes in the `index.css` file.
-   **Task List Handling**: The `TaskList.jsx` component handles its own internal scrolling with a max height and custom scrollbar styling.
-   **Nav Items and Get Icon Class**: The `App.js` file defines the `navItems` array and the `getIconClass` helper function for navigation styling.
-   **Confetti**: The confetti burst is triggered when a task is completed.
-   **Header Styling**: The split-gradient/solid color styling for the "Annoying Pomodoro" title and positions the annoying character and quote are implemented.
-   **Tutorial Modal Positioning**: The tutorial modal is rendered conditionally in `App.js` and is positioned absolutely within the main content area using Tailwind classes.
-   **Quick Task Button Visibility**: Controlled via the `isQuickTaskEnabled` state and saved in settings. 
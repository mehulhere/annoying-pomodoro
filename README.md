# Annoying Pomodoro

An interactive Pomodoro timer application designed to keep you focused and productive, with a touch of customizable annoyance to ensure you stay on task.

## Features

*   **Task Management**: Add, remove, and mark tasks as complete.
*   **Pomodoro Timer**: Classic Pomodoro timer for focused work sessions.
*   **Configurable Break Timer**: 
    *   Automatic breaks after task completion.
    *   Adjustable default break duration (1-15 minutes) via settings.
    *   Option to skip breaks.
*   **Flexible Time Extension**: 
    *   Option to extend the timer for tasks (when timer reaches 00:00).
    *   Option to extend breaks, even while the break timer is running (configurable via settings).
*   **Motivational Quotes**: 
    *   Four customizable quote categories: Nagging, Rude, Annoying, Abusive.
    *   Quotes change periodically to keep you engaged.
*   **Fair Scoring System**: 
    *   Earn base points for completing tasks.
    *   Bonus points awarded based on the *percentage* of estimated time saved (up to a max bonus).
    *   Penalties for extending tasks.
*   **Spirals (Idea Logging)**: A place to jot down ideas or future tasks without breaking your current focus, which can later be moved to the main task list.
*   **Comprehensive Stats**: 
    *   In-header display: Score, Tasks Completed, total accumulated Focus Time (updates live).
    *   Daily Stats in Plan view: Total Tasks, Total Planned Time, Estimated Remaining Time, P(Not Finishing).
    *   Calculated Idle Time displayed in the header.
    *   Historical stats dashboard with interactive charts showing focus time and idle time.
*   **Multiple Views**: 
    *   **Focus View**: Main timer and current task display.
    *   **Plan View**: Task planning, task list, and daily stats.
    *   **Spirals View**: Manage your ideas and future tasks.
    *   **Settings View**: Customize your application experience.
    *   **Dashboard View**: Visualize productivity metrics over time with charts.
*   **Rich Settings Panel**:
    *   Theme selection (Light/Dark mode).
    *   Motivation type selection.
    *   Sound notification toggle.
    *   Default break duration slider.
    *   Toggle for allowing break extensions.
    *   Information display for the points system.
    *   About section with app version.
*   **Desktop Notifications**: Get notified when tasks or breaks end.
*   **Sound Notifications**: Audible alerts for timer events (toggleable).
*   **Responsive Design**: UI adapts to different screen sizes, designed to fit within a single viewport.
*   **GitHub Pages Deployment Ready**: Configured for easy deployment using `gh-pages`.
*   **Persistence**: All settings are saved to LocalStorage and persist across sessions.
*   **Historical Stats Tracking**: Daily stats are automatically saved and can be visualized in the dashboard.
*   **Data Export/Import**: Export and import your historical stats data for backup or transfer.

## Tech Stack

*   **React**: For building the user interface.
*   **Tailwind CSS**: For styling the application.
*   **Lucide React**: For icons.

## Getting Started

### Prerequisites

*   Node.js (which includes npm or yarn) installed on your system.

### Installation

1.  Clone the repository (if applicable) or download the source files.
2.  Navigate to the project directory:
    ```bash
    cd path/to/annoying-pomodoro
    ```
3.  Install the dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

### Running the Application

```bash
npm start
# or
# yarn start
```
This will start the development server, and you can view the application in your browser, usually at `http://localhost:3000`.

### Deploying to GitHub Pages

1.  Ensure `package.json` has the correct `homepage` URL.
2.  Run the deployment script:
    ```bash
    npm run deploy
    ```
3.  Configure your GitHub repository settings to use the `gh-pages` branch for GitHub Pages.

## Key Components & Logic

*   **`App.js`**: The main application component that manages state for tasks, spirals, timer, score, active view, and all settings. It orchestrates the interactions between various child components and handles core application logic.
*   **Timer Logic**: Core timer functionality (`startTimer`, `handlePauseTimer`, `handleResumeTimer`, `handleTaskDone`, `handleExtendTimer`, `useEffect` for countdown) is primarily managed within `App.js`.
*   **Task Components**:
    *   `TaskForm.jsx`: For adding new tasks.
    *   `TaskList.jsx`: Displays the list of tasks, including an empty state.
    *   `TaskItem.jsx`: Renders individual task items with controls and status indicators.
*   **Spiral Components**:
    *   `SpiralForm.jsx`: For adding new spirals.
    *   `SpiralList.jsx`: Displays the list of spirals with controls.
*   **UI Components (`src/components/ui`)**: Reusable UI elements like `Button.jsx`, `Card.jsx`, `PromptDialog.jsx`.
*   **State Management**: Primarily uses React's `useState`, `useEffect`, and `useCallback` hooks for managing component and application-level state. Settings are persisted to LocalStorage.

## Future Enhancements (Ideas)

*   Customizable notification sound choices.
*   More detailed historical stats or trends.
*   Export/Import tasks or settings. 
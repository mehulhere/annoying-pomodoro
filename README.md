# Annoying Pomodoro

An interactive Pomodoro timer application designed to keep you focused and productive, with a touch of customizable annoyance to ensure you stay on task.

## Features

*   **Task Management**: Add, remove, and mark tasks as complete.
*   **Pomodoro Timer**: Classic Pomodoro timer for focused work sessions.
*   **Customizable Break Timer**: Automatic breaks after task completion, with an option to skip.
*   **Time Extension**: Option to extend the timer if a task needs more time.
*   **Motivational (Annoying) Quotes**: Customizable quote styles (Nagging, Rude, Annoying, Abusive - *to be implemented*) displayed to keep you engaged (or annoyed into action).
*   **Scoring System**: Earn points for completing tasks, with bonuses for finishing early and penalties for extensions.
*   **Spirals (Idea Logging)**: A place to jot down ideas or future tasks without breaking your current focus, which can later be moved to the main task list.
*   **Comprehensive Stats**: 
    *   In-header display: Score, Tasks Completed, current Focus Time.
    *   Daily Stats in Plan view: Total Tasks, Total Planned Time, Remaining Time, P(Not Finishing).
*   **Multiple Views**: 
    *   **Focus View**: Main timer and current task display.
    *   **Plan View**: Task planning, task list, and daily stats.
    *   **Spirals View**: Manage your ideas and future tasks.
    *   **Settings View**: Customize your experience (*partially implemented*).
*   **Desktop Notifications**: Get notified when tasks or breaks end.
*   **Sound Notifications**: Audible alerts for timer events.
*   **Responsive Design**: UI adapts to different screen sizes, designed to fit within a single viewport.
*   **Dark Theme**: Easy on the eyes for extended work sessions (Light mode *to be implemented*).

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

## Key Components & Logic

*   **`App.js`**: The main application component that manages state for tasks, spirals, timer, score, active view, and settings. It orchestrates the interactions between various child components.
*   **Timer Logic**: Core timer functionality (`startTimer`, `handlePauseTimer`, `handleResumeTimer`, `handleTaskDone`, `handleExtendTimer`, `useEffect` for countdown) is primarily managed within `App.js`.
*   **Task Components**:
    *   `TaskForm.jsx`: For adding new tasks.
    *   `TaskList.jsx`: Displays the list of tasks.
    *   `TaskItem.jsx`: Renders individual task items with controls (start, remove) and status indicators (active, paused, done).
*   **Spiral Components**:
    *   `SpiralForm.jsx`: For adding new spirals.
    *   `SpiralList.jsx`: Displays the list of spirals with controls.
*   **UI Components (`src/components/ui`)**: Reusable UI elements like `Button.jsx`, `Card.jsx`, `PromptDialog.jsx`.
*   **State Management**: Primarily uses React's `useState`, `useEffect`, and `useCallback` hooks for managing component and application-level state.

## Future Enhancements (Planned/Requested)

*   Full implementation of various settings:
    *   Light/Dark Mode toggle.
    *   Choice of motivational quote styles (Nagging, Rude, Annoying, Abusive).
    *   Customizable default task/break durations.
    *   Notification sound choices.
*   Calculation and display of "Idle Time" in the header stats.
*   Persistence of tasks and settings (e.g., using LocalStorage). 
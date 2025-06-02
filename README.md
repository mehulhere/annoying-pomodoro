# Annoying Pomodoro

An interactive and opinionated Pomodoro timer application designed to enhance focus and productivity through customizable motivational nudges and comprehensive tracking.

## Description

Annoying Pomodoro helps you manage your tasks and time using the Pomodoro technique, coupled with a unique "annoying" element to keep you accountable. Plan your work, focus with timed sessions, capture stray thoughts, and track your progress over time. It's built as a single-page application for simplicity and speed.

## Features

- **Core Pomodoro Timer:** Implement classic focus and break sessions.
- **Task Management:** Add, organize, and track tasks with estimated and actual time spent.
- **Customizable Motivation:** Choose from different "annoying" quote categories.
- **Break Control:** Configurable default break duration with the option to allow extending breaks.
- **Flexible Time Extension:** Extend active task or break timers as needed (with a penalty for tasks).
- **Points & Scoring:** Earn points based on focus time and efficiency, with deductions for extending tasks.
- **Spirals (Idea Capture):** A dedicated space to quickly save unrelated ideas without disrupting your focus, with the ability to convert them into tasks later.
- **Comprehensive Stats & Dashboard:**
  - Real-time stats in the header (Score, Tasks Done, Focus Time, Idle Time, P(Not Finish)).
  - Daily stats summary in the Plan view.
  - Dedicated Dashboard view with historical charts (Focus Time, Idle Time, Tasks Completed, Score).
  - Data Export/Import for historical stats.
- **Intuitive Navigation:** Easy switching between Focus, Plan, Spirals, Stats, and Settings views via a responsive side/bottom navigation bar.
- **Quick Task Addition:** Add a new task quickly from the Focus view using a dedicated button.
- **Interactive Tutorial:** A step-by-step introduction for first-time users via a modal.
- **Settings Panel:** Personalize themes (Light/Dark), sounds, break durations, motivation type, daily reset time, and quick task button visibility.
- **Notifications:** Desktop and sound notifications for timer events.
- **Persistent Data:** All tasks, spirals, settings, and daily stats are saved locally in your browser (`localStorage`).
- **Responsive Design:** Adapts to various screen sizes and orientations.

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

## Usage

Upon opening the application for the first time, a guided tutorial will appear to walk you through the main features and views.

Here's a quick overview of the main sections:

*   **Focus:** This is your main timer view. Start tasks, pause, resume, mark as done, or extend the timer. Keep an eye on the circular progress and the timer display.
*   **Plan:** Manage your daily tasks here. Add new tasks with estimated durations, and see a summary of your daily productivity stats.
*   **Spirals:** Use this as a temporary notepad for ideas, distractions, or tasks that come to mind during a focus session. You can move items from Spirals to your main Task list later.
*   **Stats:** View your historical productivity data through interactive charts, tracking focus time, idle time, completed tasks, and score over time. You can also export and import this data.
*   **Settings:** Customize the app to your preferences. Change themes, select motivation types, adjust break settings, control sounds, and set your daily reset time.

Use the navigation bar on the left (or bottom on smaller screens) to switch between these views.

## Tech Stack

*   **React**: For building the user interface.
*   **Tailwind CSS**: For styling the application.
*   **Lucide React**: For icons.
*   **Chart.js / react-chartjs-2**: For rendering data visualizations in the Dashboard.

## Key Components & Logic

*   `App.js`: The central component managing application state, core timer logic, task/spiral operations, and settings.
*   `components/`: Contains reusable UI components and view-specific components (`TaskForm`, `TaskList`, `SpiralForm`, `SpiralList`, `DashboardView`, `TaskShortcut`).
*   `lib/statsHistory.js`: Handles the saving, loading, and management of historical daily statistics.
*   State Management: Leverages React hooks (`useState`, `useEffect`, `useCallback`) and `localStorage` for persistence.

## Future Enhancements (Ideas)

*   More detailed historical stats or trends analysis.
*   Customizable notification sound choices.
*   Integration with external task management services.
*   User accounts and cloud sync (more complex).

## License

© 2025 Mehul Pahuja All Rights Reserved.
This copyright applies to all content and commits in this repository unless otherwise noted. 
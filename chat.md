## Chat Summary: Annoying Pomodoro UI/UX and Feature Enhancement

**Initial State:** The user had a TimeBoxing application with a functional Pomodoro timer, task management, and a scoring system. The UI had several areas needing refinement, and new features were requested.

**Key UI/UX Issues Addressed:**

1.  **Task Item Strikethrough**: Improved the appearance of the strikethrough for completed tasks in `TaskItem.jsx` for better visual distinction (thicker, gray line) and added a `CheckCircle` icon.
2.  **"Done!" and "Extend Time" Button Logic**: 
    *   Fixed the "Done!" button being disabled inappropriately after the timer ended.
    *   Ensured the "Extend Time" button correctly reactivates the timer if it was paused/stopped.
3.  **Button Styling Consistency (`Button.jsx`, `App.js`):
    *   Addressed size discrepancies (e.g., Pause button smaller than Done button).
    *   Standardized hover effects to be less contrasting (opacity-based) and more aligned with the dark theme.
    *   Ensured uniform button dimensions (height, padding).
    *   Changed Start/Pause/Resume button variant in `App.js` to `buttonGray` for consistency.
4.  **Task Item Active/Paused State UI (`TaskItem.jsx`):
    *   **Problem**: Incorrect "Start" button showing for active tasks; pause state not clearly indicated.
    *   **Solution Iterations**:
        *   Passed `activeTaskOriginalId`, `isTimerActive`, `isBreakTime`, and `timeRemaining` props down from `App.js` -> `TaskList.jsx` -> `TaskItem.jsx`.
        *   Initially added a "Resume" button for paused tasks.
        *   Changed to a "Paused" badge instead of a "Resume" button, per user request.
        *   Addressed border clipping and layout shifts caused by `scale` transform on active/paused items by removing scaling and relying on ring styles.
        *   Fixed ring clipping by adding padding to the parent `ul` in `TaskList.jsx`.
        *   Ensured the active task's cyan ring (`ring-2 ring-cyanAccent`) is persistent and not just a hover effect by refining conditional class application.

**New Features Implemented:**

1.  **Total Tasks in Daily Stats**: Added a display of the total number of tasks in the "Daily Stats" section in `App.js`.
2.  **Stats Moved to Header**: Relocated Score, Tasks Completed, and Focus Time from the footer to the main header card in `App.js`.
3.  **Enhanced Header Stats UI**: Improved the visual presentation of stats in the header with icons, better typography, and a structured flex layout.
4.  **Multi-View Layout (`App.js`):
    *   Replaced single-scroll page with a tab-like navigation system.
    *   Created "Focus", "Plan", and "Spirals" views, conditionally rendering content.
    *   The main header remains persistent across views.
5.  **Single-Screen Fit & No Page Scroll (`App.js`):
    *   Removed the footer.
    *   Restructured the main layout using `h-screen`, `flex flex-col`, `flex-grow`, and `overflow-auto` on relevant containers to ensure the app fits within the viewport and internal content scrolls where necessary.
6.  **Side Navigation Layout (`App.js`):
    *   Moved view navigation buttons (Focus, Plan, Spirals) to a vertical bar on the left side.
    *   Adjusted header height and overall layout proportions to accommodate this.
7.  **Application Renamed**: Changed the application title from "Time Boxer" to "Annoying Pomodoro".
8.  **Settings View (Initial Setup)**:
    *   Added a "Settings" icon and button to the side navigation.
    *   Created a placeholder card for the "Settings" view.

**Pending User Requests (for future implementation):**

*   **Settings Options**:
    *   Light mode / Dark mode toggle.
    *   Choice of motivation type: Nagging, Rude, Annoying, Abusive.
    *   More settings options (TBD).
*   **Idle Time Stat**: Display "Idle Time" in the header stats (calculated as: `currentTime - firstTaskStartTime + totalFocusTime`).

**Key Files Modified Extensively:**

*   `src/App.js` (state management, layout, timer logic, view rendering)
*   `src/components/TaskItem.jsx` (task item UI, active/paused/completed states, button logic)
*   `src/components/TaskList.jsx` (prop forwarding, list container styling)
*   `src/components/ui/Button.jsx` (styling variants, hover effects, sizing) 
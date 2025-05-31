## Chat Summary: Annoying Pomodoro UI/UX and Feature Enhancement

**Initial State:** The user had a TimeBoxing application with a functional Pomodoro timer, task management, and a scoring system. The UI had several areas needing refinement, and new features were requested.

**Key UI/UX Issues Addressed (Earlier):**

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

**New Features Implemented (Earlier):**

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

**Key Files Modified Extensively (Earlier):**

*   `src/App.js` (state management, layout, timer logic, view rendering)
*   `src/components/TaskItem.jsx` (task item UI, active/paused/completed states, button logic)
*   `src/components/TaskList.jsx` (prop forwarding, list container styling)
*   `src/components/ui/Button.jsx` (styling variants, hover effects, sizing)

---

## Phase 2: Settings Implementation, UI Polish & Scoring Overhaul (Recent Changes)

**Deployment Setup:**

*   **GitHub Pages Configuration**: 
    *   Installed `gh-pages` package.
    *   Updated `package.json` with `homepage` URL (`https://mehulhere.github.io/timeboxing`) and `predeploy`/`deploy` scripts.

**Complete Settings Panel Implementation (`App.js`):**

*   **Motivational Quote Categories**: Added "Nagging", "Rude", "Annoying", and "Abusive" quote types, selectable in settings and persisted in localStorage.
*   **Theme Toggle**: Implemented Light/Dark theme switching, saved to localStorage, and dynamically applied to the `body`.
*   **Sound Notifications Toggle**: Added a setting to enable/disable sound notifications, persisted in localStorage.
*   **Break Duration Slider**: Users can now set the default break duration (1-15 minutes) via a slider; value persisted.
*   **Allow Extending Breaks Toggle**: Added a "Yes/No" setting to control if breaks can be extended, persisted.
*   **Points System Info**: Displayed current point values (per task, extension penalty, new time bonus) in settings.
*   **About Section**: Added an "About" section with app version.
*   **UI Enhancements**: Increased font sizes and icon sizes within the settings panel for better readability and a less cramped appearance, including responsive adjustments for medium screens.
*   **localStorage**: All settings are now saved to and loaded from localStorage.

**UI/UX Refinements (`App.js`, `TaskList.jsx`, `TaskItem.jsx`):**

1.  **TaskList Empty State**: Reduced padding and icon size in the empty state message of `TaskList.jsx`.
2.  **Motivation Type Button Hover**: Changed hover effect for motivation type buttons in settings to `bg-cyanAccent/20` and `text-cyanAccent` for better visibility.
3.  **Header & Navigation Font Sizes**: Increased font size of the main title, motivational quote, stat labels/values in the header, and text in side navigation buttons.
4.  **Timer Control Buttons (Focus View)**:
    *   Increased font size for "Start/Pause/Resume", "Done!/Skip Break", and "Extend" buttons.
    *   Adjusted padding and margins to prevent undue height increases.
    *   Changed "Extend Time" text to "Extend".
5.  **Plan View - "No tasks yet" Centering**: Ensured the "No tasks yet..." message in `TaskList.jsx` is correctly centered vertically and horizontally.
6.  **Plan View - Stat Color**: Changed the bullet point color for "Total Planned" in daily stats to `bg-purple-500` for better visibility.
7.  **Focus View - Break Timer**: 
    *   Corrected the text to show "BREAK IN PROGRESS" (was showing "FOCUS IN PROGRESS").
    *   Changed the timer color during breaks to `text-emerald-400` for visual distinction.
8.  **Focus View - "Extend" Button for Breaks**: Logic updated to allow extending breaks even while the break timer is running (if the setting is enabled). The prompt message was also updated for this context.
9.  **Task List - Completed Task Duration**: Removed the strikethrough from the duration of completed tasks in `TaskItem.jsx`; only color changes now.
10. **Timer Font Size**: Slightly decreased the main timer font (`00:00`) in the Focus view.
11. **Navigation Padding**: Added slight left padding to side navigation buttons.

**Scoring System Overhaul (`App.js`):**

*   **Bonus Points Calculation**: Changed from a per-second-saved model to a percentage-based model. Bonus is now `percentageTimeSaved * MAX_TIME_SAVED_BONUS` (e.g., up to 10 points).
*   This makes the bonus fairer across tasks of different estimated durations.

**Focus Time Stat Enhancement (`App.js`):**

*   The "Focus Time" in the header now accurately reflects the total accumulated time spent on completed tasks plus the time spent so far on the currently running task. It updates live.

**ESLint Warning Fixes:**

*   Resolved various `eslint` warnings across `App.js`, `src/components/ui/Card.jsx`, and `src/hooks/use-toast.js`, including:
    *   Removing unused imports and variables.
    *   Correcting `useCallback` dependency arrays.
    *   Suppressing a `jsx-a11y/heading-has-content` warning for `CardTitle` where usage was correct.
    *   Fixing `no-useless-escape` warnings in toast messages by ensuring correct template literal usage.
    *   Corrected a `ReferenceError: Cannot access 'formatTime' before initialization` by moving helper function definitions.

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
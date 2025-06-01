// DOM Elements
const taskNameInput = document.getElementById('task-name');
const taskDurationInput = document.getElementById('task-duration');
const addTaskBtn = document.getElementById('add-task-btn');
const taskListUl = document.getElementById('task-list');
const totalPlannedTimeSpan = document.getElementById('total-planned-time');
const remainingTaskTimeSpan = document.getElementById('remaining-task-time');
const probNotFinishingSpan = document.getElementById('prob-not-finishing');

const currentTaskNameSpan = document.getElementById('current-task-name');
const timerClockDiv = document.getElementById('timer-clock');
const startTimerBtn = document.getElementById('start-timer-btn');
const pauseTimerBtn = document.getElementById('pause-timer-btn');
const extendTimerBtn = document.getElementById('extend-timer-btn');
const doneBtn = document.getElementById('done-btn');

const spiralTaskInput = document.getElementById('spiral-task-input');
const addToSpiralsBtn = document.getElementById('add-to-spirals-btn');
const spiralsListUl = document.getElementById('spirals-list');

const naggingQuoteP = document.getElementById('nagging-quote');

// App State
let tasks = [];
let spirals = [];
let currentTimer = null;
let timeRemaining = 0;
let currentTaskIndex = -1;  // Index of the task currently loaded in the timer
let timerInterval = null;
let isBreakTime = false;
let score = 0;
const pointsPerTask = 10;
const bonusPointsFactor = 0.5;  // e.g., 0.5 points per second saved
let taskHistory = [];           // For Task History/Log

const motivationalQuotes = [
  'You won\'t be able to do it... Prove me wrong!',
  'Don\'t disappoint future you.', 'Less scrolling, more doing!',
  'That task isn\'t going to complete itself.', 'Are you a talker or a doer?',
  'Time is ticking. Are you?', 'Stop procrastinating. Start dominating.',
  'Is this the best use of your time right now?',
  'The clock is your boss. Don\'t get fired.'
];
let quoteInterval = null;

// Notification Sound
const notificationSound = new Audio('assets/annoyingNotification.mp3');

// Request Notification Permission on Load
if (Notification.permission !== 'granted' &&
    Notification.permission !== 'denied') {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    }
  });
}

function playNotificationSound() {
  notificationSound.play().catch(
      error => console.error('Error playing sound:', error));
}

function showDesktopNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, {body});
  }
}

// --- Task Planning ---
addTaskBtn.addEventListener('click', () => {
  const name = taskNameInput.value.trim();
  const duration = parseInt(taskDurationInput.value);

  if (name && duration > 0) {
    const newTask = {
      id: Date.now(),  // Simple unique ID
      name,
      duration,                     // in minutes, can change with extend
      estimatedDuration: duration,  // Store original estimate in minutes
      completed: false,
      started: false,
      timerStartTime:
          null,  // Timestamp when timer for this task actually started running
      timeSpentSeconds: 0,       // Accumulates actual time spent on this task
      completionTimestamp: null  // When the task was marked as completed
    };
    tasks.push(newTask);
    renderTasks();
    updateDailyStats();
    taskNameInput.value = '';
    taskDurationInput.value = '';
  } else {
    showCustomAlert('Please enter a valid task name and duration.', 'error');
  }
});

function renderTasks() {
  taskListUl.innerHTML = '';  // Clear existing tasks
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
            <span>${task.name} (${task.duration} min)</span>
            <div>
                ${
        !task.started && !task.completed ?
            `<button class="start-task-btn" data-index="${
                index}">Start Task</button>` :
            ''}
                <button class="remove-task-btn" data-id="${
        task.id}">Remove</button>
            </div>
        `;
    if (task.completed) {
      li.style.textDecoration = 'line-through';
      li.style.color = '#888';
    }
    taskListUl.appendChild(li);
  });

  // Add event listeners for start/remove task buttons
  document.querySelectorAll('.start-task-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const taskIndex = parseInt(e.target.dataset.index);
      startTask(taskIndex);
    });
  });

  document.querySelectorAll('.remove-task-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const taskId = parseInt(e.target.dataset.id);
      removeTask(taskId);
    });
  });
}

function removeTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  renderTasks();
  updateDailyStats();
  // If the removed task was the current one, reset timer view
  if (currentTaskIndex !== -1 && tasks[currentTaskIndex] &&
      tasks[currentTaskIndex].id === taskId) {
    resetTimerView();
  }
}

function updateDailyStats() {
  const totalDuration = tasks.reduce(
      (acc, task) => acc + task.estimatedDuration,
      0);  // Use estimatedDuration for total
  const remainingTaskMinutes =
      tasks.filter(task => !task.completed)
          .reduce((acc, task) => acc + task.estimatedDuration, 0);

  totalPlannedTimeSpan.textContent = `${totalDuration}`;
  remainingTaskTimeSpan.textContent = `${remainingTaskMinutes}`;

  calculateAndDisplayProbability();
}

function calculateAndDisplayProbability() {
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(18, 0, 0, 0);  // Assume EOD is 6 PM

  const timeLeftTodayMs = endOfDay.getTime() - now.getTime();
  const timeLeftTodayMinutes =
      Math.max(0, Math.floor(timeLeftTodayMs / (1000 * 60)));

  const remainingUncompletedTaskMinutes =
      tasks.filter(task => !task.completed)
          .reduce((acc, task) => acc + task.estimatedDuration, 0);

  let probabilityNotFinishing = 0;

  if (remainingUncompletedTaskMinutes === 0) {
    probabilityNotFinishing = 0;
  } else if (timeLeftTodayMinutes <= 0) {  // Past EOD or no time left
    probabilityNotFinishing = 1;           // 100%
  } else {
    probabilityNotFinishing =
        Math.min(1, remainingUncompletedTaskMinutes / timeLeftTodayMinutes);
  }

  probNotFinishingSpan.textContent =
      `${(probabilityNotFinishing * 100).toFixed(0)}%`;
}


// --- Timer Logic ---
function startTask(taskIndex) {
  if (timerInterval) {
    clearInterval(timerInterval);  // Clear any existing timer
  }

  const task = tasks[taskIndex];
  if (!task || task.completed) return;

  currentTaskIndex = taskIndex;
  tasks[currentTaskIndex].started = true;
  if (!tasks[currentTaskIndex].timerStartTime) {  // Only set if not already
                                                  // started (e.g. resuming)
    tasks[currentTaskIndex].timerStartTime = Date.now();
  }
  // If timeRemaining is already set (e.g. from a reset or previous pause), use
  // it. Otherwise, initialize from task.duration.
  if (timeRemaining <= 0 ||
      tasks[currentTaskIndex].name !== currentTaskNameSpan.textContent) {
    timeRemaining = task.duration * 60;  // Convert minutes to seconds
  }

  currentTaskNameSpan.textContent = task.name;
  updateTimerDisplay();
  renderTasks();  // Re-render to hide "Start Task" button for this task

  startTimerBtn.disabled = true;
  pauseTimerBtn.disabled = false;
  extendTimerBtn.disabled = true;  // Enable extend only when time is up

  timerInterval = setInterval(() => {
    timeRemaining--;
    tasks[currentTaskIndex].timeSpentSeconds++;  // Increment time spent
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      extendTimerBtn.disabled = false;  // Enable extend when time is up
      // Notify that time is up, but task is not yet "finished"
      const currentTaskName = tasks[currentTaskIndex] ?
          tasks[currentTaskIndex].name :
          'Current Task';
      playNotificationSound();  // Or a different sound for "time is up"
      showDesktopNotification(
          'Time\'s Up!',
          `Time is up for "${
              currentTaskName}". You can extend it or mark it as done.`);
      // The timer will show 00:00, task remains active for "Done!" or "Extend"
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  if (isBreakTime) {
    timerClockDiv.style.color = '#00d1b2';  // Default teal for break time
  } else {
    if (currentTaskIndex !== -1 && tasks[currentTaskIndex]) {
      const task = tasks[currentTaskIndex];
      const totalTaskSeconds = task.estimatedDuration * 60;
      if (totalTaskSeconds >
          0) {  // Avoid division by zero for tasks with no duration
        const percentageRemaining = (timeRemaining / totalTaskSeconds) * 100;

        if (percentageRemaining <= 20) {
          timerClockDiv.style.color = '#dc3545';  // Red
        } else if (percentageRemaining <= 50) {
          timerClockDiv.style.color = '#ffc107';  // Yellow
        } else {
          timerClockDiv.style.color = '#00d1b2';  // Default Teal for tasks
        }
      } else {
        timerClockDiv.style.color =
            '#00d1b2';  // Default if task has no duration
      }
    } else {
      timerClockDiv.style.color = '#00d1b2';  // Default if no current task
    }
  }

  timerClockDiv.textContent =
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  stopNaggingQuoteInterval();  // Stop quotes when timer is active
}

function taskFinished() {
  const finishedTaskName = tasks[currentTaskIndex].name;
  const task = tasks[currentTaskIndex];
  let pointsEarnedThisTask = pointsPerTask;

  // Score calculation
  const estimatedSeconds = task.estimatedDuration * 60;
  if (task.timeSpentSeconds < estimatedSeconds) {
    const secondsSaved = estimatedSeconds - task.timeSpentSeconds;
    const bonus = Math.floor(secondsSaved * bonusPointsFactor);
    pointsEarnedThisTask += bonus;
    console.log(
        `Task finished early! Saved ${secondsSaved}s, +${bonus} bonus points.`);
  }
  score += pointsEarnedThisTask;
  updateScoreDisplay();
  showScorePopup(pointsEarnedThisTask);  // Show animated score

  playNotificationSound();  // This is for task completion, distinct from time
                            // up
  showDesktopNotification(
      'Task Finished!', `Your task "${finishedTaskName}" is complete.`);

  tasks[currentTaskIndex].completed = true;
  tasks[currentTaskIndex].duration =
      0;  // Mark duration as 0 for remaining time calculation
  tasks[currentTaskIndex].timerStartTime =
      null;  // Reset for next potential run (though completed)
  tasks[currentTaskIndex].completionTimestamp = Date.now();

  // Add to task history
  taskHistory.push({
    name: task.name,
    estimatedDurationMinutes: task.estimatedDuration,
    timeSpentSeconds: task.timeSpentSeconds,
    completedAt: new Date(task.completionTimestamp).toLocaleString()
  });
  console.log('Task History:', taskHistory);  // Log history for now

  updateDailyStats();
  renderTasks();
  resetTimerView();             // Reset view for the next task
  startNaggingQuoteInterval();  // Restart quotes when timer stops
                                // Potentially auto-start next task or break
}

startTimerBtn.addEventListener('click', () => {
  if (isBreakTime && timerInterval === null && timeRemaining > 0) {
    // Resume a paused break
    startTimerBtn.disabled = true;
    pauseTimerBtn.disabled = false;
    // extendTimerBtn and doneBtn should already be appropriately set from
    // startBreak/pause

    timerInterval = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        isBreakTime = false;
        showCustomAlert('Break finished! Time for the next task?', 'info');
        playNotificationSound();
        showDesktopNotification(
            'Break Over!', 'Your break time is up. Ready for the next task?');
        resetTimerView();
        doneBtn.disabled = false;
        startNaggingQuoteInterval();
      }
    }, 1000);
    stopNaggingQuoteInterval();

  } else if (currentTaskIndex === -1) {
    // Start the first unstarted task if no task is active in timer
    const firstUnstartedTaskIndex =
        tasks.findIndex(task => !task.completed && !task.started);
    if (firstUnstartedTaskIndex !== -1) {
      startTask(firstUnstartedTaskIndex);
      stopNaggingQuoteInterval();
    }
  } else if (
      timerInterval === null && timeRemaining > 0 && currentTaskIndex !== -1 &&
      tasks[currentTaskIndex] &&
      !tasks[currentTaskIndex]
           .completed) {  // Paused state (Resume) for an uncompleted task
    // Resume timer
    tasks[currentTaskIndex].started = true;
    if (!tasks[currentTaskIndex].timerStartTime) {
      tasks[currentTaskIndex].timerStartTime = Date.now() -
          ((tasks[currentTaskIndex].duration * 60) - timeRemaining) * 1000;
    }
    startTimerBtn.disabled = true;
    pauseTimerBtn.disabled = false;
    extendTimerBtn.disabled = true;  // Keep extend disabled unless time is up

    timerInterval = setInterval(() => {
      timeRemaining--;
      tasks[currentTaskIndex].timeSpentSeconds++;
      updateTimerDisplay();
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        extendTimerBtn.disabled = false;  // Enable extend when time is up
        // taskFinished(); // DO NOT call taskFinished() here anymore
        const currentTaskName = tasks[currentTaskIndex] ?
            tasks[currentTaskIndex].name :
            'Current Task';
        playNotificationSound();
        showDesktopNotification(
            'Time\'s Up!',
            `Time is up for "${
                currentTaskName}". You can extend it or mark it as done.`);
      }
    }, 1000);
    stopNaggingQuoteInterval();
  }
});

pauseTimerBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  startNaggingQuoteInterval();
});

extendTimerBtn.addEventListener('click', () => {
  if (isBreakTime && timerInterval) {  // Handle break extension
    const extensionMinutes =
        parseInt(prompt('Extend break by how many minutes?', '5'));
    if (!isNaN(extensionMinutes) && extensionMinutes > 0) {
      timeRemaining += extensionMinutes * 60;
      updateTimerDisplay();
      // No need to disable extendTimerBtn here, user might want to extend again
    } else if (extensionMinutes !== null) {
      showCustomAlert(
          'Please enter a valid number of minutes for the break.', 'error');
    }
  } else if (timeRemaining <= 0 && currentTaskIndex !== -1) {  // Handle task
                                                               // extension
                                                               // (when time is
                                                               // up)
    const extensionMinutes =
        parseInt(prompt('Extend task by how many minutes?', '5'));
    if (!isNaN(extensionMinutes) && extensionMinutes > 0) {
      timeRemaining += extensionMinutes * 60;
      tasks[currentTaskIndex].duration +=
          extensionMinutes;  // Update task's own duration record if needed for
                             // stats
      tasks[currentTaskIndex].completed =
          false;  // Task is no longer considered completed if extended

      updateTimerDisplay();
      extendTimerBtn.disabled = true;  // Disable after extending
      startTimerBtn.disabled = true;   // Should be if timer restarts
      pauseTimerBtn.disabled = false;

      // Restart the timer interval
      if (timerInterval)
        clearInterval(timerInterval);  // Clear any lingering interval if any
      timerInterval = setInterval(() => {
        timeRemaining--;
        tasks[currentTaskIndex].timeSpentSeconds++;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          extendTimerBtn.disabled = false;  // Re-enable if it hits zero again
          taskFinished();                   // Call full task finished logic
        }
      }, 1000);
      stopNaggingQuoteInterval();
    } else if (extensionMinutes !== null) {
      showCustomAlert(
          'Please enter a valid number of minutes for the task extension.',
          'error');
    }
  }
});

doneBtn.addEventListener('click', () => {
  if (isBreakTime) {  // If currently in a break
    clearInterval(timerInterval);
    timerInterval = null;
    isBreakTime = false;
    showCustomAlert('Break ended!', 'info');
    playNotificationSound();
    showDesktopNotification('Break Ended', 'You chose to end your break.');
    resetTimerView();
    doneBtn.disabled = false;
    startNaggingQuoteInterval();
  } else if (
      currentTaskIndex !== -1 && tasks[currentTaskIndex] &&
      !tasks[currentTaskIndex].completed) {
    // This is the main task completion logic via "Done!" button
    // It handles both cases: timer still running, or timer ran out
    // (timeRemaining <= 0)

    if (timerInterval) {  // If timer was still running, clear it
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Confetti for clicking "Done!"
    if (typeof confetti === 'function') {
      confetti({particleCount: 150, spread: 100, origin: {y: 0.6}});
    }

    taskFinished();  // This will mark as complete, give points, show score
                     // popup etc.

    // After task is marked done, offer a break
    // We could make this a custom prompt later: "Task done! Start a break?"
    startBreak(5);

  } else if (
      currentTaskIndex !== -1 && tasks[currentTaskIndex] &&
      tasks[currentTaskIndex].completed) {
    // If current task is already completed and user clicks "Done!" (e.g. after
    // a break, before starting new task) Simply start another break or do
    // nothing, depends on desired UX. For now, let's assume it means they want
    // another break or to signify end of work block.
    showCustomAlert('No active task to complete. Starting a break.', 'info');
    startBreak(5);
  } else if (currentTaskIndex === -1) {
    // No task was ever active in the timer section, user clicks "Done!"
    showCustomAlert(
        'No active task. Plan a task or select one to start!', 'info');
  } else {
    // Fallback for any other unhandled cases, perhaps show an info message
    // This was previously trying to add a spiral task, which was incorrect
    // here.
    showCustomAlert('No action taken. Select a task or start a break.', 'info');
  }
});

function startBreak(durationMinutes) {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  resetTimerView();  // Clear current task timer stuff

  isBreakTime = true;
  timeRemaining = durationMinutes * 60;
  currentTaskNameSpan.textContent = 'Break Time!';
  updateTimerDisplay();

  startTimerBtn.disabled = true;
  pauseTimerBtn.disabled = false;   // Allow pausing break
  extendTimerBtn.disabled = false;  // << ENABLE extend for breaks
  doneBtn.disabled = false;  // << ENABLE done for breaks (to end it early)

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      isBreakTime = false;
      showCustomAlert('Break finished! Time for the next task?', 'info');
      playNotificationSound();
      showDesktopNotification(
          'Break Over!', 'Your break time is up. Ready for the next task?');
      resetTimerView();
      doneBtn.disabled = false;
      startNaggingQuoteInterval();  // Restart quotes when break finishes
      // Consider what happens after break: prompt for next task?
    }
  }, 1000);
}


// --- Spirals Logic ---
addToSpiralsBtn.addEventListener('click', () => {
  const spiralName = spiralTaskInput.value.trim();
  if (spiralName) {
    spirals.push({id: Date.now(), name: spiralName});
    renderSpirals();
    spiralTaskInput.value = '';
  } else {
    showCustomAlert('Please enter a name for the spiral task.', 'error');
  }
});

function renderSpirals() {
  spiralsListUl.innerHTML = '';
  spirals.forEach((spiral, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
            <span>${spiral.name}</span>
            <div>
                <button class="move-to-tasks-btn" data-index="${
        index}">Move to Tasks</button>
                <button class="remove-spiral-btn" data-id="${
        spiral.id}">Remove</button>
            </div>
        `;
    spiralsListUl.appendChild(li);
  });

  // Add event listeners for move/remove spiral buttons
  document.querySelectorAll('.move-to-tasks-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const spiralIndex = parseInt(e.target.dataset.index);
      moveSpiralToTasks(spiralIndex);
    });
  });

  document.querySelectorAll('.remove-spiral-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const spiralId = parseInt(e.target.dataset.id);
      removeSpiral(spiralId);
    });
  });
}

function removeSpiral(spiralId) {
  spirals = spirals.filter(spiral => spiral.id !== spiralId);
  renderSpirals();
}

function moveSpiralToTasks(spiralIndex) {
  const spiralToMove = spirals[spiralIndex];
  if (!spiralToMove) return;

  // Prompt for duration when moving to tasks
  const duration = prompt(
      `Enter estimated duration (minutes) for task "${spiralToMove.name}":`,
      '30');
  const taskDuration = parseInt(duration);

  if (taskDuration && taskDuration > 0) {
    tasks.push({
      id: Date.now(),
      name: spiralToMove.name,
      duration: taskDuration,
      estimatedDuration: taskDuration,
      completed: false,
      started: false
    });
    spirals.splice(spiralIndex, 1);  // Remove from spirals
    renderTasks();
    renderSpirals();
    updateDailyStats();
  } else if (duration !== null) {  // If prompt was not cancelled but value is
                                   // invalid
    showCustomAlert(
        'Invalid duration. Please enter a positive number for the task moved from spirals.',
        'error');
  }
}

// --- Scoring & Probability ---
// (Will be implemented later)

// --- Motivational Quotes ---
function getRandomQuote() {
  return motivationalQuotes[Math.floor(
      Math.random() * motivationalQuotes.length)];
}

function updateNaggingQuote() {
  naggingQuoteP.textContent = getRandomQuote();
}

function startNaggingQuoteInterval() {
  if (!timerInterval && !isBreakTime &&
      !quoteInterval) {  // Only start if no main/break timer and no quote timer
                         // already running
    updateNaggingQuote();  // Show one immediately
    quoteInterval =
        setInterval(updateNaggingQuote, 30000);  // Update every 30 seconds
    console.log('Quote interval started');
  }
}

function stopNaggingQuoteInterval() {
  clearInterval(quoteInterval);
  quoteInterval = null;
  console.log('Quote interval stopped');
}

// --- Event Listeners ---
// (Will be added as features are implemented)

function resetTimerView() {
  clearInterval(timerInterval);
  timerInterval = null;
  timeRemaining = 0;
  currentTaskIndex = -1;
  currentTaskNameSpan.textContent = 'None';
  timerClockDiv.textContent = '00:00';
  timerClockDiv.style.color = '#00d1b2';  // Reset color to default teal
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  extendTimerBtn.disabled = true;  // Should be disabled until time is up
  isBreakTime = false;
}

function updateScoreDisplay() {
  const scoreFooter = document.querySelector('footer p');
  const tasksCompletedToday = tasks.filter(t => t.completed).length;
  const totalFocusTimeSeconds =
      taskHistory.reduce((acc, entry) => acc + entry.timeSpentSeconds, 0);
  const totalFocusTimeMinutes = Math.floor(totalFocusTimeSeconds / 60);

  scoreFooter.textContent = `Score: ${score} | Tasks Completed: ${
      tasksCompletedToday} | Focus Time: ${totalFocusTimeMinutes} min`;
}

function showScorePopup(points) {
  const popup = document.createElement('div');
  popup.textContent = `+${points}`;
  popup.className = 'score-popup';
  document.body.appendChild(popup);

  // Trigger show animation
  setTimeout(() => {
    popup.classList.add('show');
  }, 10);

  // Trigger hide animation then remove popup
  setTimeout(() => {
    popup.classList.remove('show');  // Optional: remove show if it interferes
    popup.classList.add('hide');
  }, 1500);  // Start hide animation after 1.5s

  setTimeout(() => {
    popup.remove();
  }, 1900);  // Remove from DOM after hide animation (0.4s duration for hide)
}

function showCustomAlert(message, type = 'info') {
  // Remove any existing alert first
  const existingAlert = document.querySelector('.custom-alert-overlay');
  if (existingAlert) {
    existingAlert.remove();
  }

  const overlay = document.createElement('div');
  overlay.className = 'custom-alert-overlay';

  const alertBox = document.createElement('div');
  alertBox.className = 'custom-alert-box';
  if (type === 'error') {
    alertBox.classList.add('error');
  }

  const messageP = document.createElement('p');
  messageP.textContent = message;

  const closeButton = document.createElement('button');
  closeButton.textContent = 'OK';
  closeButton.onclick = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 200);  // Allow fade out animation
  };

  alertBox.appendChild(messageP);
  alertBox.appendChild(closeButton);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);

  // Trigger show animation
  setTimeout(() => overlay.classList.add('show'), 10);

  // Focus the button so Enter key works
  closeButton.focus();

  // Allow closing with Escape key
  function escapeListener(event) {
    if (event.key === 'Escape') {
      closeButton.click();  // This will also trigger removal of listener via
                            // closeButton.onclick
    }
  }
  // Add listener, and ensure it's removed when alert is closed
  document.addEventListener('keydown', escapeListener);
  const oldOnClick = closeButton.onclick;
  closeButton.onclick = () => {
    oldOnClick();
    document.removeEventListener('keydown', escapeListener);
  };
}

console.log('Time Boxer script loaded!');
// Initial render and stats update
renderTasks();
updateDailyStats();
updateScoreDisplay();         // Initialize score display
startNaggingQuoteInterval();  // Start quotes on page load if no timer is active
function removeSpiral(spiralId) {
    spirals = spirals.filter(spiral => spiral.id !== spiralId);
    renderSpirals();
}

function moveSpiralToTasks(spiralIndex) {
    const spiralToMove = spirals[spiralIndex];
    if (!spiralToMove) return;

    // Prompt for duration when moving to tasks
    const duration = prompt(`Enter estimated duration (minutes) for task "${spiralToMove.name}":`, "30");
    const taskDuration = parseInt(duration);

    if (taskDuration && taskDuration > 0) {
        tasks.push({
            id: Date.now(),
            name: spiralToMove.name,
            duration: taskDuration,
            estimatedDuration: taskDuration,
            completed: false,
            started: false
        });
        spirals.splice(spiralIndex, 1); // Remove from spirals
        renderTasks();
        renderSpirals();
        updateDailyStats();
    } else if (duration !== null) { // If prompt was not cancelled but value is invalid
        showCustomAlert("Invalid duration. Please enter a positive number for the task moved from spirals.", "error");
    }
}

// --- Scoring & Probability --- 
// (Will be implemented later)

// --- Motivational Quotes --- 
function getRandomQuote() {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

function updateNaggingQuote() {
    naggingQuoteP.textContent = getRandomQuote();
}

function startNaggingQuoteInterval() {
    if (!timerInterval && !isBreakTime && !quoteInterval) { // Only start if no main/break timer and no quote timer already running
        updateNaggingQuote(); // Show one immediately
        quoteInterval = setInterval(updateNaggingQuote, 30000); // Update every 30 seconds
        console.log("Quote interval started");
    }
}

function stopNaggingQuoteInterval() {
    clearInterval(quoteInterval);
    quoteInterval = null;
    console.log("Quote interval stopped");
}

// --- Event Listeners --- 
// (Will be added as features are implemented)

function resetTimerView() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeRemaining = 0;
    currentTaskIndex = -1;
    currentTaskNameSpan.textContent = "None";
    timerClockDiv.textContent = "00:00";
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
    extendTimerBtn.disabled = true; // Should be disabled until time is up
    isBreakTime = false;
}

function updateScoreDisplay() {
    const scoreFooter = document.querySelector('footer p');
    const tasksCompletedToday = tasks.filter(t => t.completed).length;
    const totalFocusTimeSeconds = taskHistory.reduce((acc, entry) => acc + entry.timeSpentSeconds, 0);
    const totalFocusTimeMinutes = Math.floor(totalFocusTimeSeconds / 60);

    scoreFooter.textContent = `Score: ${score} | Tasks Completed: ${tasksCompletedToday} | Focus Time: ${totalFocusTimeMinutes} min`;
}

function showScorePopup(points) {
    const popup = document.createElement('div');
    popup.textContent = `+${points}`;
    popup.className = 'score-popup';
    document.body.appendChild(popup);

    // Trigger show animation
    setTimeout(() => {
        popup.classList.add('show');
    }, 10); 

    // Trigger hide animation then remove popup
    setTimeout(() => {
        popup.classList.remove('show'); // Optional: remove show if it interferes
        popup.classList.add('hide');
    }, 1500); // Start hide animation after 1.5s

    setTimeout(() => {
        popup.remove();
    }, 1900); // Remove from DOM after hide animation (0.4s duration for hide)
}

function showCustomAlert(message, type = 'info') {
    // Remove any existing alert first
    const existingAlert = document.querySelector('.custom-alert-overlay');
    if (existingAlert) {
        existingAlert.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';

    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert-box';
    if (type === 'error') {
        alertBox.classList.add('error');
    }

    const messageP = document.createElement('p');
    messageP.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'OK';
    closeButton.onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 200); // Allow fade out animation
    };

    alertBox.appendChild(messageP);
    alertBox.appendChild(closeButton);
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);

    // Trigger show animation
    setTimeout(() => overlay.classList.add('show'), 10);
    
    // Focus the button so Enter key works
    closeButton.focus(); 

    // Allow closing with Escape key
    function escapeListener(event) {
        if (event.key === 'Escape') {
            closeButton.click(); // This will also trigger removal of listener via closeButton.onclick
        }
    }
    // Add listener, and ensure it's removed when alert is closed
    document.addEventListener('keydown', escapeListener);
    const oldOnClick = closeButton.onclick;
    closeButton.onclick = () => {
        oldOnClick();
        document.removeEventListener('keydown', escapeListener);
    };
}

console.log("Time Boxer script loaded!");
// Initial render and stats update
renderTasks();
updateDailyStats();
updateScoreDisplay(); // Initialize score display
startNaggingQuoteInterval(); // Start quotes on page load if no timer is active 
  timerClockDiv.style.color = '#00d1b2';  // Reset color to default teal
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  extendTimerBtn.disabled = true;  // Should be disabled until time is up
  isBreakTime = false;
}

function updateScoreDisplay() {
  const scoreFooter = document.querySelector('footer p');
  const tasksCompletedToday = tasks.filter(t => t.completed).length;
  const totalFocusTimeSeconds =
      taskHistory.reduce((acc, entry) => acc + entry.timeSpentSeconds, 0);
  const totalFocusTimeMinutes = Math.floor(totalFocusTimeSeconds / 60);

  scoreFooter.textContent = `Score: ${score} | Tasks Completed: ${
      tasksCompletedToday} | Focus Time: ${totalFocusTimeMinutes} min`;
}

function showScorePopup(points) {
  const popup = document.createElement('div');
  popup.textContent = `+${points}`;
  popup.className = 'score-popup';
  document.body.appendChild(popup);

  // Trigger show animation
  setTimeout(() => {
    popup.classList.add('show');
  }, 10);

  // Trigger hide animation then remove popup
  setTimeout(() => {
    popup.classList.remove('show');  // Optional: remove show if it interferes
    popup.classList.add('hide');
  }, 1500);  // Start hide animation after 1.5s

  setTimeout(() => {
    popup.remove();
  }, 1900);  // Remove from DOM after hide animation (0.4s duration for hide)
}

function showCustomAlert(message, type = 'info') {
  // Remove any existing alert first
  const existingAlert = document.querySelector('.custom-alert-overlay');
  if (existingAlert) {
    existingAlert.remove();
  }

  const overlay = document.createElement('div');
  overlay.className = 'custom-alert-overlay';

  const alertBox = document.createElement('div');
  alertBox.className = 'custom-alert-box';
  if (type === 'error') {
    alertBox.classList.add('error');
  }

  const messageP = document.createElement('p');
  messageP.textContent = message;

  const closeButton = document.createElement('button');
  closeButton.textContent = 'OK';
  closeButton.onclick = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 200);  // Allow fade out animation
  };

  alertBox.appendChild(messageP);
  alertBox.appendChild(closeButton);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);

  // Trigger show animation
  setTimeout(() => overlay.classList.add('show'), 10);

  // Focus the button so Enter key works
  closeButton.focus();

  // Allow closing with Escape key
  function escapeListener(event) {
    if (event.key === 'Escape') {
      closeButton.click();  // This will also trigger removal of listener via
                            // closeButton.onclick
    }
  }
  // Add listener, and ensure it's removed when alert is closed
  document.addEventListener('keydown', escapeListener);
  const oldOnClick = closeButton.onclick;
  closeButton.onclick = () => {
    oldOnClick();
    document.removeEventListener('keydown', escapeListener);
  };
}

console.log('Time Boxer script loaded!');
// Initial render and stats update
renderTasks();
updateDailyStats();
updateScoreDisplay();         // Initialize score display
startNaggingQuoteInterval();  // Start quotes on page load if no timer is active
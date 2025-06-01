import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { Toaster } from './components/Toaster';
import { toast } from './hooks/use-toast';
import confetti from 'canvas-confetti';
import { PromptDialog } from './components/ui/PromptDialog';
import SpiralForm from './components/SpiralForm';
import SpiralList from './components/SpiralList';
import { Award, CheckCircle, Timer, Settings, Coffee } from 'lucide-react';
// Spirals components will be added later

const motivationalQuotes = [
  "You won\'t be able to do it... Prove me wrong!",
  "Don\'t disappoint future you.",
  "Less scrolling, more doing!",
  "That task isn\'t going to complete itself.",
  "Are you a talker or a doer?",
  "Time is ticking. Are you?",
  "Stop procrastinating. Start dominating.",
  "Is this the best use of your time right now?",
  "The clock is your boss. Don\'t get fired."
];

const POINTS_PER_TASK = 10;
const BONUS_POINTS_FACTOR = 0.5; // points per second saved
const DEFAULT_BREAK_DURATION_MINUTES = 5;
const POINTS_DEDUCTION_FOR_EXTENSION = 2; // Penalty for extending a task

function App() {
  const [naggingQuote, setNaggingQuote] = useState("");
  const [tasks, setTasks] = useState([]);
  const [spirals, setSpirals] = useState([]); // For spirals feature
  
  const [currentTaskIndex, setCurrentTaskIndex] = useState(-1); // Index of the active task in the tasks array
  const [timeRemaining, setTimeRemaining] = useState(0); // In seconds
  const [isTimerActive, setIsTimerActive] = useState(false); // Is the countdown interval running?
  const [isBreakTime, setIsBreakTime] = useState(false);
  const timerIntervalId = useRef(null); // Using useRef to hold interval ID to avoid re-renders causing issues
  
  const [score, setScore] = useState(0);
  const notificationSound = useRef(null);
  const quoteIntervalId = useRef(null);

  // State for PromptDialog
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptConfig, setPromptConfig] = useState({
    title: '',
    message: '',
    inputLabel: '',
    defaultValue: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    placeholder: '',
  });

  const [activeView, setActiveView] = useState('focus'); // 'focus', 'plan', 'spirals', 'settings'
  const [sessionStartTime, setSessionStartTime] = useState(null); // Timestamp when the first task of the session started
  const [displayedIdleTime, setDisplayedIdleTime] = useState(0); // Idle time in seconds

  // Initialize nagging quote, sound, and notification permissions
  useEffect(() => {
    const getRandomQuote = () => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setNaggingQuote(getRandomQuote());
    notificationSound.current = new Audio('/assets/AnnoyingannoyingNotification.mp3');

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") console.log("Desktop notification permission granted.");
      });
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    notificationSound.current?.play().catch(error => console.error("Error playing sound:", error));
  }, []);

  const showDesktopNotification = useCallback((title, body) => {
    if (Notification.permission === "granted") new Notification(title, { body });
  }, []);

  // Nagging quote logic
  const updateNaggingQuote = useCallback(() => {
    const getRandomQuote = () => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setNaggingQuote(getRandomQuote());
  }, [])

  const startNaggingQuoteInterval = useCallback(() => {
    if (!isTimerActive && !quoteIntervalId.current) {
      updateNaggingQuote();
      quoteIntervalId.current = setInterval(updateNaggingQuote, 30000);
    }
  }, [isTimerActive, updateNaggingQuote]);

  const stopNaggingQuoteInterval = useCallback(() => {
    if (quoteIntervalId.current) {
      clearInterval(quoteIntervalId.current);
      quoteIntervalId.current = null;
    }
  }, []);

  useEffect(() => {
    if (isTimerActive) {
      stopNaggingQuoteInterval();
    } else {
      startNaggingQuoteInterval();
    }
    return () => stopNaggingQuoteInterval(); // Cleanup on unmount
  }, [isTimerActive, startNaggingQuoteInterval, stopNaggingQuoteInterval]);


  // Task Management
  const handleAddTask = useCallback((newTaskData) => {
    setTasks(prevTasks => [
      ...prevTasks,
      {
        id: Date.now(),
        name: newTaskData.name,
        duration: newTaskData.duration, // user input in minutes
        estimatedDuration: newTaskData.duration,
        completed: false,
        started: false,
        timeSpentSeconds: 0,
        timerStartTime: null,
        completionTimestamp: null,
      }
    ]);
    toast({ title: "Task Added", description: `"${newTaskData.name}" added to your list.` });
  }, []);

  const handleRemoveTask = useCallback((taskId) => {
    const taskToRemove = tasks.find(t => t.id === taskId);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    if (taskToRemove) {
      toast({ title: "Task Removed", description: `"${taskToRemove.name}" has been removed.`, variant: "destructive" });
    }
    if (currentTaskIndex !== -1 && tasks[currentTaskIndex]?.id === taskId) {
      if (timerIntervalId.current) clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
      setCurrentTaskIndex(-1);
      setTimeRemaining(0);
      setIsTimerActive(false);
      setIsBreakTime(false);
    }
  }, [tasks, currentTaskIndex]);

  // Timer Core Logic: Start, Pause, Resume, Done, Extend
  const startTimer = useCallback((taskIndex) => {
    // Guard 1: Basic validity and completion check
    if (taskIndex < 0 || taskIndex >= tasks.length || !tasks[taskIndex]) {
      toast({ title: "Invalid Task", description: "Task not found or index is out of bounds.", variant: "destructive" });
      return;
    }
    if (tasks[taskIndex].completed) {
      toast({ title: "Task Completed", description: `"${tasks[taskIndex].name}" is already completed.`, variant: "default" });
      return;
    }

    // Guard 2: Check if another task is active or this specific one
    if (isTimerActive && !isBreakTime && currentTaskIndex === taskIndex) {
      toast({ title: "Already Active", description: `"${tasks[taskIndex].name}" is already running.`, variant: "default" });
      return;
    }
    if (isTimerActive && !isBreakTime && currentTaskIndex !== -1 && currentTaskIndex !== taskIndex) { 
      toast({ title: "Timer Busy", description: `"${tasks[currentTaskIndex]?.name || 'Another task'}" is in progress. Complete or stop it first.`, variant: "destructive" });
      return;
    }
    
    // Guard 3: Handle active break
    if (isBreakTime) { 
      if (timerIntervalId.current) clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
      setIsBreakTime(false); // Stop the break
      toast({ title: "Break Interrupted", description: "Starting a new task." });
    }

    // Set session start time if this is the very first task being started
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }

    const taskToStart = tasks[taskIndex];

    // This extra check is for absolute safety, though guards above should cover it.
    if (!taskToStart || typeof taskToStart.duration === 'undefined') {
        console.error("Critical error: taskToStart is invalid despite guards. taskIndex:", taskIndex, "task:", taskToStart);
        toast({ title: "Task Data Error", description: "Cannot start task due to incomplete data. Please check console.", variant: "destructive" });
        return;
    }
    
    setTasks(prevTasks =>
      prevTasks.map((task, idx) =>
        idx === taskIndex ? { ...task, started: true, timerStartTime: Date.now(), timeSpentSeconds: task.timeSpentSeconds || 0 } : task
      )
    );
    setCurrentTaskIndex(taskIndex);
    // If task was partially worked on, resume from remaining, else from full duration
    const timeToSet = (taskToStart.duration * 60) - (taskToStart.timeSpentSeconds || 0);
    setTimeRemaining(timeToSet > 0 ? timeToSet : taskToStart.duration * 60); // Ensure it doesn't start negative
    setIsTimerActive(true);
    setIsBreakTime(false); // Ensure break mode is off
    toast({ title: "Task Started", description: `Timer for "${taskToStart.name}" has begun.` });
  }, [tasks, isTimerActive, isBreakTime, currentTaskIndex]);

  const handlePauseTimer = useCallback(() => {
    if (timerIntervalId.current) { // If interval exists, it means it was active
      clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
      setIsTimerActive(false); // Timer is no longer actively ticking
      toast({ title: isBreakTime ? "Break Paused" : "Timer Paused" });
    }
  }, [isBreakTime]); // setIsTimerActive is stable and doesn't need to be a dependency

  const handleResumeTimer = useCallback(() => {
    // Conditions to resume: must not be already set to active, must have time, and a context (task or break)
    if (!isTimerActive && timeRemaining > 0 && 
        ((currentTaskIndex !== -1 && tasks[currentTaskIndex] && !tasks[currentTaskIndex].completed && !isBreakTime) || isBreakTime)) {
       setIsTimerActive(true); // Signal the useEffect to start the interval
       toast({ title: isBreakTime ? "Break Resumed" : "Timer Resumed" });
    }
  }, [isTimerActive, timeRemaining, currentTaskIndex, tasks, isBreakTime]); // tasks is needed for tasks[currentTaskIndex]

  const handleTaskDone = useCallback(() => {
    if (currentTaskIndex === -1 || !tasks[currentTaskIndex] || tasks[currentTaskIndex].completed) {
      toast({title: "No Active Task", description: "No task to mark as done.", variant: "default"});
      return;
    }

    const task = tasks[currentTaskIndex];
    let pointsEarnedThisTask = POINTS_PER_TASK;
    // Calculate timeSpent more accurately based on when 'Done' is clicked relative to timer
    const timeWhenDone = task.timerStartTime ? (Date.now() - task.timerStartTime) / 1000 : task.timeSpentSeconds;
    const actualTimeSpent = timeWhenDone < task.duration * 60 ? timeWhenDone : task.duration * 60; // Cap at original duration for bonus calc

    const estimatedSeconds = task.estimatedDuration * 60;
    if (actualTimeSpent < estimatedSeconds) {
      const secondsSaved = estimatedSeconds - actualTimeSpent;
      const bonus = Math.floor(secondsSaved * BONUS_POINTS_FACTOR);
      pointsEarnedThisTask += bonus;
    }
    setScore(prevScore => prevScore + pointsEarnedThisTask);
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

    setTasks(prevTasks => prevTasks.map((t, idx) =>
      idx === currentTaskIndex ? { 
        ...t, 
        completed: true, 
        timeSpentSeconds: actualTimeSpent, // Update with more precise time
        duration: actualTimeSpent / 60, // Reflect actual time in duration field for display/stats if needed
        completionTimestamp: Date.now() 
      } : t
    ));

    if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
    }
    setIsTimerActive(false); // Task timer is now definitively stopped.
    
    playNotificationSound();
    showDesktopNotification("Task Finished!", `"${task.name}" is complete.`);
    toast({ title: "Task Finished!", description: `"${task.name}" complete. Points: +${pointsEarnedThisTask}` });
    
    // Start a break automatically
    setIsBreakTime(true);
    setTimeRemaining(DEFAULT_BREAK_DURATION_MINUTES * 60);
    setCurrentTaskIndex(-1); // No task is active during break
    setIsTimerActive(true); // Signal useEffect to start the break timer
    toast({title: "Break Time!", description: `Taking a ${DEFAULT_BREAK_DURATION_MINUTES} minute break.`});

  }, [tasks, currentTaskIndex, playNotificationSound, showDesktopNotification, POINTS_PER_TASK, BONUS_POINTS_FACTOR, DEFAULT_BREAK_DURATION_MINUTES]); // Removed timeRemaining as it caused stale closures for actualTimeSpent

  const handleSkipBreak = useCallback(() => {
    if (isBreakTime && isTimerActive) {
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
      }
      setIsTimerActive(false);
      setIsBreakTime(false);
      setTimeRemaining(0);
      setCurrentTaskIndex(-1); 
      toast({title: "Break Skipped", description: "Break ended. Ready for the next task?"});
    } else {
      toast({title: "No Active Break", description: "There is no active break to skip.", variant: "default"});
    }
  }, [isBreakTime, isTimerActive]); // Include all dependencies

  const handleExtendTimer = useCallback(() => {
    // Condition 1: No timer active at all (neither task nor break has been started)
    if (currentTaskIndex === -1 && !isBreakTime) {
      toast({title: "No Timer Active", description: "Start a task or break to extend its time.", variant: "default"});
      return;
    }

    // Condition 2: Time still remaining on the clock (not 0)
    if (timeRemaining > 0) {
        toast({title: "Timer Still Running", description: "Time can only be extended when the timer reaches 0.", variant: "default"});
        return;
    }

    // Condition 3: If it's a task, it must not be completed
    if (!isBreakTime && tasks[currentTaskIndex] && tasks[currentTaskIndex].completed) {
        toast({title: "Task Completed", description: `Task "${tasks[currentTaskIndex].name}" is already completed and cannot be extended.`, variant: "default"});
        return;
    }
    
    const context = isBreakTime ? "break" : (tasks[currentTaskIndex] ? `task "${tasks[currentTaskIndex].name}"` : "task");
    const defaultExtension = "5";

    setPromptConfig({
      title: `Extend ${context}`,
      message: `How many minutes would you like to add to the ${context}? Timer is currently at 00:00.`,
      inputLabel: 'Minutes to add:',
      defaultValue: defaultExtension,
      confirmText: 'Extend',
      cancelText: 'Cancel',
      placeholder: 'Enter minutes',
      onConfirm: (extendMinutesText) => {
        const extendMinutes = parseInt(extendMinutesText, 10);

        if (!isNaN(extendMinutes) && extendMinutes > 0) {
          const newTimeRemaining = timeRemaining + extendMinutes * 60; // timeRemaining will be 0 here
          setTimeRemaining(newTimeRemaining);
          
          let toastDescription = `Added ${extendMinutes} minutes to ${context}.`;

          if (currentTaskIndex !== -1 && !isBreakTime && tasks[currentTaskIndex]) {
            setTasks(prevTasks => prevTasks.map((t, idx) =>
              idx === currentTaskIndex ? { ...t, duration: t.duration + extendMinutes, estimatedDuration: t.estimatedDuration + extendMinutes } : t
            ));
            // Deduct points for task extension
            setScore(prevScore => prevScore - POINTS_DEDUCTION_FOR_EXTENSION);
            toastDescription += ` Points: -${POINTS_DEDUCTION_FOR_EXTENSION}`;
          }
          
          // If the timer was not active (which it will be, as timeRemaining was 0) and now has time, reactivate it.
          if (!isTimerActive && newTimeRemaining > 0) {
            setIsTimerActive(true);
          }
          toast({ title: "Timer Extended", description: toastDescription });
        } else {
          toast({ title: "Invalid Input", description: "Please enter a valid number of minutes.", variant: "destructive" });
        }
      }
    });
    setIsPromptOpen(true);
  }, [currentTaskIndex, isBreakTime, isTimerActive, timeRemaining, tasks, setTasks, score]); // Added score to dependencies

  // Effect for Timer Countdown
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      // If timer should be active and there's time, start the interval
      timerIntervalId.current = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) { 
            // Stop the interval first
            if(timerIntervalId.current) clearInterval(timerIntervalId.current);
            timerIntervalId.current = null;
            setIsTimerActive(false); // Timer is no longer active
            
            if (isBreakTime) {
              playNotificationSound();
              showDesktopNotification("Break Over!", "Your break time is up.");
              toast({ title: "Break Finished!", description: "Ready for the next task?" });
              setIsBreakTime(false); // Break is over
              setCurrentTaskIndex(-1); // No active task
            } else if (currentTaskIndex !== -1 && tasks[currentTaskIndex]) {
              const task = tasks[currentTaskIndex];
              // Increment timeSpentSeconds one last time for the final second
              setTasks(prevTasks => prevTasks.map((t, idx) => 
                idx === currentTaskIndex ? {...t, timeSpentSeconds: (t.timeSpentSeconds || 0) + 1} : t
              ));
              playNotificationSound();
              showDesktopNotification("Time's Up!", `Time for "${task.name}" is up.`);
              toast({ title: "Time's Up!", description: `"${task.name}" timer finished. Mark done or extend.` });
              // User needs to manually mark done or extend. isTimerActive is false.
            }
            return 0; // Time is up
          }

          // Increment timeSpentSeconds for active task during normal countdown
          if (currentTaskIndex !== -1 && !isBreakTime && tasks[currentTaskIndex]) {
            setTasks(prevTasks => prevTasks.map((task, idx) => 
                idx === currentTaskIndex ? {...task, timeSpentSeconds: (task.timeSpentSeconds || 0) + 1} : task
            ));
          }
          return prevTime - 1; // Countdown
        });
      }, 1000);
    } else {
      // If timer shouldn't be active or time is up, ensure interval is cleared
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
      }
    }
    // Cleanup function: always clear interval when dependencies change or component unmounts
    return () => {
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null; 
      }
    };
  }, [isTimerActive, timeRemaining, tasks, currentTaskIndex, isBreakTime, playNotificationSound, showDesktopNotification, setTasks]); // Added setTasks

  // Effect for Idle Time Calculation
  useEffect(() => {
    const idleInterval = setInterval(() => {
      if (!sessionStartTime) {
        setDisplayedIdleTime(0);
        return;
      }
      const totalProductiveSeconds = tasks.reduce((acc, task) => acc + (task.timeSpentSeconds || 0), 0);
      const totalSessionDurationSeconds = (Date.now() - sessionStartTime) / 1000;
      const currentIdleTime = Math.max(0, totalSessionDurationSeconds - totalProductiveSeconds);
      setDisplayedIdleTime(currentIdleTime);
    }, 1000);

    return () => clearInterval(idleInterval);
  }, [sessionStartTime, tasks]);

  // Formatting and Display Logic
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const timerDisplayColor = () => {
    if (isBreakTime || currentTaskIndex === -1 || !tasks[currentTaskIndex] || tasks[currentTaskIndex].completed) return 'text-timerAccent';
    const task = tasks[currentTaskIndex];
    const totalTaskSeconds = task.estimatedDuration * 60;
    if (totalTaskSeconds === 0) return 'text-timerAccent';
    const percentageRemaining = (timeRemaining / totalTaskSeconds) * 100;
    if (percentageRemaining <= 20) return 'text-red-500';
    if (percentageRemaining <= 50) return 'text-yellow-500';
    return 'text-timerAccent';
  };

  const calculateDailyStats = useCallback(() => {
    const totalDuration = tasks.reduce((acc, task) => acc + task.estimatedDuration, 0);
    let activeTaskTime = 0;
    if (currentTaskIndex !== -1 && tasks[currentTaskIndex] && !tasks[currentTaskIndex].completed && !isBreakTime) {
        activeTaskTime = timeRemaining > 0 ? timeRemaining : 0; // if timer is up, count 0 unless extended
    }
    const unstartedTasksDuration = tasks
        .filter(task => !task.started && !task.completed)
        .reduce((acc, task) => acc + (task.estimatedDuration * 60), 0);
    const remainingSeconds = activeTaskTime + unstartedTasksDuration;
    // Probability calculation can be refined later
    return {
      totalPlannedTime: totalDuration,
      remainingTaskTime: Math.ceil(remainingSeconds / 60),
      probNotFinishing: 0, // Placeholder
    };
  }, [tasks, currentTaskIndex, timeRemaining, isBreakTime]);

  const dailyStats = calculateDailyStats();
  const activeTaskObject = currentTaskIndex !== -1 && tasks[currentTaskIndex] ? tasks[currentTaskIndex] : null;
  const currentDisplayTaskName = isBreakTime ? "Break Time!" : (activeTaskObject ? activeTaskObject.name : "No Active Task");
  const activeTaskOriginalId = activeTaskObject ? activeTaskObject.id : null;

  // Spirals handlers (to be implemented)
  const handleAddSpiral = useCallback((spiralName) => {
    if (!spiralName.trim()) {
        toast({title: "Invalid Spiral", description: "Spiral name cannot be empty.", variant: "destructive"});
        return;
    }
    setSpirals(prev => [...prev, { id: Date.now(), name: spiralName.trim() }]);
    toast({title: "Spiral Added", description: `"${spiralName.trim()}" added to spirals.`});
  }, []);

  const handleRemoveSpiral = useCallback((spiralId) => {
    const spiralToRemove = spirals.find(s => s.id === spiralId);
    setSpirals(prev => prev.filter(s => s.id !== spiralId));
    if (spiralToRemove) {
        toast({title: "Spiral Removed", description: `"${spiralToRemove.name}" removed.`, variant: "destructive"});
    }
  }, [spirals]);

  const handleMoveSpiralToTasks = useCallback((spiralId) => {
    const spiralToMove = spirals.find(s => s.id === spiralId);
    if (!spiralToMove) return;

    setPromptConfig({
      title: "Move Spiral to Task",
      message: `Enter estimated duration (minutes) for task "${spiralToMove.name}":`,
      inputLabel: "Duration (minutes):",
      defaultValue: "30",
      confirmText: "Move to Tasks",
      cancelText: "Cancel",
      placeholder: "e.g., 30",
      onConfirm: (durationText) => {
        if (durationText === null) return; 
        const duration = parseInt(durationText, 10);

        if (duration && duration > 0) {
          handleAddTask({ name: spiralToMove.name, duration });
          setSpirals(prev => prev.filter(s => s.id !== spiralId));
          toast({ title: "Spiral Moved", description: `"${spiralToMove.name}" moved to tasks.` });
        } else {
          toast({ title: "Invalid Duration", description: "Please enter a positive number for duration.", variant: "destructive" });
        }
      }
    });
    setIsPromptOpen(true); 
  }, [spirals, handleAddTask, setIsPromptOpen, setPromptConfig]);

  const handleMasterPlayPause = () => {
    if (isTimerActive) { // If timer is supposed to be active (running or paused awaiting resume)
      handlePauseTimer(); // This will set isTimerActive = false and clear interval
    } else { // Timer is not supposed to be active (fully stopped or explicitly paused)
      // Check if we can resume an existing task or break
      if (timeRemaining > 0 && ((currentTaskIndex !== -1 && tasks[currentTaskIndex] && !tasks[currentTaskIndex].completed && !isBreakTime) || isBreakTime)) {
        handleResumeTimer(); // This will set isTimerActive = true
      } else {
        // Otherwise, try to start the first available (uncompleted) task
        const firstUncompletedTaskIndex = tasks.findIndex(t => !t.completed);
        if (firstUncompletedTaskIndex !== -1) {
          startTimer(firstUncompletedTaskIndex); // startTimer sets isTimerActive = true
        } else {
          toast({title: "No Tasks", description: "Add a task or all tasks are complete.", variant:"default"});
        }
      }
    }
  };

  // JSX will be in the next part
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-dark text-lightText p-4 sm:p-6 md:p-8">
      {/* Header with natural height */}
      <header className="bg-dark-100 p-4 rounded-lg shadow-lg mb-4 ring-1 ring-dark-300 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-center text-cyanAccent">Annoying Pomodoro</h1>
        {naggingQuote && <p className="text-center text-subtleText italic mt-1 mb-2 text-sm">{naggingQuote}</p>}
        
        {/* Enhanced Stats Display - adjusted for 4 items */}
        <div className="mt-2 pt-2 border-t border-dark-300 grid grid-cols-2 sm:grid-cols-4 justify-around items-center gap-2 sm:gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center text-subtleText text-xs uppercase tracking-wider mb-1">
              <Award className="h-4 w-4 mr-1" />
              Score
            </div>
            <span className='text-timerAccent font-bold text-lg'>{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center text-subtleText text-xs uppercase tracking-wider mb-1">
              <CheckCircle className="h-4 w-4 mr-1" />
              Tasks Done
            </div>
            <span className='text-timerAccent font-bold text-lg'>{tasks.filter(t => t.completed).length}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center text-subtleText text-xs uppercase tracking-wider mb-1">
              <Timer className="h-4 w-4 mr-1" />
              Focus Time
            </div>
            <span className='text-timerAccent font-bold text-lg'>{dailyStats.remainingTaskTime} min</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center text-subtleText text-xs uppercase tracking-wider mb-1">
              <Coffee className="h-4 w-4 mr-1" />
              Idle Time
            </div>
            <span className='text-timerAccent font-bold text-lg'>{formatTime(Math.floor(displayedIdleTime))}</span>
          </div>
        </div>
      </header>

      {/* Main content area with side navigation - flex-grow for height */}
      <div className="flex flex-row flex-grow overflow-hidden w-full gap-4">
        {/* Side Navigation - Increased width */}
        <div className="flex flex-col gap-2 w-28 sm:w-32">
          <Button 
            variant={activeView === 'focus' ? 'default' : 'outline'} 
            onClick={() => setActiveView('focus')}
            className="py-3 h-1/4 flex flex-col items-center justify-center text-xs sm:text-sm"
          >
            <Timer className="h-5 w-5 mb-1" />
            <span>Focus</span>
          </Button>
          <Button 
            variant={activeView === 'plan' ? 'default' : 'outline'} 
            onClick={() => setActiveView('plan')}
            className="py-3 h-1/4 flex flex-col items-center justify-center text-xs sm:text-sm"
          >
            <CheckCircle className="h-5 w-5 mb-1" />
            <span>Plan</span>
          </Button>
          <Button 
            variant={activeView === 'spirals' ? 'default' : 'outline'} 
            onClick={() => setActiveView('spirals')}
            className="py-3 h-1/4 flex flex-col items-center justify-center text-xs sm:text-sm"
          >
            <Award className="h-5 w-5 mb-1" />
            <span>Spirals</span>
          </Button>
          <Button 
            variant={activeView === 'settings' ? 'default' : 'outline'} 
            onClick={() => setActiveView('settings')}
            className="py-3 h-1/4 flex flex-col items-center justify-center text-xs sm:text-sm"
          >
            <Settings className="h-5 w-5 mb-1" />
            <span>Settings</span>
          </Button>
        </div>

        {/* Main view area with padding */}
        <main className="flex-grow overflow-auto p-4">
          {/* Content will be conditionally rendered here based on activeView */}
          {activeView === 'focus' && (
            <Card className="bg-dark-100 ring-1 ring-dark-300 h-full flex flex-col">
              <CardHeader className="text-center py-3">
                <CardTitle className="text-2xl font-semibold text-cyanAccent">Current Task: {currentDisplayTaskName}</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow flex flex-col justify-center">
                <div id="timer-clock-react" className={`text-7xl sm:text-8xl md:text-9xl font-mono font-bold ${timerDisplayColor()} my-2 sm:my-4 tabular-nums transition-colors duration-300`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 md:gap-4 mb-4">
                  <Button 
                    variant="buttonGray" 
                    size="lg" 
                    className="flex-grow sm:flex-grow-0"
                    onClick={handleMasterPlayPause}
                    disabled={!isTimerActive && timeRemaining === 0 && tasks.findIndex(t => !t.completed) === -1}
                  >
                    {isTimerActive ? "Pause" : (timeRemaining > 0 ? "Resume" : "Start")}
                  </Button>
                  <Button 
                      variant={isBreakTime ? "buttonGray" : "buttonGreen"}
                      size="lg" 
                      className="flex-grow sm:flex-grow-0"
                      onClick={() => {
                        if (isBreakTime) {
                          handleSkipBreak();
                        } else {
                          handleTaskDone();
                        }
                      }}
                      disabled={
                        isBreakTime ? 
                          !isTimerActive : 
                          (
                            currentTaskIndex === -1 || 
                            !tasks[currentTaskIndex] || 
                            tasks[currentTaskIndex].completed
                          )
                      }
                  >
                      {isBreakTime ? "Skip Break" : "Done!"}
                  </Button>
                </div>
                <div>
                  <Button 
                    variant="buttonGray" 
                    size="lg" 
                    onClick={handleExtendTimer}
                    disabled={ // Revised disabled logic
                      timeRemaining > 0 || // Disabled if time is still running
                      (!isBreakTime && // For tasks:
                        (currentTaskIndex === -1 || 
                        !tasks[currentTaskIndex] || 
                        !tasks[currentTaskIndex].started || 
                        tasks[currentTaskIndex].completed))
                      // For breaks, it's enabled if timeRemaining is 0 (covered by first condition being false)
                    }
                  >
                    Extend Time
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeView === 'plan' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              <Card className="lg:col-span-1 bg-dark-100 ring-1 ring-dark-300 flex flex-col">
                <CardHeader className="py-3">
                  <CardTitle className="text-xl font-semibold text-cyanAccent">Plan Your Day</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col overflow-hidden">
                  <TaskForm onAddTask={handleAddTask} />
                  <div className="mt-4 pt-4 border-t border-dark-300 space-y-2 flex-grow overflow-y-auto">
                      <h3 className="text-md font-semibold text-cyanAccent mb-2">Daily Stats</h3>
                      <p className="text-sm text-subtleText flex justify-between">Total Tasks: <span className='text-timerAccent font-semibold'>{tasks.length}</span></p>
                      <p className="text-sm text-subtleText flex justify-between">Total Planned: <span className='text-timerAccent font-semibold'>{dailyStats.totalPlannedTime} min</span></p>
                      <p className="text-sm text-subtleText flex justify-between">Remaining: <span className='text-timerAccent font-semibold'>{dailyStats.remainingTaskTime} min</span></p>
                      <p className="text-sm text-subtleText flex justify-between">P(Not Finishing): <span className='text-timerAccent font-semibold'>{dailyStats.probNotFinishing}%</span></p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-dark-100 ring-1 ring-dark-300 flex flex-col">
                <CardHeader className="py-3">
                  <CardTitle className="text-xl font-semibold text-cyanAccent">Today's Tasks</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                  <TaskList 
                      tasks={tasks} 
                      onRemoveTask={handleRemoveTask} 
                      onStartTask={(taskId) => {
                          const currentTasks = tasks; 
                          const taskIndex = currentTasks.findIndex(t => t.id === taskId);
                          
                          console.log('[App onStartTask] Attempting to start task:', 
                              { taskId, taskIndex, currentTasksLength: currentTasks.length, 
                                currentTasksIds: currentTasks.map(t => t.id) });

                          if (taskIndex !== -1) {
                              if (taskIndex < 0 || taskIndex >= currentTasks.length || !currentTasks[taskIndex]) {
                                  console.error("[App onStartTask PRE-CHECK FAILED] taskIndex out of bounds for current tasks.", 
                                      { taskId, taskIndex, currentTasksLength: currentTasks.length });
                                  toast({ 
                                      title: "Task Sync Issue", 
                                      description: "State inconsistency before starting timer. Please try again.", 
                                      variant: "destructive" 
                                  });
                                  return;
                              }
                              startTimer(taskIndex);
                          } else {
                              console.error("[App onStartTask] Task ID not found in current tasks:", { taskId });
                              toast({ 
                                  title: "Task Not Found", 
                                  description: "The selected task could not be found to start.", 
                                  variant: "destructive" 
                              });
                          }
                      }}
                      currentTaskIndex={currentTaskIndex} 
                      activeTaskOriginalId={activeTaskOriginalId} 
                      isTimerActive={isTimerActive} 
                      isBreakTime={isBreakTime}
                      timeRemaining={timeRemaining}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === 'spirals' && (
            <Card className="bg-dark-100 ring-1 ring-dark-300 h-full flex flex-col">
              <CardHeader className="py-3">
                <CardTitle className="text-xl font-semibold text-cyanAccent">Spirals (Ideas for Later)</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col overflow-hidden">
                <SpiralForm onAddSpiral={handleAddSpiral} />
                <div className="mt-4 flex-grow overflow-y-auto">
                  <SpiralList 
                    spirals={spirals} 
                    onRemoveSpiral={handleRemoveSpiral} 
                    onMoveSpiralToTasks={handleMoveSpiralToTasks} 
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeView === 'settings' && (
            <Card className="bg-dark-100 ring-1 ring-dark-300 h-full flex flex-col">
              <CardHeader className="py-3">
                <CardTitle className="text-xl font-semibold text-cyanAccent text-center">App Settings</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col p-4 items-center justify-center">
                <p className="text-subtleText">Settings options will appear here soon!</p>
                {/* Theme, Motivation Type, Durations, Notifications will go here */}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <Toaster />
      <PromptDialog 
        isOpen={isPromptOpen}
        onOpenChange={setIsPromptOpen}
        title={promptConfig.title}
        message={promptConfig.message}
        inputLabel={promptConfig.inputLabel}
        defaultValue={promptConfig.defaultValue}
        confirmText={promptConfig.confirmText}
        cancelText={promptConfig.cancelText}
        onConfirm={promptConfig.onConfirm}
        placeholder={promptConfig.placeholder}
      />
    </div>
  );
}

export default App; 
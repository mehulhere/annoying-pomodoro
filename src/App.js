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
import { Award, CheckCircle, Timer, Settings, Coffee, AlertCircle, Moon, Sun, Volume2, VolumeX, BrainCircuit } from 'lucide-react';
// Spirals components will be added later

// Different quote categories
const quoteCategories = {
  nagging: [
    "You won't be able to do it... Prove me wrong!",
    "Don't disappoint future you.",
  "Less scrolling, more doing!",
    "That task isn't going to complete itself.",
  "Are you a talker or a doer?",
  "Time is ticking. Are you?",
  "Stop procrastinating. Start dominating.",
  "Is this the best use of your time right now?",
    "The clock is your boss. Don't get fired."
  ],
  rude: [
    "Are you actually going to finish this time?",
    "Your procrastination is impressive, really.",
    "Oh look, another task you'll abandon.",
    "Half-finished tasks won't impress anyone.",
    "You call that productivity? I've seen snails move faster.",
    "Your to-do list is laughing at you right now.",
    "Great, another project for your 'abandoned' collection.",
    "Are you even trying at this point?",
    "Your focus is as stable as a house of cards."
  ],
  annoying: [
    "Tick tock! Time is passing! Tick tock!",
    "Hey! Hey! Hey! You should be working!",
    "Don't stop! Keep going! Don't stop! Keep going!",
    "Are you distracted yet? How about now? Now?",
    "This won't complete itself! This won't complete itself!",
    "Focus! Focus! Focus! Are you focused yet?",
    "Hey, remember that deadline? It's coming! Coming! Coming!",
    "Still working? Still working? Still working?",
    "Did you finish yet? No? How about now? Now? Now?"
  ],
  abusive: [
    "Your productivity is an absolute joke.",
    "Even a child could finish this faster than you.",
    "Pathetic effort as usual.",
    "You'll never amount to anything at this rate.",
    "Everyone else finished hours ago. What's your excuse?",
    "Failure is your only consistent achievement.",
    "No wonder nobody takes your work seriously.",
    "This is why you're always behind everyone else.",
    "Your lack of discipline is embarrassing."
  ]
};

const POINTS_PER_TASK = 10;
const MAX_TIME_SAVED_BONUS = 10; // Max bonus points for saving time, scaled by percentage
const POINTS_DEDUCTION_FOR_EXTENSION = 2; // Penalty for extending a task

// Moved helper functions before their usage in useCallback hooks
const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatDurationToHoursMinutes = (totalSecondsInput) => {
  const totalSeconds = Math.floor(totalSecondsInput);
  if (isNaN(totalSeconds) || totalSeconds < 0) return "0 min";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
  if (minutes > 0) return `${minutes} min`;
  return "0 min";
};

function App() {
  const [motivationalQuote, setMotivationalQuote] = useState("");
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

  // Settings state
  const [quoteType, setQuoteType] = useState("nagging"); // Default quote type
  const [soundEnabled, setSoundEnabled] = useState(true); // Default sound setting
  const [theme, setTheme] = useState("dark"); // Default theme setting
  const [breakDuration, setBreakDuration] = useState(5); // Default break duration in minutes
  const [allowExtendBreak, setAllowExtendBreak] = useState(true); // Default setting for extending breaks

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

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedQuoteType = localStorage.getItem('quoteType');
    const savedSoundEnabled = localStorage.getItem('soundEnabled');
    const savedTheme = localStorage.getItem('theme');
    const savedBreakDuration = localStorage.getItem('breakDuration');
    const savedAllowExtendBreak = localStorage.getItem('allowExtendBreak');
    
    if (savedQuoteType) setQuoteType(savedQuoteType);
    if (savedSoundEnabled !== null) setSoundEnabled(savedSoundEnabled === 'true');
    if (savedTheme) setTheme(savedTheme);
    if (savedBreakDuration) setBreakDuration(parseInt(savedBreakDuration, 10));
    if (savedAllowExtendBreak !== null) setAllowExtendBreak(savedAllowExtendBreak === 'true');
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('quoteType', quoteType);
    localStorage.setItem('soundEnabled', soundEnabled.toString());
    localStorage.setItem('theme', theme);
    localStorage.setItem('breakDuration', breakDuration.toString());
    localStorage.setItem('allowExtendBreak', allowExtendBreak.toString());
  }, [quoteType, soundEnabled, theme, breakDuration, allowExtendBreak]);

  // Apply theme class to body when it changes
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Initialize motivational quote, sound, and notification permissions
  useEffect(() => {
    const getRandomQuote = () => {
      const quotes = quoteCategories[quoteType];
      return quotes[Math.floor(Math.random() * quotes.length)];
    };
    
    setMotivationalQuote(getRandomQuote());
    notificationSound.current = new Audio('/assets/notification.mp3');

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") console.log("Desktop notification permission granted.");
      });
    }
  }, [quoteType]);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled) {
    notificationSound.current?.play().catch(error => console.error("Error playing sound:", error));
    }
  }, [soundEnabled]);

  const showDesktopNotification = useCallback((title, body) => {
    if (Notification.permission === "granted") new Notification(title, { body });
  }, []);

  // Motivational quote logic
  const updateMotivationalQuote = useCallback(() => {
    const getRandomQuote = () => {
      const quotes = quoteCategories[quoteType];
      return quotes[Math.floor(Math.random() * quotes.length)];
    };
    setMotivationalQuote(getRandomQuote());
  }, [quoteType]);

  const startMotivationalQuoteInterval = useCallback(() => {
    if (!isTimerActive && !quoteIntervalId.current) {
      updateMotivationalQuote();
      quoteIntervalId.current = setInterval(updateMotivationalQuote, 30000);
    }
  }, [isTimerActive, updateMotivationalQuote]);

  const stopMotivationalQuoteInterval = useCallback(() => {
    if (quoteIntervalId.current) {
      clearInterval(quoteIntervalId.current);
      quoteIntervalId.current = null;
    }
  }, []);

  useEffect(() => {
    if (isTimerActive) {
      stopMotivationalQuoteInterval();
    } else {
      startMotivationalQuoteInterval();
    }
    return () => stopMotivationalQuoteInterval(); // Cleanup on unmount
  }, [isTimerActive, startMotivationalQuoteInterval, stopMotivationalQuoteInterval]);


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
  }, [tasks, isTimerActive, isBreakTime, currentTaskIndex, sessionStartTime, setSessionStartTime, setTasks, setCurrentTaskIndex, setTimeRemaining, setIsTimerActive, setIsBreakTime]);

  const handlePauseTimer = useCallback(() => {
    if (timerIntervalId.current) { 
      clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
      setIsTimerActive(false); 
      toast({ title: isBreakTime ? "Break Paused" : "Timer Paused" });
    }
  }, [isBreakTime, setIsTimerActive]); 

  const handleResumeTimer = useCallback(() => {
    if (!isTimerActive && timeRemaining > 0 && 
        ((currentTaskIndex !== -1 && tasks[currentTaskIndex] && !tasks[currentTaskIndex].completed && !isBreakTime) || isBreakTime)) {
       setIsTimerActive(true); 
       toast({ title: isBreakTime ? "Break Resumed" : "Timer Resumed" });
    }
  }, [isTimerActive, timeRemaining, currentTaskIndex, tasks, isBreakTime, setIsTimerActive]); 

  const handleTaskDone = useCallback(() => {
    if (currentTaskIndex === -1 || !tasks[currentTaskIndex] || tasks[currentTaskIndex].completed) {
      toast({title: "No Active Task", description: "No task to mark as done.", variant: "default"});
      return;
    }

    const task = tasks[currentTaskIndex];
    let pointsEarnedThisTask = POINTS_PER_TASK;
    
    const timeWhenDone = task.timerStartTime ? (Date.now() - task.timerStartTime) / 1000 : task.timeSpentSeconds;
    // For bonus calculation, actualTimeSpent should not exceed original estimated duration.
    // If they finish early, actualTimeSpent will be less.
    // If they finish late (timer ran out and they clicked done), it will be task.duration * 60 from the timer logic.
    const actualTimeSpentForBonusCalc = Math.min(timeWhenDone, task.estimatedDuration * 60);

    const estimatedSeconds = task.estimatedDuration * 60;
    if (estimatedSeconds > 0) {
      const secondsSaved = Math.max(0, estimatedSeconds - actualTimeSpentForBonusCalc);
      const percentageTimeSaved = secondsSaved / estimatedSeconds;
      const bonus = Math.floor(percentageTimeSaved * MAX_TIME_SAVED_BONUS);
      pointsEarnedThisTask += bonus;
    }
    setScore(prevScore => prevScore + pointsEarnedThisTask);
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

    // Use actualTimeSpent (which could be > estimated if they let timer run out and clicked done)
    // for the task's final timeSpentSeconds for record keeping.
    const finalTimeSpentSeconds = timeWhenDone;

    setTasks(prevTasks => prevTasks.map((t, idx) =>
      idx === currentTaskIndex ? { 
        ...t, 
        completed: true, 
        timeSpentSeconds: finalTimeSpentSeconds, 
        duration: finalTimeSpentSeconds / 60, // Update duration to reflect actual time spent
        completionTimestamp: Date.now() 
      } : t
    ));

    if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
    }
    setIsTimerActive(false); 
    
    playNotificationSound();
    showDesktopNotification("Task Finished!", `"${task.name}" is complete.`);
    toast({ title: "Task Finished!", description: `"${task.name}" complete. Points: +${pointsEarnedThisTask}` });
    
    setIsBreakTime(true);
    setTimeRemaining(breakDuration * 60);
    setCurrentTaskIndex(-1); 
    setIsTimerActive(true); 
    toast({title: "Break Time!", description: `Taking a ${breakDuration} minute break.`});

  }, [tasks, currentTaskIndex, playNotificationSound, showDesktopNotification, breakDuration, setScore, setTasks, setIsBreakTime, setTimeRemaining, setCurrentTaskIndex, setIsTimerActive]);

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
  }, [isBreakTime, isTimerActive, setIsTimerActive, setIsBreakTime, setTimeRemaining, setCurrentTaskIndex]);

  const handleExtendTimer = useCallback(() => {
    // If no task active AND not break time, nothing to extend
    if (currentTaskIndex === -1 && !isBreakTime) {
      toast({title: "No Timer Active", description: "Start a task or break to extend its time.", variant: "default"});
      return;
    }

    // If it's a task, check if it's completed 
    // (This check is also in the button's disabled logic, but good for safety)
    if (!isBreakTime && tasks[currentTaskIndex] && tasks[currentTaskIndex].completed) {
        toast({title: "Task Completed", description: `Task "${tasks[currentTaskIndex].name}" is already completed and cannot be extended.`, variant: "default"});
        return;
    }

    // If it's a break, check if extending breaks is allowed
    if (isBreakTime && !allowExtendBreak) {
      toast({title: "Extend Break Disabled", description: "Extending break time is currently disabled in settings.", variant: "default"});
      return;
    }

    // For tasks, time must be 0. For breaks, this check is skipped if allowExtendBreak is true.
    if (!isBreakTime && timeRemaining > 0) {
        toast({title: "Timer Still Running", description: "Task time can only be extended when the timer reaches 0.", variant: "default"});
        return;
    }
    
    const context = isBreakTime ? "break" : (tasks[currentTaskIndex] ? `task "${tasks[currentTaskIndex].name}"` : "task");
    const defaultExtension = "5";
    const currentTimerValue = formatTime(timeRemaining);

    setPromptConfig({
      title: `Extend ${context}`,
      message: isBreakTime && timeRemaining > 0 ? 
                 `Current break time is ${currentTimerValue}. How many additional minutes would you like to add?` :
                 `How many minutes would you like to add to the ${context}? ${!isBreakTime && tasks[currentTaskIndex] ? 'Timer is currently at 00:00.' : ''}`,
      inputLabel: 'Minutes to add:',
      defaultValue: defaultExtension,
      confirmText: 'Extend',
      cancelText: 'Cancel',
      placeholder: 'Enter minutes',
      onConfirm: (extendMinutesText) => {
        const extendMinutes = parseInt(extendMinutesText, 10);

        if (!isNaN(extendMinutes) && extendMinutes > 0) {
          const newTimeRemaining = timeRemaining + extendMinutes * 60;
          setTimeRemaining(newTimeRemaining);
          
          let toastDescription = `Added ${extendMinutes} minutes to ${context}.`;

          if (!isBreakTime && currentTaskIndex !== -1 && tasks[currentTaskIndex]) {
            setTasks(prevTasks => prevTasks.map((t, idx) =>
              idx === currentTaskIndex ? { ...t, duration: t.duration + extendMinutes, estimatedDuration: t.estimatedDuration + extendMinutes } : t
            ));
            setScore(prevScore => prevScore - POINTS_DEDUCTION_FOR_EXTENSION);
            toastDescription += ` Points: -${POINTS_DEDUCTION_FOR_EXTENSION}`;
          }
          
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
  }, [currentTaskIndex, isBreakTime, isTimerActive, timeRemaining, tasks, allowExtendBreak, setIsPromptOpen, setPromptConfig, setTasks, setScore, setTimeRemaining, setIsTimerActive]);

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
  const timerDisplayColor = () => {
    if (isBreakTime) return 'text-emerald-400'; // Specific color for break time
    if (currentTaskIndex === -1 || !tasks[currentTaskIndex] || tasks[currentTaskIndex].completed) return 'text-timerAccent'; // Default/idle color
    
    const task = tasks[currentTaskIndex];
    const totalTaskSeconds = task.estimatedDuration * 60;
    if (totalTaskSeconds === 0) return 'text-timerAccent';
    const percentageRemaining = (timeRemaining / totalTaskSeconds) * 100;
    if (percentageRemaining <= 20) return 'text-red-500';
    if (percentageRemaining <= 50) return 'text-yellow-500';
    return 'text-timerAccent';
  };

  const calculateDailyStats = useCallback(() => {
    const totalPlannedDuration = tasks.reduce((acc, task) => acc + task.estimatedDuration, 0); // in minutes

    let totalFocusSeconds = tasks.reduce((acc, task) => {
      if (task.completed) {
        return acc + (task.timeSpentSeconds || 0);
      }
      return acc;
    }, 0);

    if (currentTaskIndex !== -1 && tasks[currentTaskIndex] && !tasks[currentTaskIndex].completed && !isBreakTime) {
      // Add time spent on the current, non-completed, active task
      totalFocusSeconds += (tasks[currentTaskIndex].timeSpentSeconds || 0);
    }
    
    // Calculate remaining estimated time for tasks not yet started or completed
    // This logic might need to be separate if "Focus Time" strictly means time ALREADY spent.
    // For now, let's keep a separate calculation for estimated remaining time if needed elsewhere,
    // or decide if "Focus Time" in header should be a different metric.

    // The original remainingTaskTime logic:
    let activeTaskRemainingSeconds = 0;
    if (currentTaskIndex !== -1 && tasks[currentTaskIndex] && !tasks[currentTaskIndex].completed && !isBreakTime) {
      activeTaskRemainingSeconds = timeRemaining > 0 ? timeRemaining : 0;
    }
    const unstartedTasksDurationSeconds = tasks
        .filter(task => !task.started && !task.completed)
        .reduce((acc, task) => acc + (task.estimatedDuration * 60), 0);
    const estimatedRemainingSecondsOverall = activeTaskRemainingSeconds + unstartedTasksDurationSeconds;

    return {
      totalPlannedTime: totalPlannedDuration, // Total estimated minutes for all tasks
      accumulatedFocusTimeSeconds: totalFocusSeconds, // Actual accumulated focus time in seconds
      estimatedRemainingTaskTimeMinutes: Math.ceil(estimatedRemainingSecondsOverall / 60), // Original remaining time logic
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
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-dark to-dark-100 text-lightText p-3 sm:p-4 md:p-5">
      {/* Header with natural height */}
      <header className="bg-gradient-to-r from-dark-100 to-dark-200 p-3.5 rounded-lg shadow-md mb-4 ring-1 ring-dark-300/40 flex flex-col justify-center transition-all duration-300 hover:shadow-lg">
        <h1 className="text-xl md:text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-brightAccent">Annoying Pomodoro</h1>
        
        {motivationalQuote && (
          <div className="relative mx-auto mt-1.5 mb-2 max-w-xl">
            <div className="bg-dark-300/50 p-2 rounded-md italic text-center text-subtleText text-xs md:text-sm">
              <span className="text-cyanAccent">"</span>{motivationalQuote}<span className="text-cyanAccent">"</span>
            </div>
            <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-dark-300/50"></div>
          </div>
        )}
        
        {/* Enhanced Stats Display - adjusted for 4 items */}
        <div className="mt-2 pt-2 border-t border-dark-300/60 grid grid-cols-2 sm:grid-cols-4 justify-around items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center group">
            <div className="flex items-center text-subtleText text-xs md:text-sm uppercase tracking-wider mb-0.5">
              <Award className="h-4 w-4 mr-1 text-cyanAccent transition-transform duration-300 group-hover:scale-110" />
              Score
            </div>
            <span className="text-timerAccent font-bold text-lg md:text-xl transition-all duration-300 group-hover:text-brightAccent">{score}</span>
          </div>
          <div className="flex flex-col items-center group">
            <div className="flex items-center text-subtleText text-xs md:text-sm uppercase tracking-wider mb-0.5">
              <CheckCircle className="h-4 w-4 mr-1 text-cyanAccent transition-transform duration-300 group-hover:scale-110" />
              Tasks Done
            </div>
            <span className="text-timerAccent font-bold text-lg md:text-xl transition-all duration-300 group-hover:text-brightAccent">{tasks.filter(t => t.completed).length}</span>
          </div>
          <div className="flex flex-col items-center group">
            <div className="flex items-center text-subtleText text-xs md:text-sm uppercase tracking-wider mb-0.5">
              <Timer className="h-4 w-4 mr-1 text-cyanAccent transition-transform duration-300 group-hover:scale-110" />
              Focus Time
            </div>
            <span className="text-timerAccent font-bold text-lg md:text-xl transition-all duration-300 group-hover:text-brightAccent">{formatDurationToHoursMinutes(dailyStats.accumulatedFocusTimeSeconds)}</span>
          </div>
          <div className="flex flex-col items-center group">
            <div className="flex items-center text-subtleText text-xs md:text-sm uppercase tracking-wider mb-0.5">
              <Coffee className="h-4 w-4 mr-1 text-cyanAccent transition-transform duration-300 group-hover:scale-110" />
              Idle Time
            </div>
            <span className="text-timerAccent font-bold text-lg md:text-xl transition-all duration-300 group-hover:text-brightAccent">{formatDurationToHoursMinutes(displayedIdleTime)}</span>
          </div>
        </div>
      </header>

      {/* Main content area with side navigation - flex-grow for height */}
      <div className="flex flex-row flex-grow overflow-hidden w-full gap-3 sm:gap-5">
        {/* Side Navigation - Improved styling */}
        <div className="flex flex-col gap-2 w-28 sm:w-32">
          <Button 
            variant={activeView === 'focus' ? 'default' : 'outline'} 
            onClick={() => setActiveView('focus')}
            className={`py-2.5 h-1/4 flex flex-col items-center justify-center text-xs sm:text-sm transition-all duration-300 pl-2 sm:pl-3
                      ${activeView === 'focus' ? 'shadow-sm ring-1 ring-cyanAccent/60' : 'hover:bg-dark-200/40 hover:ring-1 hover:ring-dark-300/60'}`}
          >
            <Timer className={`h-5 w-5 mb-0.5 ${activeView === 'focus' ? 'text-white animate-pulse-subtle' : 'text-subtleText'}`} />
            <span>Focus</span>
          </Button>
          <Button 
            variant={activeView === 'plan' ? 'default' : 'outline'} 
            onClick={() => setActiveView('plan')}
            className={`py-2.5 h-1/4 flex flex-col items-center justify-center text-xs sm:text-sm transition-all duration-300 pl-2 sm:pl-3
                      ${activeView === 'plan' ? 'shadow-sm ring-1 ring-cyanAccent/60' : 'hover:bg-dark-200/40 hover:ring-1 hover:ring-dark-300/60'}`}
          >
            <CheckCircle className={`h-5 w-5 mb-0.5 ${activeView === 'plan' ? 'text-white animate-pulse-subtle' : 'text-subtleText'}`} />
            <span>Plan</span>
          </Button>
          <Button 
            variant={activeView === 'spirals' ? 'default' : 'outline'} 
            onClick={() => setActiveView('spirals')}
            className={`py-2.5 h-1/4 flex flex-col items-center justify-center text-xs sm:text-sm transition-all duration-300 pl-2 sm:pl-3
                      ${activeView === 'spirals' ? 'shadow-sm ring-1 ring-cyanAccent/60' : 'hover:bg-dark-200/40 hover:ring-1 hover:ring-dark-300/60'}`}
          >
            <Award className={`h-5 w-5 mb-0.5 ${activeView === 'spirals' ? 'text-white animate-pulse-subtle' : 'text-subtleText'}`} />
            <span>Spirals</span>
          </Button>
          <Button 
            variant={activeView === 'settings' ? 'default' : 'outline'} 
            onClick={() => setActiveView('settings')}
            className={`py-2.5 h-1/4 flex flex-col items-center justify-center text-xs sm:text-sm transition-all duration-300 pl-2 sm:pl-3
                      ${activeView === 'settings' ? 'shadow-sm ring-1 ring-cyanAccent/60' : 'hover:bg-dark-200/40 hover:ring-1 hover:ring-dark-300/60'}`}
          >
            <Settings className={`h-5 w-5 mb-0.5 ${activeView === 'settings' ? 'text-white animate-pulse-subtle' : 'text-subtleText'}`} />
            <span>Settings</span>
          </Button>
        </div>

        {/* Main view area with padding */}
        <main className="flex-grow overflow-auto p-2 sm:p-3 rounded-md bg-dark-100/20 backdrop-blur-sm shadow-inner">
          {/* Content will be conditionally rendered here based on activeView */}
          {activeView === 'focus' && (
            <Card className="bg-gradient-to-br from-dark-100/90 to-dark-200/90 ring-1 ring-dark-300/50 h-full flex flex-col shadow-md hover:shadow-lg transition-all duration-500">
              <CardHeader className="text-center py-3 sm:py-3.5 border-b border-dark-300/25">
                <CardTitle className={`text-xl sm:text-2xl font-semibold transition-colors duration-300 ${currentTaskIndex === -1 && currentDisplayTaskName === "No Active Task" ? "text-subtleText" : "text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-brightAccent"}`}>
                  Current Task: <span className={currentTaskIndex !== -1 ? "text-brightAccent" : ""}>{currentDisplayTaskName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow flex flex-col justify-center p-4">
                {/* Timer display with circle background */}
                <div className="relative mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full bg-dark-300/25 flex items-center justify-center"></div>
                  <div className={`relative z-10 flex flex-col items-center justify-center rounded-full
                                  ${isBreakTime ? 'bg-gradient-to-br from-emerald-800/15 to-emerald-600/05' : 'bg-gradient-to-br from-dark-300/15 to-dark-200/05'}
                                  w-48 h-48 sm:w-52 sm:h-52 md:w-56 md:h-56 shadow-inner border border-dark-300/25`}>
                    <div id="timer-clock-react" className={`text-5xl sm:text-6xl font-mono font-bold ${timerDisplayColor()} tabular-nums transition-colors duration-500`}>
                  {formatTime(timeRemaining)}
                </div>
                    {isTimerActive && (
                      <div className="text-subtleText text-[10px] sm:text-xs mt-1.5">
                        {isBreakTime ? 'BREAK IN PROGRESS' : 'FOCUS IN PROGRESS'}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Control buttons with improved layout */}
                <div className="flex flex-wrap justify-center items-center gap-2 mb-3">
                  <Button 
                    variant={!isTimerActive && timeRemaining === 0 && currentTaskIndex === -1 ? "default" : "buttonGray"}
                    size="default"
                    className={`flex-grow sm:flex-grow-0 min-w-[90px] sm:min-w-[100px] py-1.5 text-sm md:text-base font-medium shadow-sm
                              ${!isTimerActive && timeRemaining === 0 && tasks.findIndex(t => !t.completed) !== -1 ? 
                                'bg-gradient-to-r from-cyanAccent to-brightAccent hover:opacity-90 transition-all duration-300' : ''}
                              ${isTimerActive ? 'hover:bg-red-700/50 transition-all duration-300' : ''}`}
                    onClick={handleMasterPlayPause}
                    disabled={!isTimerActive && timeRemaining === 0 && tasks.findIndex(t => !t.completed) === -1}
                  >
                    {isTimerActive ? "Pause" : (timeRemaining > 0 ? "Resume" : "Start")}
                  </Button>
                  <Button 
                      variant={isBreakTime ? "buttonGray" : "buttonGreen"}
                    size="default"
                    className={`flex-grow sm:flex-grow-0 min-w-[90px] sm:min-w-[100px] py-1.5 text-sm md:text-base font-medium shadow-sm
                              ${!isBreakTime ? 'bg-gradient-to-r from-green-600/90 to-emerald-500/90 hover:opacity-90' : ''}
                              transition-all duration-300`}
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
                    size="sm" 
                    className="min-w-[90px] sm:min-w-[100px] py-1.5 text-sm md:text-base font-medium shadow-sm hover:bg-amber-600/40 transition-colors duration-300"
                    onClick={handleExtendTimer}
                    disabled={
                      isBreakTime 
                        ? !allowExtendBreak 
                        : (
                            timeRemaining > 0 ||
                            currentTaskIndex === -1 || 
                        !tasks[currentTaskIndex] || 
                        !tasks[currentTaskIndex].started || 
                            tasks[currentTaskIndex].completed
                          )
                    }
                  >
                    Extend
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeView === 'plan' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              <Card className="lg:col-span-1 bg-gradient-to-br from-dark-100/90 to-dark-200/90 ring-1 ring-dark-300/50 flex flex-col shadow-md hover:shadow-lg transition-all duration-500">
                <CardHeader className="py-3 border-b border-dark-300/25">
                  <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-brightAccent">Plan Your Day</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col overflow-hidden p-3.5">
                  <TaskForm onAddTask={handleAddTask} />
                  <div className="mt-4 pt-4 border-t border-dark-300/40 space-y-2.5 flex-grow overflow-y-auto">
                    <h3 className="text-sm font-semibold text-cyanAccent mb-2">Daily Stats</h3>
                    <div className="bg-dark-300/25 rounded-md p-3 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-subtleText flex items-center">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyanAccent mr-1.5"></span>
                          Total Tasks:
                        </span>
                        <span className='text-timerAccent font-semibold'>{tasks.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-subtleText flex items-center">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                          Total Planned:
                        </span>
                        <span className='text-timerAccent font-semibold'>{dailyStats.totalPlannedTime} min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-subtleText flex items-center">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                          Remaining:
                        </span>
                        <span className='text-timerAccent font-semibold'>{dailyStats.estimatedRemainingTaskTimeMinutes} min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-subtleText flex items-center">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                          P(Not Finishing):
                        </span>
                        <span className='text-timerAccent font-semibold'>{dailyStats.probNotFinishing}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-gradient-to-br from-dark-100/90 to-dark-200/90 ring-1 ring-dark-300/50 flex flex-col shadow-md hover:shadow-lg transition-all duration-500">
                <CardHeader className="py-3 border-b border-dark-300/25">
                  <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-brightAccent">Today's Tasks</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden p-3.5">
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
            <Card className="bg-gradient-to-br from-dark-100/90 to-dark-200/90 ring-1 ring-dark-300/50 h-full flex flex-col shadow-md hover:shadow-lg transition-all duration-500">
              <CardHeader className="py-3 border-b border-dark-300/25">
                <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-brightAccent">Spirals (Ideas for Later)</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col overflow-hidden p-3.5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgOTBjMjIuMDkxIDAgNDAtMTcuOTA5IDQwLTQwUzcyLjA5MSAxMCA1MCAxMCAxMCAyNy45MDkgMTAgNTBzMTcuOTA5IDQwIDQwIDQweiIgc3Ryb2tlPSIjMkQzNzQ4IiBmaWxsPSJub25lIiBvcGFjaXR5PSIuMDMiLz48L3N2Zz4=')] bg-[length:80px_80px]">
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
            <Card className="bg-gradient-to-br from-dark-100/90 to-dark-200/90 ring-1 ring-dark-300/50 h-full flex flex-col shadow-md hover:shadow-lg transition-all duration-500">
              <CardHeader className="py-3 border-b border-dark-300/25">
                <CardTitle className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-brightAccent text-center">App Settings</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col p-3.5 text-sm md:text-base overflow-y-auto">
                <div className="space-y-5 md:space-y-6">
                  {/* Theme Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <Moon className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Theme</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-dark-200/80 rounded-full p-0.5">
                        <button 
                          className={`${theme === 'dark' ? 'bg-dark-100 text-white' : 'text-subtleText'} rounded-full px-2.5 py-1 text-[10px] md:text-xs flex items-center transition-all duration-300`}
                          onClick={() => setTheme('dark')}
                        >
                          <Moon className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                          Dark
                        </button>
                        <button 
                          className={`${theme === 'light' ? 'bg-dark-100 text-white' : 'text-subtleText'} rounded-full px-2.5 py-1 text-[10px] md:text-xs flex items-center transition-all duration-300`}
                          onClick={() => setTheme('light')}
                        >
                          <Sun className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                          Light
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Motivation Type Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Motivation Type</span>
                      </div>
                      <div className="bg-dark-200/80 text-subtleText rounded px-2 py-0.5 text-[10px] md:text-xs flex items-center">
                        {quoteType.charAt(0).toUpperCase() + quoteType.slice(1)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] md:text-xs">
                      <div 
                        className={`${quoteType === 'nagging' ? 'bg-cyanAccent/30 text-cyanAccent font-semibold' : 'bg-dark-200/40 text-subtleText'} rounded p-1.5 text-center cursor-pointer hover:bg-cyanAccent/20 hover:text-cyanAccent transition-colors`}
                        onClick={() => setQuoteType('nagging')}
                      >
                        Nagging
                      </div>
                      <div 
                        className={`${quoteType === 'rude' ? 'bg-cyanAccent/30 text-cyanAccent font-semibold' : 'bg-dark-200/40 text-subtleText'} rounded p-1.5 text-center cursor-pointer hover:bg-cyanAccent/20 hover:text-cyanAccent transition-colors`}
                        onClick={() => setQuoteType('rude')}
                      >
                        Rude
                      </div>
                      <div 
                        className={`${quoteType === 'annoying' ? 'bg-cyanAccent/30 text-cyanAccent font-semibold' : 'bg-dark-200/40 text-subtleText'} rounded p-1.5 text-center cursor-pointer hover:bg-cyanAccent/20 hover:text-cyanAccent transition-colors`}
                        onClick={() => setQuoteType('annoying')}
                      >
                        Annoying
                      </div>
                      <div 
                        className={`${quoteType === 'abusive' ? 'bg-cyanAccent/30 text-cyanAccent font-semibold' : 'bg-dark-200/40 text-subtleText'} rounded p-1.5 text-center cursor-pointer hover:bg-cyanAccent/20 hover:text-cyanAccent transition-colors`}
                        onClick={() => setQuoteType('abusive')}
                      >
                        Abusive
                      </div>
                    </div>
                  </div>
                  
                  {/* Sound Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Volume2 className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Sound Notifications</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          className={`${soundEnabled ? 'bg-dark-200/80 text-white' : 'bg-dark-200/30 text-subtleText opacity-60'} hover:bg-dark-300/80 transition-colors rounded-full p-1 md:p-1.5`}
                          onClick={() => setSoundEnabled(true)}
                        >
                          <Volume2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </button>
                        <button 
                          className={`${!soundEnabled ? 'bg-dark-200/80 text-white' : 'bg-dark-200/30 text-subtleText opacity-60'} hover:bg-dark-300/80 transition-colors rounded-full p-1 md:p-1.5`}
                          onClick={() => setSoundEnabled(false)}
                        >
                          <VolumeX className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Allow Extend Break Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Allow Extending Breaks</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          className={`${allowExtendBreak ? 'bg-dark-200/80 text-white' : 'bg-dark-200/30 text-subtleText opacity-60'} hover:bg-dark-300/80 transition-colors rounded-full px-2.5 py-1 text-[10px] md:text-xs`}
                          onClick={() => setAllowExtendBreak(true)}
                        >
                          Yes
                        </button>
                        <button 
                          className={`${!allowExtendBreak ? 'bg-dark-200/80 text-white' : 'bg-dark-200/30 text-subtleText opacity-60'} hover:bg-dark-300/80 transition-colors rounded-full px-2.5 py-1 text-[10px] md:text-xs`}
                          onClick={() => setAllowExtendBreak(false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Default Break Duration Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Default Break Duration</span>
                      </div>
                      <div className="bg-dark-200/80 text-subtleText rounded px-2 py-0.5 text-[10px] md:text-xs flex items-center">
                        {breakDuration} minutes
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="1"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] md:text-xs text-subtleText/80 mt-1">
                      <span>1 min</span>
                      <span>15 min</span>
                    </div>
                  </div>

                  {/* Points System Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Points System</span>
                      </div>
                      <div className="bg-dark-200/80 text-subtleText rounded px-2 py-0.5 text-[10px] md:text-xs flex items-center">
                        Enabled
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px] md:text-xs">
                      <div className="bg-dark-200/40 rounded p-1.5 flex justify-between items-center">
                        <span>Per Task:</span>
                        <span className="text-cyanAccent">{POINTS_PER_TASK} pts</span>
                      </div>
                      <div className="bg-dark-200/40 rounded p-1.5 flex justify-between items-center">
                        <span>Time Bonus:</span>
                        <span className="text-cyanAccent">Up to {MAX_TIME_SAVED_BONUS} pts</span>
                      </div>
                      <div className="bg-dark-200/40 rounded p-1.5 flex justify-between items-center">
                        <span>Extension Penalty:</span>
                        <span className="text-cyanAccent">-{POINTS_DEDUCTION_FOR_EXTENSION} pts</span>
                      </div>
                    </div>
                    <div className="text-[9px] md:text-[10px] text-subtleText/70 mt-1.5 pl-0.5">
                      Time bonus is scaled by the percentage of estimated time saved.
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex items-center mb-2">
                      <BrainCircuit className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                      <span className="font-medium text-xs md:text-sm">About</span>
                    </div>
                    <div className="text-[10px] md:text-xs text-subtleText/80">
                      Annoying Pomodoro v0.1.0<br />
                      An annoyingly effective time management app
                    </div>
                  </div>
                </div>
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
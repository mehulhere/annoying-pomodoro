import React from 'react';
import { Button } from './ui/Button';
import { Play, Trash2, CheckCircle } from 'lucide-react'; // Pause icon no longer needed here

function TaskItem({ task, onRemoveTask, onStartTask, currentTaskIndex, activeTaskOriginalId, isTimerActive, isBreakTime, timeRemaining }) {
    const isActiveCore = task.id === activeTaskOriginalId && !isBreakTime && !task.completed;
    const isRunning = isActiveCore && isTimerActive;
    const isPaused = isActiveCore && !isTimerActive && task.started && timeRemaining > 0;

    const baseClasses = 'p-3 mb-1 bg-dark-200 rounded-md shadow flex justify-between items-center transition-all duration-200 ease-in-out hover:shadow-lg';

    let ringStyle = 'ring-1 ring-dark-300 hover:ring-cyanAccent/50'; // Default for non-completed, non-active, non-paused

    if (isPaused) {
        // Paused state ring style (e.g., yellow ring, slightly brighter yellow on hover)
        ringStyle = 'ring-1 ring-yellow-500 hover:ring-yellow-400';
    }

    if (isRunning) {
        // Active state ring style (e.g., 2px cyan ring, persists on hover)
        // This will override 'isPaused' if both were somehow true, but they are mutually exclusive.
        ringStyle = 'ring-2 ring-cyanAccent hover:ring-2 hover:ring-cyanAccent';
    }

    const completedClass = task.completed ? 'opacity-60' : '';

    return (
        <li className={`${baseClasses} ${ringStyle} ${completedClass}`}>
            <div className={`flex-grow flex items-center min-w-0 ${task.completed ? 'text-subtleText' : 'text-lightText'}`}>
                {task.completed && <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />}
                <span className={`relative truncate ${task.completed ? 'line-through decoration-slate-500 decoration-2' : ''}`}>
                    {task.name}
                </span>
                <span className={`ml-2 text-xs flex-shrink-0 ${task.completed ? 'text-slate-500 line-through decoration-slate-500 decoration-2' : 'text-muted-foreground'}`}>({task.estimatedDuration} min)</span>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0 ml-2 min-w-[110px] justify-end">
                {!task.completed && !isRunning && !isPaused && (
                    <Button
                        variant="buttonGreen"
                        size="sm"
                        onClick={() => onStartTask(task.id)}
                        // Disable if any timer is active globally. 
                        // If this task were paused, this button wouldn't show anyway.
                        disabled={isTimerActive}
                        aria-label={`Start task ${task.name}`}
                        className="w-[70px]"
                    >
                        <Play className="h-4 w-4 mr-1" /> Start
                    </Button>
                )}
                {isPaused && (
                    <span className="text-xs text-yellow-400 font-semibold px-2 py-1 bg-yellow-400/10 rounded-full w-[70px] text-center">Paused</span>
                )}
                {isRunning && (
                    <span className="text-xs text-cyanAccent font-semibold px-2 py-1 bg-cyanAccent/10 rounded-full w-[70px] text-center">Active</span>
                )}
                {task.completed && (
                    <span className="text-xs text-green-400 font-semibold px-2 py-1 bg-green-400/10 rounded-full w-[70px] text-center">Done!</span>
                )}
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveTask(task.id)}
                    aria-label={`Remove task ${task.name}`}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </li>
    );
}

export default TaskItem;

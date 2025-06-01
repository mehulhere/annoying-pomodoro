import React from 'react';
import { Button } from './ui/Button';
import { Play, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

function TaskItem({ task, onRemoveTask, onStartTask, currentTaskIndex, activeTaskOriginalId, isTimerActive, isBreakTime, timeRemaining }) {
    const isActiveCore = task.id === activeTaskOriginalId && !isBreakTime && !task.completed;
    const isRunning = isActiveCore && isTimerActive;
    const isPaused = isActiveCore && !isTimerActive && task.started && timeRemaining > 0;

    const baseClasses = 'p-3.5 mb-1 rounded-lg shadow-sm flex justify-between items-center transition-all duration-300 ease-in-out group hover:shadow-md';

    let stateClasses = '';
    let ringStyle = 'ring-1 ring-dark-300/60 hover:ring-cyanAccent/70';

    if (task.completed) {
        stateClasses = 'bg-gradient-to-r from-dark-200/80 to-dark-200/60 opacity-70';
    } else if (isPaused) {
        stateClasses = 'bg-gradient-to-r from-dark-200 to-dark-200/90 border-l-4 border-yellow-500';
        ringStyle = 'ring-1 ring-yellow-500/40 hover:ring-yellow-400/70';
    } else if (isRunning) {
        stateClasses = 'bg-gradient-to-r from-dark-200 to-dark-300/80 border-l-4 border-cyanAccent';
        ringStyle = 'ring-1 ring-cyanAccent/40 hover:ring-cyanAccent/70';
    } else {
        stateClasses = 'bg-gradient-to-r from-dark-200/80 to-dark-200/60';
    }

    return (
        <li className={`${baseClasses} ${ringStyle} ${stateClasses}`}>
            <div className={`flex-grow flex items-center min-w-0 pr-2 ${task.completed ? 'text-subtleText' : 'text-lightText'}`}>
                {task.completed ? (
                    <CheckCircle className="h-5 w-5 mr-2.5 text-green-500 flex-shrink-0" />
                ) : (
                    <Clock className="h-5 w-5 mr-2.5 text-cyanAccent/80 flex-shrink-0 group-hover:text-cyanAccent transition-colors duration-300" />
                )}
                <div className="flex flex-col min-w-0">
                    <span className={`relative truncate font-medium ${task.completed ? 'line-through decoration-slate-500 decoration-2' : ''}`}>
                        {task.name}
                    </span>
                    <div className="flex items-center text-xs text-subtleText mt-0.5">
                        <span className={`${task.completed ? 'text-slate-500' : ''}`}>
                            {task.estimatedDuration} min
                        </span>
                        {isRunning && (
                            <span className="flex items-center ml-2 text-cyanAccent">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyanAccent mr-1 animate-pulse"></span>
                                In progress
                            </span>
                        )}
                        {isPaused && (
                            <span className="flex items-center ml-2 text-yellow-500">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Paused
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0 ml-2 justify-end">
                {!task.completed && !isRunning && !isPaused && (
                    <Button
                        variant="buttonGreen"
                        size="sm"
                        onClick={() => onStartTask(task.id)}
                        disabled={isTimerActive}
                        aria-label={`Start task ${task.name}`}
                        className="w-auto px-3 bg-gradient-to-r from-green-600/90 to-emerald-500/90 hover:opacity-90 transition-all duration-300 shadow-sm"
                    >
                        <Play className="h-4 w-4 mr-1.5" /> Start
                    </Button>
                )}

                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveTask(task.id)}
                    aria-label={`Remove task ${task.name}`}
                    className={`bg-transparent hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/30 transition-all duration-300 ${task.completed ? 'opacity-70 hover:opacity-100' : ''}`}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </li>
    );
}

export default TaskItem; 
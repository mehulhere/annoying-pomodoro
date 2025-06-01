import React from 'react';
import TaskItem from './TaskItem';
import { ListX } from 'lucide-react';

function TaskList({ tasks, onRemoveTask, onStartTask, currentTaskIndex, activeTaskOriginalId, isTimerActive, isBreakTime, timeRemaining }) {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-6 px-3">
                <div className="bg-dark-300/25 rounded-full p-3 mb-2.5">
                    <ListX className="h-7 w-7 text-subtleText/90" />
                </div>
                <p className="text-subtleText/90 text-center text-sm">No tasks yet. Add some to get started!</p>
                <p className="text-[11px] text-subtleText/60 text-center mt-0.5">Tasks you add will appear here</p>
            </div>
        );
    }

    return (
        <ul className="space-y-2.5 max-h-[450px] overflow-y-auto p-1.5 custom-scrollbar" id="task-list">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onRemoveTask={onRemoveTask}
                    onStartTask={onStartTask}
                    currentTaskIndex={currentTaskIndex}
                    activeTaskOriginalId={activeTaskOriginalId}
                    isTimerActive={isTimerActive}
                    isBreakTime={isBreakTime}
                    timeRemaining={timeRemaining}
                />
            ))}
        </ul>
    );
}

export default TaskList; 
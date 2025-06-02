import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { toast } from '../hooks/use-toast';
import { Clock, Plus, X, FileText } from 'lucide-react';

function TaskShortcut({ onAddTask, isMobileView }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [taskDuration, setTaskDuration] = useState('');

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!taskName.trim() || !taskDuration || parseInt(taskDuration, 10) <= 0) {
            toast({
                title: "Invalid Input",
                description: "Please enter a valid task name and duration.",
                variant: "destructive",
            });
            return;
        }
        onAddTask({
            name: taskName.trim(),
            duration: parseInt(taskDuration, 10)
        });
        setTaskName('');
        setTaskDuration('');
        setIsExpanded(false); // Collapse after adding
    };

    const handleCancel = () => {
        setTaskName('');
        setTaskDuration('');
        setIsExpanded(false);
    };

    // Compact button when collapsed
    if (!isExpanded) {
        return (
            <Button
                variant="buttonBlue"
                size={isMobileView ? "icon" : "sm"}
                className={`${isMobileView ? 'mt-3 mb-0 p-0 w-8 h-8 rounded-xl' : 'mt-2 mb-4 px-3'} bg-slate-700 opacity-70 hover:opacity-80 transition-all duration-300 flex items-center justify-center shadow-sm`}
                onClick={() => setIsExpanded(true)}
            >
                <Plus className={`${isMobileView ? 'h-3.5 w-3.5' : 'h-4 w-4 mr-1'}`} />
                {!isMobileView && 'Quick Task'}
            </Button>
        );
    }

    // Expanded form when active
    return (
        <form onSubmit={handleSubmit} className="mt-2 mb-4 space-y-3 p-4 bg-dark-200 rounded-xl border border-dark-300/30 shadow-md animate-in fade-in duration-150 w-sm mx-auto ">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-medium text-white">Quick Add Task</h3>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-dark-200"
                    onClick={handleCancel}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-col space-y-3">
                <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
                    <Input
                        type="text"
                        placeholder="Task name"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        className="pl-10 bg-dark-200/60 border-cyan-400/30 focus:ring-cyan-400 focus:border-cyan-400 text-sm py-2 rounded-lg shadow-inner"
                        autoFocus
                    />
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
                        <Input
                            type="number"
                            placeholder="Minutes"
                            value={taskDuration}
                            onChange={(e) => setTaskDuration(e.target.value)}
                            className="pl-10 bg-dark-200/60 border-cyan-400/30 focus:ring-cyan-400 focus:border-cyan-400 text-sm py-2 rounded-lg shadow-inner"
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="buttonBlue"
                        size="sm"
                        className="bg-slate-700 opacity-70 hover:opacity-80 transition-all duration-300 flex items-center h-10 px-4 rounded-lg"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>
            </div>
        </form>
    );
}

export default TaskShortcut; 
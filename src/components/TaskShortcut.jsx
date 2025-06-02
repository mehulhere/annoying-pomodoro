import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { toast } from '../hooks/use-toast';
import { Clock, Plus, X, FileText } from 'lucide-react';

function TaskShortcut({ onAddTask, isMobileView }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [taskDuration, setTaskDuration] = useState('');
    const [isExtraSmall, setIsExtraSmall] = useState(window.innerWidth < 375);

    // Track screen width for extra small screens (< 375px)
    useEffect(() => {
        const handleResize = () => {
            setIsExtraSmall(window.innerWidth < 375);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                className={`${isMobileView ?
                    `mt-3 mb-0 p-0 ${isExtraSmall ? 'w-6 h-6' : 'w-8 h-8'} rounded-xl` :
                    'mt-2 mb-4 px-3'} bg-gray-800/90 hover:bg-gray-700/90 opacity-90 transition-all duration-300 flex items-center justify-center shadow-sm border border-gray-700/50`}
                onClick={() => setIsExpanded(true)}
            >
                <Plus className={`${isMobileView ? 'h-3.5 w-3.5' : 'h-4 w-4 mr-1'} text-gray-300`} />
                {!isMobileView && <span className="text-gray-300">Quick Task</span>}
            </Button>
        );
    }

    // Expanded form when active
    return (
        <form onSubmit={handleSubmit} className={`mt-2 mb-4 space-y-2 p-3 ${isExtraSmall ? 'max-w-[250px]' : ''} bg-dark-300/40 rounded-md border border-dark-300/30 shadow-md animate-in fade-in duration-150`}>
            <div className="flex justify-between items-center mb-2">
                <h3 className={`${isExtraSmall ? 'text-xs' : 'text-sm'} font-medium text-white`}>Quick Add Task</h3>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-dark-200"
                    onClick={handleCancel}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
            <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                    <FileText className={`${isExtraSmall ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-cyanAccent`} />
                    <Input
                        type="text"
                        placeholder="Task name"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        className={`flex-grow bg-dark-200/60 border-dark-300/40 focus:ring-cyanAccent focus:border-cyanAccent ${isExtraSmall ? 'text-xs px-2 py-1' : 'text-sm px-2.5 py-1.5'} rounded shadow-inner`}
                        autoFocus
                    />
                </div>
                <div className="flex space-x-2">
                    <div className="flex-grow">
                        <div className="flex items-center space-x-3">
                            <Clock className={`${isExtraSmall ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-cyanAccent`} />
                            <Input
                                type="number"
                                placeholder="Minutes"
                                value={taskDuration}
                                onChange={(e) => setTaskDuration(e.target.value)}
                                className={`bg-dark-200/60 border-dark-300/40 focus:ring-cyanAccent focus:border-cyanAccent ${isExtraSmall ? 'text-xs px-2 py-1' : 'text-sm px-2.5 py-1.5'} rounded shadow-inner`}
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        variant="buttonBlue"
                        size={isExtraSmall ? "xs" : "sm"}
                        className="bg-gray-800/90 hover:bg-gray-700/90 opacity-90 transition-all duration-300 flex items-center border border-gray-700/50"
                    >
                        <Plus className={`${isExtraSmall ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1 text-gray-300`} />
                        <span className="text-gray-300">Add</span>
                    </Button>
                </div>
            </div>
        </form>
    );
}

export default TaskShortcut; 
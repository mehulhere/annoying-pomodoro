import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { toast } from '../hooks/use-toast';
import { Clock, FileText, Plus } from 'lucide-react';

function TaskForm({ onAddTask }) {
    const [taskName, setTaskName] = useState('');
    const [taskDuration, setTaskDuration] = useState('');
    const [isFocused, setIsFocused] = useState({ name: false, duration: false });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskName.trim() || !taskDuration || parseInt(taskDuration, 10) <= 0) {
            toast({
                title: "Invalid Input",
                description: "Please enter a valid task name and a positive duration.",
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
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <style jsx>{`
                input::placeholder {
                    opacity: 0.33; /* Adjust opacity as needed */
                }
            `}</style>
            <div className={`transition-all duration-300 ${isFocused.name ? 'scale-[1.005]' : ''}`}>
                <Label
                    htmlFor="task-name-input"
                    className="text-subtleText mb-1.5 flex items-center text-xs font-medium"
                >
                    <FileText className="h-3.5 w-3.5 mr-1 text-cyanAccent" />
                    Task Description
                </Label>
                <div className="relative">
                    <Input
                        id="task-name-input"
                        type="text"
                        placeholder="E.g., Write blog post"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        onFocus={() => setIsFocused(prev => ({ ...prev, name: true }))}
                        onBlur={() => setIsFocused(prev => ({ ...prev, name: false }))}
                        className="bg-dark-200/60 border-dark-300/40 focus:ring-cyanAccent focus:border-cyanAccent text-sm pl-2.5 pr-2.5 py-1.5 rounded shadow-inner transition-all duration-300 hover:bg-dark-200/80 focus:bg-dark-200/90"
                        autoComplete="off"
                    />
                </div>
            </div>
            <div className={`transition-all duration-300 ${isFocused.duration ? 'scale-[1.005]' : ''}`}>
                <Label
                    htmlFor="task-duration-input"
                    className="text-subtleText mb-1.5 flex items-center text-xs font-medium"
                >
                    <Clock className="h-3.5 w-3.5 mr-1 text-cyanAccent" />
                    Duration (minutes)
                </Label>
                <div className="relative">
                    <Input
                        id="task-duration-input"
                        type="number"
                        placeholder="E.g., 30"
                        value={taskDuration}
                        onChange={(e) => setTaskDuration(e.target.value)}
                        onFocus={() => setIsFocused(prev => ({ ...prev, duration: true }))}
                        onBlur={() => setIsFocused(prev => ({ ...prev, duration: false }))}
                        className="bg-dark-200/60 border-dark-300/40 focus:ring-cyanAccent focus:border-cyanAccent text-sm pl-2.5 pr-2.5 py-1.5 rounded shadow-inner transition-all duration-300 hover:bg-dark-200/80 focus:bg-dark-200/90"
                        autoComplete="off"
                    />
                </div>
            </div>
            <Button
                type="submit"
                variant="buttonBlue"
                size="sm"
                className="w-full bg-gradient-to-r from-cyanAccent to-brightAccent hover:opacity-90 transition-all duration-300 flex items-center justify-center shadow-sm py-2 text-xs"
            >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Task
            </Button>
        </form>
    );
}

export default TaskForm; 
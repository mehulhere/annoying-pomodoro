import React, { useState } from 'react';
import { Button } from './ui/Button'; // Adjusted path
import { Input } from './ui/Input';   // Adjusted path
import { Label } from './ui/Label';   // Adjusted path
import { toast } from '../hooks/use-toast'; // Import toast

function TaskForm({ onAddTask }) {
    const [taskName, setTaskName] = useState('');
    const [taskDuration, setTaskDuration] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskName.trim() || !taskDuration || parseInt(taskDuration, 10) <= 0) {
            toast({ // Use toast here
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="task-name-input" className="text-subtleText mb-1 block">Task Description</Label>
                <Input
                    id="task-name-input"
                    type="text"
                    placeholder="E.g., Write blog post"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="bg-dark-200 border-dark-300 focus:ring-cyanAccent focus:border-cyanAccent"
                />
            </div>
            <div>
                <Label htmlFor="task-duration-input" className="text-subtleText mb-1 block">Duration (minutes)</Label>
                <Input
                    id="task-duration-input"
                    type="number"
                    placeholder="E.g., 30"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(e.target.value)}
                    className="bg-dark-200 border-dark-300 focus:ring-cyanAccent focus:border-cyanAccent"
                />
            </div>
            <Button type="submit" variant="buttonBlue" className="w-full">Add Task</Button>
        </form>
    );
}

export default TaskForm; 
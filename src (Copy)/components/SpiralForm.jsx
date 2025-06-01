import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { toast } from '../hooks/use-toast';

function SpiralForm({ onAddSpiral }) {
    const [spiralName, setSpiralName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!spiralName.trim()) {
            toast({
                title: "Invalid Input",
                description: "Spiral name cannot be empty.",
                variant: "destructive",
            });
            return;
        }
        onAddSpiral(spiralName.trim());
        setSpiralName(''); // Clear input after adding
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
            <div>
                <Label htmlFor="spiral-name-input" className="text-subtleText mb-1 block text-sm">Add a New Spiral</Label>
                <div className="flex space-x-2">
                    <Input
                        id="spiral-name-input"
                        type="text"
                        placeholder="E.g., Plan weekend trip, Learn a new recipe..."
                        value={spiralName}
                        onChange={(e) => setSpiralName(e.target.value)}
                        className="bg-dark-200 border-dark-300 focus:ring-cyanAccent focus:border-cyanAccent flex-grow"
                    />
                    <Button type="submit" variant="buttonBlue" size="default">Add Spiral</Button>
                </div>
            </div>
        </form>
    );
}

export default SpiralForm; 
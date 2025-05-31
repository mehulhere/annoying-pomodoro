import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { toast } from '../hooks/use-toast';
import { RotateCcw, BrainCircuit, PlusCircle } from 'lucide-react';

function SpiralForm({ onAddSpiral }) {
    const [spiralName, setSpiralName] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!spiralName.trim()) {
            toast({
                title: "Empty Spiral",
                description: "Please enter a name for your spiral.",
                variant: "destructive",
            });
            return;
        }
        onAddSpiral(spiralName);
        setSpiralName('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div className={`transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
                <Label
                    htmlFor="spiral-name-input"
                    className="text-subtleText mb-2 flex items-center text-sm font-medium"
                >
                    <BrainCircuit className="h-4 w-4 mr-1.5 text-cyanAccent" />
                    Idea/Thought to Capture
                </Label>
                <div className="relative">
                    <Input
                        id="spiral-name-input"
                        type="text"
                        placeholder="E.g., Implement dark mode"
                        value={spiralName}
                        onChange={(e) => setSpiralName(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="bg-dark-200/70 border-dark-300/50 focus:ring-cyanAccent focus:border-cyanAccent pl-3 pr-3 py-2 rounded-md shadow-inner transition-all duration-300 hover:bg-dark-200 focus:bg-dark-200"
                    />
                    {spiralName && (
                        <button
                            type="button"
                            onClick={() => setSpiralName('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-subtleText hover:text-lightText transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition-all duration-300 text-white flex items-center justify-center shadow-md"
            >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Add to Spirals
            </Button>
        </form>
    );
}

export default SpiralForm; 
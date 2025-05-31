import React from 'react';
import { Button } from './ui/Button';
import { ArrowRightCircle, Trash2 } from 'lucide-react';

function SpiralItem({ spiral, onRemoveSpiral, onMoveSpiralToTasks }) {
    return (
        <li className="p-3 bg-dark-200 rounded-md shadow flex justify-between items-center ring-1 ring-dark-300 transition-all duration-200 ease-in-out hover:shadow-lg hover:ring-cyanAccent/50">
            <span className="text-lightText flex-grow">
                {spiral.name}
            </span>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMoveSpiralToTasks(spiral.id)}
                    aria-label={`Move spiral ${spiral.name} to tasks`}
                    title="Move to Tasks"
                >
                    <ArrowRightCircle className="h-4 w-4" />
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveSpiral(spiral.id)}
                    aria-label={`Remove spiral ${spiral.name}`}
                    title="Remove Spiral"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </li>
    );
}

export default SpiralItem; 
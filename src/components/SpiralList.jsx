import React from 'react';
import { Button } from './ui/Button';
import { Trash2, ArrowUpRight, Lightbulb } from 'lucide-react';

function SpiralList({ spirals, onRemoveSpiral, onMoveSpiralToTasks }) {
    if (!spirals || spirals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 mt-2">
                <div className="bg-dark-300/30 rounded-full p-4 mb-3">
                    <Lightbulb className="h-8 w-8 text-subtleText" />
                </div>
                <p className="text-subtleText text-center">No ideas or thoughts captured yet.</p>
                <p className="text-xs text-subtleText/70 text-center mt-1">Jot down ideas here without breaking your focus</p>
            </div>
        );
    }

    return (
        <ul className="space-y-3 max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
            {spirals.map((spiral) => (
                <li key={spiral.id} className="p-3.5 mb-1 rounded-lg shadow-sm flex justify-between items-center 
                                             bg-gradient-to-r from-dark-200/80 to-dark-200/60 
                                             ring-1 ring-dark-300/60 hover:ring-purple-500/50
                                             transition-all duration-300 ease-in-out hover:shadow-md
                                             group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50 group-hover:bg-purple-500 transition-colors duration-300"></div>

                    <div className="flex-grow flex items-center min-w-0 pl-2">
                        <span className="relative truncate font-medium group-hover:text-white transition-colors duration-300 ml-1">
                            {spiral.name}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMoveSpiralToTasks(spiral.id)}
                            aria-label={`Move spiral "${spiral.name}" to tasks`}
                            className="w-auto px-3 bg-transparent text-subtleText hover:text-purple-300 border border-transparent
                                     hover:bg-purple-800/20 hover:border-purple-700/40 transition-all duration-300"
                        >
                            <ArrowUpRight className="h-4 w-4 mr-1.5" /> Move
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onRemoveSpiral(spiral.id)}
                            aria-label={`Remove spiral "${spiral.name}"`}
                            className="bg-transparent hover:bg-red-500/20 text-red-400 hover:text-red-300 
                                     border border-transparent hover:border-red-500/30 transition-all duration-300"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default SpiralList; 
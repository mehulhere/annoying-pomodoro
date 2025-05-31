import React from 'react';
import SpiralItem from './SpiralItem';

function SpiralList({ spirals, onRemoveSpiral, onMoveSpiralToTasks }) {
    if (!spirals || spirals.length === 0) {
        return <p className="text-sm text-subtleText text-center py-4">No spirals yet. Add some ideas for later!</p>;
    }

    return (
        <ul className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {spirals.map(spiral => (
                <SpiralItem
                    key={spiral.id}
                    spiral={spiral}
                    onRemoveSpiral={onRemoveSpiral}
                    onMoveSpiralToTasks={onMoveSpiralToTasks}
                />
            ))}
        </ul>
    );
}

export default SpiralList; 
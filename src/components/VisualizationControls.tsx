import React from 'react';

interface VisualizationControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onStepForward: () => void;
    onReset: () => void;
    playbackSpeed: number;
    onSpeedChange: (speed: number) => void;
    isFinished: boolean;
}

export const VisualizationControls: React.FC<VisualizationControlsProps> = ({
    isPlaying,
    onTogglePlay,
    onStepForward,
    onReset,
    playbackSpeed,
    onSpeedChange,
    isFinished
}) => {
    return (
        <div className="controls-container" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', color: '#333' }}>
            <button onClick={onTogglePlay} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                {isPlaying ? 'Pause' : isFinished ? 'Restart' : 'Play'}
            </button>
            <button onClick={onStepForward} disabled={isPlaying || isFinished} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                Step
            </button>
            <button onClick={onReset} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                Reset
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label>Speed:</label>
                <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={1050 - playbackSpeed} // Invert so right is faster
                    onChange={(e) => onSpeedChange(1050 - parseInt(e.target.value))}
                />
                <span>{Math.round(1000 / playbackSpeed)} steps/sec</span>
            </div>
        </div>
    );
};

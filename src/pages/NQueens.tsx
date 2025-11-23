import React, { useState, useMemo } from 'react';
import { NQueensBoard } from '../components/NQueensBoard';
import { VisualizationControls } from '../components/VisualizationControls';
import { useVisualization } from '../hooks/useVisualization';
import { nQueensSolvers } from '../algorithms/nqueens';
import '../styles/NQueens.css';

export const NQueensPage: React.FC = () => {
    const [n, setN] = useState(4);
    const [algorithm, setAlgorithm] = useState<'backtracking' | 'forwardChecking' | 'arcConsistency'>('backtracking');

    const [isUserMode, setIsUserMode] = useState(false);
    const [userAssignments, setUserAssignments] = useState<Record<string, number>>({});
    const [validationMsg, setValidationMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Factory for the solver generator
    const solverFactory = useMemo(() => {
        return () => nQueensSolvers[algorithm](n);
    }, [n, algorithm]);

    // Initial state for the visualization
    const initialState = useMemo(() => {
        // We can just run the generator once to get the initial state, 
        // or manually construct it. The solver yields initial state first.
        const gen = nQueensSolvers[algorithm](n);
        return gen.next().value!;
    }, [n, algorithm]);

    const {
        currentState,
        isPlaying,
        playbackSpeed,
        togglePlay,
        stepForward,
        reset,
        setPlaybackSpeed,
        isFinished
    } = useVisualization(solverFactory, initialState);

    // Handle user clicks
    const handleCellClick = (row: number, col: number) => {
        if (!isUserMode) return;

        setUserAssignments(prev => {
            const newAssignments = { ...prev };
            const key = `Q${row}`;
            if (newAssignments[key] === col) {
                delete newAssignments[key]; // Remove if already there
            } else {
                newAssignments[key] = col; // Place queen
            }
            return newAssignments;
        });
        setValidationMsg(null);
    };

    const validateUserSolution = () => {
        // Check if N queens are placed
        const placedQueens = Object.keys(userAssignments).length;
        if (placedQueens !== n) {
            setValidationMsg({ text: `Place ${n} queens. Currently placed: ${placedQueens}`, type: 'error' });
            return;
        }

        // Check conflicts
        let safe = true;
        for (let r1 = 0; r1 < n; r1++) {
            for (let r2 = r1 + 1; r2 < n; r2++) {
                const c1 = userAssignments[`Q${r1}`];
                const c2 = userAssignments[`Q${r2}`];

                if (c1 !== undefined && c2 !== undefined) {
                    if (c1 === c2 || Math.abs(c1 - c2) === Math.abs(r1 - r2)) {
                        safe = false;
                        break;
                    }
                }
            }
            if (!safe) break;
        }

        if (safe) {
            setValidationMsg({ text: 'Success! Valid Solution.', type: 'success' });
        } else {
            setValidationMsg({ text: 'Invalid! Queens are attacking each other.', type: 'error' });
        }
    };

    // Merge user state into visualization state for rendering
    const displayState = useMemo(() => {
        if (isUserMode) {
            return {
                ...initialState,
                assignments: userAssignments,
                stepDescription: 'User Play Mode',
                highlightedCells: [],
                errorCells: []
            };
        }
        return currentState;
    }, [isUserMode, userAssignments, currentState, initialState]);

    return (
        <div className="n-queens-container">
            <h1>N-Queens Solver</h1>

            <div className="settings-panel" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <label>
                    Board Size (N):
                    <input
                        type="number"
                        min="4"
                        max="12"
                        value={n}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val >= 4 && val <= 12) {
                                setN(val);
                                setUserAssignments({});
                                setValidationMsg(null);
                            }
                        }}
                        disabled={isPlaying}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
                    />
                </label>

                <div style={{ display: 'flex', gap: '0.5rem', background: '#333', padding: '0.25rem', borderRadius: '8px' }}>
                    <button
                        onClick={() => setIsUserMode(false)}
                        style={{
                            background: !isUserMode ? '#fff' : 'transparent',
                            color: !isUserMode ? '#000' : '#fff',
                            border: 'none',
                            boxShadow: !isUserMode ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            borderRadius: '6px'
                        }}
                    >
                        Computer Solve
                    </button>
                    <button
                        onClick={() => { setIsUserMode(true); reset(); }}
                        style={{
                            background: isUserMode ? '#fff' : 'transparent',
                            color: isUserMode ? '#000' : '#fff',
                            border: 'none',
                            boxShadow: isUserMode ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            borderRadius: '6px'
                        }}
                    >
                        User Play
                    </button>
                </div>
            </div>

            {!isUserMode && (
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setAlgorithm('backtracking')}
                        style={{
                            background: algorithm === 'backtracking' ? '#2c3e50' : '#eee',
                            color: algorithm === 'backtracking' ? 'white' : 'black'
                        }}
                    >
                        Backtracking
                    </button>
                    <button
                        onClick={() => setAlgorithm('forwardChecking')}
                        style={{
                            background: algorithm === 'forwardChecking' ? '#2c3e50' : '#eee',
                            color: algorithm === 'forwardChecking' ? 'white' : 'black'
                        }}
                    >
                        Forward Checking
                    </button>
                    <button
                        onClick={() => setAlgorithm('arcConsistency')}
                        style={{
                            background: algorithm === 'arcConsistency' ? '#2c3e50' : '#eee',
                            color: algorithm === 'arcConsistency' ? 'white' : 'black'
                        }}
                    >
                        Arc Consistency
                    </button>
                </div>
            )}

            {!isUserMode ? (
                <VisualizationControls
                    isPlaying={isPlaying}
                    onTogglePlay={togglePlay}
                    onStepForward={stepForward}
                    onReset={reset}
                    playbackSpeed={playbackSpeed}
                    onSpeedChange={setPlaybackSpeed}
                    isFinished={isFinished}
                />
            ) : (
                <div className="controls-container" style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', marginBottom: '1rem' }}>
                    <button onClick={validateUserSolution} style={{ background: '#27ae60', color: 'white' }}>
                        Validate Solution
                    </button>
                    <button onClick={() => { setUserAssignments({}); setValidationMsg(null); }} style={{ marginLeft: '1rem' }}>
                        Clear Board
                    </button>
                    {validationMsg && (
                        <div style={{ marginTop: '0.5rem', color: validationMsg.type === 'success' ? '#27ae60' : '#c0392b', fontWeight: 'bold' }}>
                            {validationMsg.text}
                        </div>
                    )}
                </div>
            )}

            <div className="status-panel">
                <h3>{displayState?.stepDescription || 'Ready'}</h3>
            </div>

            <NQueensBoard n={n} state={displayState} onCellClick={handleCellClick} />

        </div>
    );
};

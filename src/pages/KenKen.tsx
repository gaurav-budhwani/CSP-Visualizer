import React, { useMemo } from 'react';
import { KenKenBoard } from '../components/KenKenBoard';
import { VisualizationControls } from '../components/VisualizationControls';
import { useVisualization } from '../hooks/useVisualization';
import { kenKenSolvers, generateKenKenPuzzle, checkCage } from '../algorithms/kenken';
import '../styles/KenKen.css';

export const KenKenPage: React.FC = () => {
    // For now, we only support the hardcoded 4x4 puzzle
    const [n, setN] = React.useState(4);
    const [puzzle, setPuzzle] = React.useState(() => generateKenKenPuzzle(4));
    const [algorithm, setAlgorithm] = React.useState<'backtracking' | 'forwardChecking' | 'arcConsistency'>('backtracking');

    const [isUserMode, setIsUserMode] = React.useState(false);
    const [userAssignments, setUserAssignments] = React.useState<Record<string, number>>({});
    const [validationMsg, setValidationMsg] = React.useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [selectedCell, setSelectedCell] = React.useState<string | null>(null);

    // Factory for the solver generator
    const solverFactory = useMemo(() => {
        return () => kenKenSolvers[algorithm](puzzle);
    }, [puzzle, algorithm]);

    // Initial state for the visualization
    const initialState = useMemo(() => {
        const gen = kenKenSolvers[algorithm](puzzle);
        return gen.next().value!;
    }, [puzzle, algorithm]);

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

    const handleCellClick = (row: number, col: number) => {
        if (!isUserMode) return;
        setSelectedCell(`${row},${col}`);
    };

    const handleNumberInput = (num: number) => {
        if (!isUserMode || !selectedCell) return;

        setUserAssignments(prev => ({
            ...prev,
            [selectedCell]: num
        }));
        setValidationMsg(null);
    };

    // Keyboard listener for number input
    React.useEffect(() => {
        if (!isUserMode) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const num = parseInt(e.key);
            if (!isNaN(num) && num >= 1 && num <= puzzle.n) {
                handleNumberInput(num);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                if (selectedCell) {
                    setUserAssignments(prev => {
                        const next = { ...prev };
                        delete next[selectedCell];
                        return next;
                    });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isUserMode, selectedCell, puzzle.n]);

    const validateUserSolution = () => {
        // Check if all filled
        const filledCount = Object.keys(userAssignments).length;
        if (filledCount !== puzzle.n * puzzle.n) {
            setValidationMsg({ text: `Fill all cells.`, type: 'error' });
            return;
        }

        // Check Row/Col Uniqueness
        for (let r = 0; r < puzzle.n; r++) {
            const rowVals = new Set();
            const colVals = new Set();
            for (let c = 0; c < puzzle.n; c++) {
                const rv = userAssignments[`${r},${c}`];
                const cv = userAssignments[`${c},${r}`];
                if (rowVals.has(rv)) {
                    setValidationMsg({ text: `Duplicate in Row ${r + 1}`, type: 'error' });
                    return;
                }
                if (colVals.has(cv)) {
                    setValidationMsg({ text: `Duplicate in Column ${r + 1}`, type: 'error' });
                    return;
                }
                rowVals.add(rv);
                colVals.add(cv);
            }
        }

        // Check Cages
        for (const cage of puzzle.cages) {
            if (!checkCage(cage, userAssignments)) {
                setValidationMsg({ text: `Cage target ${cage.target} (${cage.operation}) not met`, type: 'error' });
                return;
            }
        }

        setValidationMsg({ text: 'Success! Valid Solution.', type: 'success' });
    };

    const displayState = useMemo(() => {
        if (isUserMode) {
            return {
                ...initialState,
                assignments: userAssignments,
                stepDescription: 'User Play Mode',
                highlightedCells: selectedCell ? [selectedCell] : [],
                errorCells: []
            };
        }
        return currentState;
    }, [isUserMode, userAssignments, currentState, initialState, selectedCell]);

    return (
        <div className="kenken-container">
            <h1>KenKen Solver</h1>

            <div className="settings-panel" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ color: '#fff' }}>Size:</label>
                    <select
                        value={n}
                        onChange={(e) => {
                            const newN = parseInt(e.target.value);
                            setN(newN);
                            setPuzzle(generateKenKenPuzzle(newN));
                            reset();
                            setUserAssignments({});
                            setValidationMsg(null);
                        }}
                        style={{ padding: '0.25rem', borderRadius: '4px' }}
                        disabled={isPlaying}
                    >
                        {[4, 5, 6, 7, 8, 9, 10].map(size => (
                            <option key={size} value={size}>{size}x{size}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            setPuzzle(generateKenKenPuzzle(n));
                            reset();
                            setUserAssignments({});
                            setValidationMsg(null);
                        }}
                        style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                        disabled={isPlaying}
                    >
                        New Game
                    </button>
                </div>

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
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => setAlgorithm('backtracking')}
                        style={{
                            background: algorithm === 'backtracking' ? '#2c3e50' : '#eee',
                            color: algorithm === 'backtracking' ? 'white' : 'black',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Backtracking
                    </button>
                    <button
                        onClick={() => setAlgorithm('forwardChecking')}
                        style={{
                            background: algorithm === 'forwardChecking' ? '#2c3e50' : '#eee',
                            color: algorithm === 'forwardChecking' ? 'white' : 'black',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Forward Checking
                    </button>
                    <button
                        onClick={() => setAlgorithm('arcConsistency')}
                        style={{
                            background: algorithm === 'arcConsistency' ? '#2c3e50' : '#eee',
                            color: algorithm === 'arcConsistency' ? 'white' : 'black',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
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
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>Click cell and type number (1-{puzzle.n})</p>
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

            <KenKenBoard puzzle={puzzle} state={displayState} onCellClick={handleCellClick} />

        </div>
    );
};

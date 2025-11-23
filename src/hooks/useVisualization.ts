import { useState, useEffect, useRef, useCallback } from 'react';
import type { CSPSolverGenerator, CSPSolverState } from '../types/csp';

export interface UseVisualizationResult<T> {
    currentState: CSPSolverState<T> | null;
    isPlaying: boolean;
    playbackSpeed: number;
    togglePlay: () => void;
    stepForward: () => void;
    reset: () => void;
    setPlaybackSpeed: (speed: number) => void;
    isFinished: boolean;
}

export function useVisualization<T>(
    solverGeneratorFactory: () => CSPSolverGenerator<T>,
    initialState: CSPSolverState<T>
): UseVisualizationResult<T> {
    const [currentState, setCurrentState] = useState<CSPSolverState<T> | null>(initialState);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(500); // ms per step
    const [isFinished, setIsFinished] = useState(false);

    const generatorRef = useRef<CSPSolverGenerator<T> | null>(null);
    const timerRef = useRef<number | null>(null);

    const initGenerator = useCallback(() => {
        generatorRef.current = solverGeneratorFactory();
        setIsFinished(false);
        setCurrentState(initialState);
    }, [solverGeneratorFactory, initialState]);

    // Initialize on mount or when factory changes
    useEffect(() => {
        initGenerator();
        return () => stopTimer();
    }, [initGenerator]);

    const stopTimer = () => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const stepForward = useCallback(() => {
        if (!generatorRef.current) return;

        const next = generatorRef.current.next();
        if (next.done) {
            setIsFinished(true);
            setIsPlaying(false);
            stopTimer();
        } else {
            setCurrentState(next.value);
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            setIsPlaying(false);
            stopTimer();
        } else {
            if (isFinished) {
                initGenerator(); // Restart if finished
            }
            setIsPlaying(true);
        }
    }, [isPlaying, isFinished, initGenerator]);

    useEffect(() => {
        if (isPlaying && !isFinished) {
            stopTimer();
            timerRef.current = window.setInterval(stepForward, playbackSpeed);
        } else {
            stopTimer();
        }
        return () => stopTimer();
    }, [isPlaying, playbackSpeed, stepForward, isFinished]);

    const reset = useCallback(() => {
        setIsPlaying(false);
        stopTimer();
        initGenerator();
    }, [initGenerator]);

    return {
        currentState,
        isPlaying,
        playbackSpeed,
        togglePlay,
        stepForward,
        reset,
        setPlaybackSpeed,
        isFinished
    };
}

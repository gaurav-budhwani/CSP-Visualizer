import React from 'react';
import '../styles/KenKen.css';
import type { CSPSolverState } from '../types/csp';
import type { KenKenPuzzle, Cage } from '../algorithms/kenken';

interface KenKenBoardProps {
    puzzle: KenKenPuzzle;
    state: CSPSolverState<number> | null;
    onCellClick?: (row: number, col: number) => void;
}

export const KenKenBoard: React.FC<KenKenBoardProps> = ({ puzzle, state, onCellClick }) => {

    const getCage = (r: number, c: number): Cage | undefined => {
        return puzzle.cages.find(cage => cage.cells.some(([cr, cc]) => cr === r && cc === c));
    };

    const renderCell = (row: number, col: number) => {
        const val = state?.assignments[`${row},${col}`];
        const isHighlighted = state?.highlightedCells?.includes(`${row},${col}`);
        const isError = state?.errorCells?.includes(`${row},${col}`);

        const cage = getCage(row, col);
        const isCageTopLeft = cage && cage.cells[0][0] === row && cage.cells[0][1] === col; // Simplified label placement

        // Determine borders based on cage
        let classes = 'kenken-cell';
        if (isHighlighted) classes += ' highlighted';
        if (isError) classes += ' error';

        if (cage) {
            // Check neighbors to see if we need a thick border
            const inCage = (r: number, c: number) => cage.cells.some(([cr, cc]) => cr === r && cc === c);

            if (!inCage(row - 1, col)) classes += ' cage-top';
            if (!inCage(row + 1, col)) classes += ' cage-bottom';
            if (!inCage(row, col - 1)) classes += ' cage-left';
            if (!inCage(row, col + 1)) classes += ' cage-right';
        }

        return (
            <div
                key={`${row}-${col}`}
                className={classes}
                onClick={() => onCellClick && onCellClick(row, col)}
                style={{ cursor: onCellClick ? 'pointer' : 'default' }}
            >
                {isCageTopLeft && (
                    <span className="cage-label">
                        {cage?.target}{cage?.operation !== '=' ? cage?.operation : ''}
                    </span>
                )}
                {val}
            </div>
        );
    };

    return (
        <div
            className="kenken-board"
            style={{
                gridTemplateColumns: `repeat(${puzzle.n}, 70px)`,
                gridTemplateRows: `repeat(${puzzle.n}, 70px)`
            }}
        >
            {Array.from({ length: puzzle.n }).map((_, row) =>
                Array.from({ length: puzzle.n }).map((_, col) => renderCell(row, col))
            )}
        </div>
    );
};

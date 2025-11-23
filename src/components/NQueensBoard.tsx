import React from 'react';
import '../styles/NQueens.css';
import type { CSPSolverState } from '../types/csp';

interface NQueensBoardProps {
    n: number;
    state: CSPSolverState<number> | null;
    onCellClick?: (row: number, col: number) => void;
}

export const NQueensBoard: React.FC<NQueensBoardProps> = ({ n, state, onCellClick }) => {
    const renderCell = (row: number, col: number) => {
        const isDark = (row + col) % 2 === 1;
        const queenAtRow = state?.assignments[`Q${row}`];
        const hasQueen = queenAtRow === col;

        // Check if this cell is highlighted or error
        const isHighlighted = state?.highlightedCells?.includes(`${row},${col}`);
        const isError = state?.errorCells?.includes(`${row},${col}`);

        // Check domain elimination (for forward checking/AC-3 later)
        // If we have domain info, we can show if 'col' is removed from 'Q{row}' domain
        const isEliminated = state?.domains && !state.domains[`Q${row}`]?.includes(col);

        let className = `cell ${isDark ? 'dark' : 'light'}`;
        if (isHighlighted) className += ' highlighted';
        if (isError) className += ' error';
        if (isEliminated && !hasQueen) className += ' domain-eliminated';

        return (
            <div
                key={`${row}-${col}`}
                className={className}
                onClick={() => onCellClick && onCellClick(row, col)}
                style={{ cursor: onCellClick ? 'pointer' : 'default' }}
            >
                {hasQueen && <span className="queen">♛</span>}
            </div>
        );
    };

    return (
        <div
            className="board"
            style={{
                gridTemplateColumns: `repeat(${n}, 60px)`,
                gridTemplateRows: `repeat(${n}, 60px)`
            }}
        >
            {Array.from({ length: n }).map((_, row) =>
                Array.from({ length: n }).map((_, col) => renderCell(row, col))
            )}
        </div>
    );
};

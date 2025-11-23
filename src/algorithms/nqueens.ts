import type { CSPSolverGenerator, CSPSolverState, CSPVariable } from '../types/csp';

export type NQueensAlgorithm = 'backtracking' | 'forwardChecking' | 'arcConsistency';

const createInitialState = (n: number): CSPSolverState<number> => {
    const variables: Record<string, CSPVariable<number>> = {};
    const domains: Record<string, number[]> = {};
    const assignments: Record<string, number> = {};

    for (let i = 0; i < n; i++) {
        const id = `Q${i}`; // Queen at row i
        const domain = Array.from({ length: n }, (_, j) => j); // Columns 0 to n-1
        variables[id] = { id, domain, value: null };
        domains[id] = [...domain];
    }

    return {
        variables,
        assignments,
        domains,
        stepDescription: 'Initial State',
        highlightedVariables: [],
        highlightedCells: [],
        errorCells: []
    };
};

function* solveBacktracking(n: number): CSPSolverGenerator<number> {
    let state = createInitialState(n);
    yield state;

    const solve = function* (row: number): Generator<CSPSolverState<number>, boolean, void> {
        if (row === n) {
            state = { ...state, stepDescription: 'Solution Found!', highlightedVariables: [] };
            yield state;
            return true;
        }

        const varId = `Q${row}`;
        state = { ...state, highlightedVariables: [varId], stepDescription: `Processing Row ${row}` };
        yield state;

        for (let col = 0; col < n; col++) {
            // Check constraints
            let safe = true;
            for (let prevRow = 0; prevRow < row; prevRow++) {
                const prevCol = state.assignments[`Q${prevRow}`];
                if (prevCol === col || Math.abs(prevCol - col) === Math.abs(prevRow - row)) {
                    safe = false;
                    break;
                }
            }

            if (safe) {
                // Place Queen
                const newAssignments = { ...state.assignments, [varId]: col };
                state = {
                    ...state,
                    assignments: newAssignments,
                    stepDescription: `Placed Q${row} at column ${col}`,
                    highlightedCells: [`${row},${col}`]
                };
                yield state;

                if (yield* solve(row + 1)) {
                    return true;
                }

                // Backtrack
                const backtrackingAssignments = { ...state.assignments };
                delete backtrackingAssignments[varId];
                state = {
                    ...state,
                    assignments: backtrackingAssignments,
                    stepDescription: `Backtracking from Q${row} at column ${col}`,
                    highlightedCells: []
                };
                yield state;
            } else {
                state = {
                    ...state,
                    stepDescription: `Cannot place Q${row} at column ${col} (Conflict)`,
                    errorCells: [`${row},${col}`]
                };
                yield state;
                // Clear error after showing it
                state = { ...state, errorCells: [] };
            }
        }
        return false;
    };

    yield* solve(0);
    return null;
}

// Forward Checking Solver
function* solveForwardChecking(n: number): CSPSolverGenerator<number> {
    let state = createInitialState(n);
    yield state;

    const solveRecursive = function* (row: number, currentState: CSPSolverState<number>): Generator<CSPSolverState<number>, boolean, void> {
        if (row === n) {
            state = { ...currentState, stepDescription: 'Solution Found!', highlightedVariables: [] };
            yield state;
            return true;
        }

        const varId = `Q${row}`;
        state = { ...currentState, highlightedVariables: [varId], stepDescription: `Processing Row ${row}` };
        yield state;

        const currentDomain = currentState.domains[varId];

        for (const col of currentDomain) {
            // Forward Check
            const newDomains = { ...currentState.domains };
            let valid = true;

            for (let nextRow = row + 1; nextRow < n; nextRow++) {
                const nextVarId = `Q${nextRow}`;
                const originalDomain = newDomains[nextVarId];
                const filteredDomain = originalDomain.filter(nextCol => {
                    if (nextCol === col || Math.abs(nextCol - col) === Math.abs(nextRow - row)) {
                        return false;
                    }
                    return true;
                });

                if (filteredDomain.length === 0) {
                    valid = false;
                }
                newDomains[nextVarId] = filteredDomain;
            }

            const newAssignments = { ...currentState.assignments, [varId]: col };

            if (valid) {
                state = {
                    ...currentState,
                    assignments: newAssignments,
                    domains: newDomains,
                    stepDescription: `Placed Q${row} at ${col}. Forward Checked.`,
                    highlightedCells: [`${row},${col}`]
                };
                yield state;

                if (yield* solveRecursive(row + 1, state)) {
                    return true;
                }

                // Backtracking happens naturally as we continue loop with original 'currentState'
                state = {
                    ...currentState,
                    stepDescription: `Backtracking from Q${row} at ${col}`,
                    highlightedCells: []
                };
                yield state;

            } else {
                state = {
                    ...currentState,
                    assignments: newAssignments,
                    domains: newDomains,
                    stepDescription: `Pruning Q${row}=${col} (Empty Domain detected)`,
                    errorCells: [`${row},${col}`]
                };
                yield state;
                // Continue loop
                state = { ...currentState, errorCells: [] };
            }
        }
        return false;
    };

    yield* solveRecursive(0, state);
    return null;
}

// Arc Consistency (MAC) Solver
function* solveArcConsistency(n: number): CSPSolverGenerator<number> {
    let state = createInitialState(n);
    yield state;

    const solveRecursive = function* (row: number, currentState: CSPSolverState<number>): Generator<CSPSolverState<number>, boolean, void> {
        if (row === n) {
            state = { ...currentState, stepDescription: 'Solution Found!', highlightedVariables: [] };
            yield state;
            return true;
        }

        const varId = `Q${row}`;
        state = { ...currentState, highlightedVariables: [varId], stepDescription: `Processing Row ${row}` };
        yield state;

        const currentDomain = currentState.domains[varId];

        for (const col of currentDomain) {
            // 1. Assign and Forward Check (Prune neighbors of current)
            const newAssignments = { ...currentState.assignments, [varId]: col };
            let newDomains = { ...currentState.domains };
            // Set domain of current to just [col] effectively (or just ignore it in future checks)
            newDomains[varId] = [col];

            let valid = true;

            // Initial pruning (Forward Checking step)
            for (let nextRow = row + 1; nextRow < n; nextRow++) {
                const nextVarId = `Q${nextRow}`;
                newDomains[nextVarId] = newDomains[nextVarId].filter(nextCol =>
                    nextCol !== col && Math.abs(nextCol - col) !== Math.abs(nextRow - row)
                );
                if (newDomains[nextVarId].length === 0) valid = false;
            }

            if (!valid) {
                state = {
                    ...currentState,
                    assignments: newAssignments,
                    domains: newDomains,
                    stepDescription: `Pruning Q${row}=${col} (FC failure)`,
                    errorCells: [`${row},${col}`]
                };
                yield state;
                // Continue to next value in domain
                state = { ...currentState, errorCells: [] };
                continue;
            }

            // 2. AC-3 Propagation among future variables
            const queue: [number, number][] = [];
            // Add all arcs between future variables
            for (let i = row + 1; i < n; i++) {
                for (let j = row + 1; j < n; j++) {
                    if (i !== j) queue.push([i, j]);
                }
            }

            while (queue.length > 0) {
                const [i, j] = queue.shift()!;
                const idI = `Q${i}`;
                const idJ = `Q${j}`;

                const domainI = newDomains[idI];
                const domainJ = newDomains[idJ];

                const newDomainI = domainI.filter(valI => {
                    // Check if there exists ANY valJ in domainJ that is consistent
                    const hasSupport = domainJ.some(valJ =>
                        valI !== valJ && Math.abs(valI - valJ) !== Math.abs(i - j)
                    );
                    return hasSupport;
                });

                if (newDomainI.length !== domainI.length) {
                    newDomains[idI] = newDomainI;
                    if (newDomainI.length === 0) {
                        valid = false;
                        break;
                    }
                    // Add neighbors of i to queue (excluding j)
                    for (let k = row + 1; k < n; k++) {
                        if (k !== i && k !== j) {
                            queue.push([k, i]);
                        }
                    }
                }
            }

            if (valid) {
                state = {
                    ...currentState,
                    assignments: newAssignments,
                    domains: newDomains,
                    stepDescription: `Placed Q${row} at ${col}. AC-3 Propagated.`,
                    highlightedCells: [`${row},${col}`]
                };
                yield state;

                if (yield* solveRecursive(row + 1, state)) {
                    return true;
                }

                // Backtrack
                state = {
                    ...currentState,
                    stepDescription: `Backtracking from Q${row} at ${col}`,
                    highlightedCells: []
                };
                yield state;
            } else {
                state = {
                    ...currentState,
                    assignments: newAssignments,
                    domains: newDomains,
                    stepDescription: `Pruning Q${row}=${col} (AC-3 failure)`,
                    errorCells: [`${row},${col}`]
                };
                yield state;
                state = { ...currentState, errorCells: [] };
            }
        }
        return false;
    };

    yield* solveRecursive(0, state);
    return null;
}

export const nQueensSolvers = {
    backtracking: solveBacktracking,
    forwardChecking: solveForwardChecking,
    arcConsistency: solveArcConsistency
};

export function validateNQueensCSP(n: number, assignments: Record<string, number>): { valid: boolean, message: string, errorCells: string[] } {
    // 1. Check for direct conflicts (attacking queens)
    const errorCells: string[] = [];
    let directConflict = false;

    for (let r1 = 0; r1 < n; r1++) {
        const c1 = assignments[`Q${r1}`];
        if (c1 === undefined) continue;

        for (let r2 = r1 + 1; r2 < n; r2++) {
            const c2 = assignments[`Q${r2}`];
            if (c2 === undefined) continue;

            if (c1 === c2 || Math.abs(c1 - c2) === Math.abs(r1 - r2)) {
                directConflict = true;
                if (!errorCells.includes(`${r1},${c1}`)) errorCells.push(`${r1},${c1}`);
                if (!errorCells.includes(`${r2},${c2}`)) errorCells.push(`${r2},${c2}`);
            }
        }
    }

    if (directConflict) {
        return { valid: false, message: 'Invalid! Queens are attacking each other.', errorCells };
    }

    // 2. Forward Checking: Check if any future variable has an empty domain
    // We need to reconstruct domains based on current assignments
    const domains: Record<string, number[]> = {};
    for (let i = 0; i < n; i++) {
        domains[`Q${i}`] = Array.from({ length: n }, (_, j) => j);
    }

    // Apply assignments to prune domains
    for (let r = 0; r < n; r++) {
        const c = assignments[`Q${r}`];
        if (c !== undefined) {
            // This variable is assigned, so its domain is just [c] (conceptually)
            // But for FC, we prune OTHERS based on this.

            for (let nextRow = 0; nextRow < n; nextRow++) {
                if (nextRow === r) continue; // Skip self

                // If nextRow is already assigned, we already checked conflicts above.
                // If unassigned, we prune its domain.
                if (assignments[`Q${nextRow}`] === undefined) {
                    domains[`Q${nextRow}`] = domains[`Q${nextRow}`].filter(nextCol => {
                        return nextCol !== c && Math.abs(nextCol - c) !== Math.abs(nextRow - r);
                    });
                }
            }
        }
    }

    // Check for empty domains in unassigned variables
    for (let r = 0; r < n; r++) {
        if (assignments[`Q${r}`] === undefined) {
            if (domains[`Q${r}`].length === 0) {
                return {
                    valid: false,
                    message: `CSP Check Failed: Row ${r} has no valid moves remaining!`,
                    errorCells: [] // No specific cell to highlight for empty domain, maybe just show message
                };
            }
        }
    }

    return { valid: true, message: 'CSP Check Passed: Valid so far (Forward Checking OK).', errorCells: [] };
}

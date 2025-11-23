export interface CSPVariable<T> {
  id: string;
  domain: T[];
  value: T | null;
}

export interface CSPConstraint<T> {
  variables: string[]; // IDs of variables involved
  check: (assignment: Record<string, T>) => boolean;
}

export interface CSPSolverState<T> {
  variables: Record<string, CSPVariable<T>>;
  assignments: Record<string, T>;
  domains: Record<string, T[]>; // Current domains for each variable
  stepDescription: string;
  highlightedVariables?: string[]; // IDs of variables to highlight (e.g., current focus)
  highlightedCells?: string[]; // For grid based, specific cells
  errorCells?: string[]; // Cells causing conflict
}

export type CSPSolverGenerator<T> = Generator<CSPSolverState<T>, CSPSolverState<T> | null, void>;

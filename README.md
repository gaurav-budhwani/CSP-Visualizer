# CSP Visualizer - FAI Project

## Overview
This project is an interactive **Constraint Satisfaction Problem (CSP) Visualizer** built with React and TypeScript. It demonstrates how AI algorithms solve complex constraint problems like **N-Queens** and **KenKen** puzzles.

The application features a premium UI with real-time visualization of solver steps, allowing users to understand algorithms like Backtracking, Forward Checking, and Arc Consistency.

## Features

### N-Queens Solver
- **Interactive Board**: Visualize the placement of queens on an N x N board.
- **Adjustable Size**: Support for board sizes from **4x4 to 12x12**.
- **Algorithms**:
  - **Backtracking**: Standard depth-first search.
  - **Forward Checking**: Prunes domains to detect failures early.
  - **Arc Consistency (MAC)**: Uses AC-3 to maintain arc consistency during search.
- **User Play Mode**:
  - Manually place queens.
  - **Validation**: Instant feedback on conflicts (row, column, diagonal).

### KenKen Solver
- **Puzzle Generator**: Dynamically generates valid KenKen puzzles from **4x4 to 10x10**.
- **Algorithms**:
  - **Backtracking**: Brute-force with constraint checking.
  - **Forward Checking**: Prunes invalid options based on row/col constraints.
  - **Arc Consistency**: Advanced propagation for efficient solving.
- **User Play Mode**:
  - **Smart Hints**: Click a cell to see mathematically valid options based on cage and board state.
  - **Progress Check**: Validate your current moves against the solution without revealing the entire board.
  - **Cage Validation**: Ensures math constraints (Sum, Subtract, Multiply, Divide) are met.

## Technologies Used
- **Frontend**: React, TypeScript, Vite
- **Styling**: CSS3 (Variables, Flexbox, Grid, Animations)
- **State Management**: React Hooks (useState, useMemo, useEffect)

## How to Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tapananshu17/FAI_Project.git
   cd FAI_Project
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173` (or the URL shown in your terminal).

## Project Structure
- `src/algorithms/`: Core CSP solver logic (nqueens.ts, kenken.ts).
- `src/components/`: Reusable UI components (Board, Controls).
- `src/pages/`: Main game pages (Home, NQueens, KenKen).
- `src/hooks/`: Custom hooks for visualization state.
- `src/styles/`: CSS files for styling.
---

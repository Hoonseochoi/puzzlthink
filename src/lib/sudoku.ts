export type Difficulty = 'easy' | 'medium' | 'hard';

export type Board = number[][]; // 9x9 array, 0 means empty

// Helper: Create an empty 9x9 board
export const createEmptyBoard = (): Board => {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
};

// Helper: Deep copy a board
export const copyBoard = (board: Board): Board => {
    return board.map(row => [...row]);
};

// Check if placing `num` at `row`, `col` is valid
export const isValid = (board: Board, row: number, col: number, num: number): boolean => {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) return false;
        if (board[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
};

// Shuffle an array
const shuffle = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Solve board using backtracking, returns true if solved
export const solveBoard = (board: Board): boolean => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                // Try numbers 1-9 in random order for better generation
                const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (const n of numbers) {
                    if (isValid(board, r, c, n)) {
                        board[r][c] = n;
                        if (solveBoard(board)) {
                            return true;
                        }
                        board[r][c] = 0; // Backtrack
                    }
                }
                return false; // No valid number found
            }
        }
    }
    return true; // Solved
};

// Count solutions to ensure unique puzzle
let solutionCount = 0;
const countSolutions = (board: Board): void => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                for (let n = 1; n <= 9; n++) {
                    if (isValid(board, r, c, n)) {
                        board[r][c] = n;
                        countSolutions(board);
                        if (solutionCount > 1) {
                            board[r][c] = 0;
                            return;
                        }
                        board[r][c] = 0;
                    }
                }
                return;
            }
        }
    }
    solutionCount++;
};

export const hasUniqueSolution = (board: Board): boolean => {
    solutionCount = 0;
    countSolutions(board);
    return solutionCount === 1;
};

// Generate a complete solved board
export const generateSolution = (): Board => {
    const board = createEmptyBoard();
    solveBoard(board);
    return board;
};

// Generate puzzle with specific difficulty
export const generatePuzzle = (difficulty: Difficulty) => {
    const solution = generateSolution();
    const puzzle = copyBoard(solution);

    // Define target clues based on difficulty
    let clues = 38;
    if (difficulty === 'medium') clues = 30;
    if (difficulty === 'hard') clues = 24;

    let cellsToRemove = 81 - clues;
    const positions = shuffle(
        Array.from({ length: 81 }, (_, i) => ({ r: Math.floor(i / 9), c: i % 9 }))
    );

    for (const pos of positions) {
        if (cellsToRemove <= 0) break;
        const { r, c } = pos;
        const backup = puzzle[r][c];
        if (backup !== 0) {
            puzzle[r][c] = 0;
            // For MVP, we'll ensure unique solution, though it can make generation slow
            // For a truly fast MVP, you might skip this or use a more optimized approach,
            // but typical unique validation is acceptable for client-side generation.
            const puzzleCopy = copyBoard(puzzle);
            if (!hasUniqueSolution(puzzleCopy)) {
                puzzle[r][c] = backup; // Put back if not unique
            } else {
                cellsToRemove--;
            }
        }
    }

    // Fallback: If we couldn't remove enough while keeping it unique
    // (unlikely, but possible), we just accept it as being slightly easier.

    return { puzzle, solution };
};

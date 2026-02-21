import { useState, useEffect, useCallback } from 'react';
import { Board, generatePuzzle, Difficulty, copyBoard } from '@/lib/sudoku';

export type CellPos = { r: number; c: number } | null;
export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost';

export interface UseSudokuReturn {
    board: Board;
    initialBoard: Board;
    solution: Board;
    status: GameStatus;
    difficulty: Difficulty;
    mistakes: number;
    timer: number;
    selectedCell: CellPos;
    hintedCell: CellPos;
    notesMode: boolean;
    notes: Set<number>[][];
    hintsRemaining: number;

    startGame: (diff: Difficulty) => void;
    selectCell: (r: number, c: number) => void;
    inputValue: (val: number) => void;
    toggleNotesMode: () => void;
    erase: () => void;
    hint: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
}

export const useSudoku = (): UseSudokuReturn => {
    const [board, setBoard] = useState<Board>([]);
    const [initialBoard, setInitialBoard] = useState<Board>([]);
    const [solution, setSolution] = useState<Board>([]);

    const [status, setStatus] = useState<GameStatus>('idle');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [mistakes, setMistakes] = useState(0);
    const [timer, setTimer] = useState(0);
    const [selectedCell, setSelectedCell] = useState<CellPos>(null);
    const [hintedCell, setHintedCell] = useState<CellPos>(null);
    const [hintsRemaining, setHintsRemaining] = useState(1);

    const [notesMode, setNotesMode] = useState(false);
    const [notes, setNotes] = useState<Set<number>[][]>([]);

    // Timer interval
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'playing') {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const startGame = useCallback((diff: Difficulty) => {
        const { puzzle, solution: newSolution } = generatePuzzle(diff);
        setInitialBoard(copyBoard(puzzle));
        setBoard(copyBoard(puzzle));
        setSolution(newSolution);
        setStatus('playing');
        setDifficulty(diff);
        setMistakes(0);
        setTimer(0);
        setSelectedCell(null);
        setHintedCell(null);
        setHintsRemaining(1);
        setNotesMode(false);

        // Init notes 9x9 array of empty sets
        setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>())));
    }, []);

    const inputValue = useCallback((val: number) => {
        if (status !== 'playing' || !selectedCell) return;
        const { r, c } = selectedCell;

        // Can't edit initial cluse
        if (initialBoard[r][c] !== 0) return;

        // If it's already correct, usually we don't let it change
        if (board[r][c] === solution[r][c]) return;

        if (notesMode) {
            // Toggle note
            setNotes((prevNotes) => {
                const newNotes = prevNotes.map(row => row.map(cellSets => new Set(cellSets)));
                if (newNotes[r][c].has(val)) {
                    newNotes[r][c].delete(val);
                } else {
                    newNotes[r][c].add(val);
                }
                return newNotes;
            });
        } else {
            // Input value
            if (board[r][c] === val) return; // same value

            setHintedCell(null);
            const newBoard = copyBoard(board);
            newBoard[r][c] = val;
            setBoard(newBoard);

            if (val !== solution[r][c]) {
                // Mistake
                setMistakes((m) => {
                    const newM = m + 1;
                    if (newM >= 3) {
                        setStatus('lost');
                    }
                    return newM;
                });
            } else {
                // Correct value: Clean up notes in same row/col/box
                setNotes((prevNotes) => {
                    const newNotes = prevNotes.map(row => row.map(cellSets => new Set(cellSets)));
                    for (let i = 0; i < 9; i++) {
                        newNotes[r][i].delete(val);
                        newNotes[i][c].delete(val);
                    }
                    const startR = Math.floor(r / 3) * 3;
                    const startC = Math.floor(c / 3) * 3;
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            newNotes[startR + i][startC + j].delete(val);
                        }
                    }
                    return newNotes;
                });

                // Check win condition
                let isWon = true;
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        if (newBoard[i][j] !== solution[i][j]) {
                            isWon = false;
                            break;
                        }
                    }
                }
                if (isWon) setStatus('won');
            }
        }
    }, [board, initialBoard, solution, status, selectedCell, notesMode]);

    const erase = useCallback(() => {
        if (status !== 'playing' || !selectedCell) return;
        const { r, c } = selectedCell;
        if (initialBoard[r][c] !== 0) return; // can't erase clue
        if (board[r][c] === solution[r][c]) return; // typically can't erase correct input

        setHintedCell(null);
        const newBoard = copyBoard(board);
        newBoard[r][c] = 0;
        setBoard(newBoard);
    }, [board, initialBoard, solution, status, selectedCell]);

    const hint = useCallback(() => {
        if (status !== 'playing' || hintsRemaining <= 0) return;

        // 가장 유추하기 쉬운(가능한 숫자의 개수가 가장 적은) 빈 칸 탐색
        let bestCell = null;
        let minCandidates = 10; // 9보다 큰 값으로 초기화

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) {
                    let candidates = 0;
                    for (let v = 1; v <= 9; v++) {
                        let isValid = true;
                        // 가로, 세로, 3x3 박스 내 v 사용 여부 확인
                        for (let i = 0; i < 9; i++) {
                            if (board[r][i] === v || board[i][c] === v) isValid = false;
                        }
                        const br = Math.floor(r / 3) * 3;
                        const bc = Math.floor(c / 3) * 3;
                        for (let i = 0; i < 3; i++) {
                            for (let j = 0; j < 3; j++) {
                                if (board[br + i][bc + j] === v) isValid = false;
                            }
                        }
                        if (isValid) candidates++;
                    }

                    if (candidates < minCandidates) {
                        minCandidates = candidates;
                        bestCell = { r, c };
                    }
                }
            }
        }

        if (bestCell) {
            const { r, c } = bestCell;
            const newBoard = copyBoard(board);
            newBoard[r][c] = solution[r][c];
            setBoard(newBoard);
            setHintedCell({ r, c });
            setHintsRemaining((prev) => prev - 1);

            // 해당 칸과 관련된 노트 항목 제거
            setNotes((prevNotes) => {
                const newNotes = prevNotes.map(row => row.map(cellSets => new Set(cellSets)));
                const val = solution[r][c];
                for (let i = 0; i < 9; i++) {
                    newNotes[r][i].delete(val);
                    newNotes[i][c].delete(val);
                }
                const startR = Math.floor(r / 3) * 3;
                const startC = Math.floor(c / 3) * 3;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        newNotes[startR + i][startC + j].delete(val);
                    }
                }
                return newNotes;
            });

            // Check win condition
            let isWon = true;
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (newBoard[i][j] !== solution[i][j]) {
                        isWon = false;
                        break;
                    }
                }
            }
            if (isWon) setStatus('won');
        }

    }, [board, solution, status, hintsRemaining]);

    const selectCell = useCallback((r: number, c: number) => {
        if (status !== 'playing') return;
        setSelectedCell({ r, c });
        setHintedCell(null);
    }, [status]);

    const toggleNotesMode = useCallback(() => {
        if (status !== 'playing') return;
        setNotesMode((prev) => !prev);
    }, [status]);

    const pauseGame = useCallback(() => {
        if (status === 'playing') setStatus('paused');
    }, [status]);

    const resumeGame = useCallback(() => {
        if (status === 'paused') setStatus('playing');
    }, [status]);

    return {
        board,
        initialBoard,
        solution,
        status,
        difficulty,
        mistakes,
        timer,
        selectedCell,
        hintedCell,
        notesMode,
        notes,
        hintsRemaining,
        startGame,
        selectCell,
        inputValue,
        toggleNotesMode,
        erase,
        hint,
        pauseGame,
        resumeGame
    };
};

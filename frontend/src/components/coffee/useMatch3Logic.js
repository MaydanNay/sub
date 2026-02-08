import { useState, useEffect, useCallback } from 'react';
import useGameStore from './store';

const ROWS = 8;
const COLS = 8;
const ITEMS = ['☕', '🥛', '🍩', '🥐', '🥤']; // Coffee, Milk, Donut, Croissant, Cup

const useMatch3Logic = () => {
    const { grid, setGrid, addCoins, decrementMoves, movesLeft } = useGameStore();
    const [draggedItem, setDraggedItem] = useState(null);

    // Initialize Grid
    useEffect(() => {
        if (grid.length === 0) {
            const newGrid = [];
            for (let i = 0; i < ROWS; i++) {
                const row = [];
                for (let j = 0; j < COLS; j++) {
                    row.push(ITEMS[Math.floor(Math.random() * ITEMS.length)]);
                }
                newGrid.push(row);
            }
            setGrid(newGrid);
        }
    }, [grid.length, setGrid]);

    // Check for matches
    const checkForMatches = useCallback((currentGrid) => {
        let matchesFound = false;
        const newGrid = JSON.parse(JSON.stringify(currentGrid)); // Deep copy matching logic placeholder

        // Simple horizontal check for demo
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS - 2; c++) {
                if (newGrid[r][c] && newGrid[r][c] === newGrid[r][c + 1] && newGrid[r][c] === newGrid[r][c + 2]) {
                    // Match found!
                    newGrid[r][c] = null;
                    newGrid[r][c + 1] = null;
                    newGrid[r][c + 2] = null;
                    matchesFound = true;
                    addCoins(50); // Reward
                }
            }
        }
        // Simple vertical check for demo
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS - 2; r++) {
                if (newGrid[r][c] && newGrid[r][c] === newGrid[r + 1][c] && newGrid[r][c] === newGrid[r + 2][c]) {
                    // Match found!
                    newGrid[r][c] = null;
                    newGrid[r + 1][c] = null;
                    newGrid[r + 2][c] = null;
                    matchesFound = true;
                    addCoins(50); // Reward
                }
            }
        }

        if (matchesFound) {
            // Fill empty spots
            for (let c = 0; c < COLS; c++) {
                let emptySlots = 0;
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (newGrid[r][c] === null) {
                        emptySlots++;
                    } else if (emptySlots > 0) {
                        newGrid[r + emptySlots][c] = newGrid[r][c];
                        newGrid[r][c] = null;
                    }
                }
                for (let r = 0; r < emptySlots; r++) {
                    newGrid[r][c] = ITEMS[Math.floor(Math.random() * ITEMS.length)];
                }
            }
            setGrid(newGrid);
            // Recursive check can act weird in simple effect, but for demo it's ok to just run once per swap
        }
    }, [addCoins, setGrid]);

    const swapItems = (r1, c1, r2, c2) => {
        if (movesLeft <= 0) return;

        const newGrid = [...grid.map(row => [...row])];
        const temp = newGrid[r1][c1];
        newGrid[r1][c1] = newGrid[r2][c2];
        newGrid[r2][c2] = temp;

        setGrid(newGrid);
        decrementMoves();

        setTimeout(() => {
            checkForMatches(newGrid);
        }, 300);
    };

    return { swapItems };
};

export default useMatch3Logic;

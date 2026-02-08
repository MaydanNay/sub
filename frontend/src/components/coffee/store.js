import { create } from 'zustand';

const useGameStore = create((set) => ({
    coins: 0,
    shopUpgradeLevel: 0,
    movesLeft: 20, // Starting moves
    grid: [], // 8x8 grid

    // Actions
    addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

    buyUpgrade: (cost) => set((state) => {
        if (state.coins >= cost) {
            return {
                coins: state.coins - cost,
                shopUpgradeLevel: state.shopUpgradeLevel + 1
            };
        }
        return state;
    }),

    decrementMoves: () => set((state) => ({ movesLeft: Math.max(0, state.movesLeft - 1) })),

    setGrid: (newGrid) => set({ grid: newGrid }),

    resetGame: () => set({
        coins: 0,
        shopUpgradeLevel: 0,
        movesLeft: 20,
        grid: []
    }),
}));

export default useGameStore;

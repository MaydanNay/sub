import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DiceGame from '../components/DiceGame';
import WheelGame from '../components/WheelGame'; // Importing WheelGame as well since it was missing a route
import { IconSad } from '../components/GameIcons';

const GamePage = ({ gameId: propGameId }) => {
    const { gameId: paramGameId } = useParams();
    const gameId = propGameId || paramGameId;

    // Map game IDs to components
    const games = {
        'dice': <DiceGame />,
        'wheel': <WheelGame />,
        // Add other games here if they don't have specific routes
    };

    const gameComponent = games[gameId];

    if (!gameComponent) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <IconSad className="w-24 h-24 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Игра не найдена</h2>
                <p className="text-gray-500 mb-8">Возможно, ссылка устарела или ведет в никуда.</p>
                <Link to="/" className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">
                    Вернуться в каталог
                </Link>
            </div>
        );
    }

    return (
        <div className="game-page-wrapper">
            {/* Back button could be here, but games usually have their own or we rely on browser back */}
            {/* For consistency, some games might have full screen layouts so we just render the component */}
            {gameComponent}
        </div>
    );
};

export default GamePage;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Catalog from './pages/Catalog';
import GamePage from './pages/GamePage';
import CoffeeTycoon from './pages/CoffeeTycoon';
import CoffeeTycoonPlay from './pages/CoffeeTycoonPlay';
import SheepTamagotchi from './pages/SheepTamagotchi';
import SheepTamagotchiPlay from './pages/SheepTamagotchiPlay';
import MemoryGame from './pages/MemoryGame';
import MemoryPlay from './pages/MemoryPlay';
import ReactionGame from './pages/ReactionGame';
import ReactionPlay from './pages/ReactionPlay';
import QuizGame from './pages/QuizGame';
import QuizPlay from './pages/QuizPlay';
import CoffeeMaker from './pages/CoffeeMaker';
import CoffeeMakerPlay from './pages/CoffeeMakerPlay';
import PuzzleCollector from './pages/PuzzleCollector';
import PuzzlePlay from './pages/PuzzlePlay';
import QuestGame from './pages/QuestGame';
import QuestPlay from './pages/QuestPlay';
import PrizeDrop from './pages/PrizeDrop';
import PrizeDropPlay from './pages/PrizeDropPlay';
import Slots from './pages/Slots';
import SlotsPlay from './pages/SlotsPlay';
import ScratchCard from './pages/ScratchCard';
import ScratchCardPlay from './pages/ScratchCardPlay';
import ReferralSystem from './pages/ReferralSystem';
import ReferralView from './pages/ReferralView';
import VotingSystem from './pages/VotingSystem';
import VotingView from './pages/VotingView';
import Leaderboard from './pages/Leaderboard';
import LeaderboardView from './pages/LeaderboardView';
import DiceIntro from './pages/DiceIntro';
import WheelIntro from './pages/WheelIntro';
import TreasureMapIntro from './pages/TreasureMapIntro';
import TreasureMapPlay from './pages/TreasureMapPlay';
import MysteryBoxIntro from './pages/MysteryBoxIntro';
import MysteryBoxPlay from './pages/MysteryBoxPlay';
import BusinessValueControl from './components/BusinessValueControl';

import ScrollToTop from './components/ScrollToTop';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Catalog />} />
                <Route path="/game/coffee" element={<CoffeeTycoon />} />
                <Route path="/game/coffee/play" element={<CoffeeTycoonPlay />} />
                <Route path="/game/sheep" element={<SheepTamagotchi />} />
                <Route path="/game/sheep/play" element={<SheepTamagotchiPlay />} />
                <Route path="/game/barista" element={<CoffeeMaker />} />
                <Route path="/game/barista/play" element={<CoffeeMakerPlay />} />
                <Route path="/game/scratch" element={<ScratchCard />} />
                <Route path="/game/scratch/play" element={<ScratchCardPlay />} />
                <Route path="/game/drop" element={<PrizeDrop />} />
                <Route path="/game/drop/play" element={<PrizeDropPlay />} />
                <Route path="/game/slots" element={<Slots />} />
                <Route path="/game/slots/play" element={<SlotsPlay />} />
                <Route path="/game/memory" element={<MemoryGame />} />
                <Route path="/game/memory/play" element={<MemoryPlay />} />
                <Route path="/game/reaction" element={<ReactionGame />} />
                <Route path="/game/reaction/play" element={<ReactionPlay />} />
                <Route path="/game/quiz" element={<QuizGame />} />
                <Route path="/game/quiz/play" element={<QuizPlay />} />
                <Route path="/game/puzzle" element={<PuzzleCollector />} />
                <Route path="/game/puzzle/play" element={<PuzzlePlay />} />
                <Route path="/game/quest" element={<QuestGame />} />
                <Route path="/game/quest/play" element={<QuestPlay />} />
                <Route path="/game/leaderboard" element={<Leaderboard />} />
                <Route path="/game/leaderboard/view" element={<LeaderboardView />} />
                <Route path="/game/referral" element={<ReferralSystem />} />
                <Route path="/game/referral/view" element={<ReferralView />} />
                <Route path="/game/vote" element={<VotingSystem />} />
                <Route path="/game/vote/view" element={<VotingView />} />
                <Route path="/game/dice" element={<DiceIntro />} />
                <Route path="/game/dice/play" element={<GamePage gameId="dice" />} />
                <Route path="/game/wheel" element={<WheelIntro />} />
                <Route path="/game/wheel/play" element={<GamePage gameId="wheel" />} />
                <Route path="/game/treasure" element={<TreasureMapIntro />} />
                <Route path="/game/treasure/play" element={<TreasureMapPlay />} />
                <Route path="/game/mystery" element={<MysteryBoxIntro />} />
                <Route path="/game/mystery/play" element={<MysteryBoxPlay />} />
                <Route path="/game/:gameId" element={<GamePage />} />
            </Routes>
            <BusinessValueControl />
        </Router>
    )
}

export default App

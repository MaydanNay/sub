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
import ShuShi from './pages/ShuShi';
import ShuShiPlay from './pages/ShuShiPlay';
import MobileContainer from './components/MobileContainer';

import ShuBoomIntro from './pages/ShuBoom/ShuBoomIntro';
import ShuBoomHome from './pages/ShuBoom/ShuBoomHome';
import ShuBoomCollection from './pages/ShuBoom/ShuBoomCollection';
import ShuBoomMap from './pages/ShuBoom/ShuBoomMap';
import ShuBoomAR from './pages/ShuBoom/ShuBoomAR';
import ShuBoomShop from './pages/ShuBoom/ShuBoomShop';

import NauryzIntro from './pages/Nauryz/NauryzIntro';
import NauryzGame from './pages/Nauryz/NauryzGame';

import ShalamGame from './pages/Shalam/ShalamGame';

import ShuBankIntro from './pages/ShuBank/ShuBankIntro';
import ShuBankPlay from './pages/ShuBank/ShuBankPlay';
import ShuBankShop from './pages/ShuBank/ShuBankShop';

import ShuBeautyIntro from './pages/ShuBeauty/Intro';
import ShuBeautyGame from './pages/ShuBeauty/Game';
import ShuBeautyPlay from './pages/ShuBeauty/ShuBeautyPlay';

import ShuMetalIntro from './pages/ShuMetal/ShuMetalIntro';
import ShuMetalHome from './pages/ShuMetal/ShuMetalHome';
import ShuMetalTasks from './pages/ShuMetal/ShuMetalTasks';
import ShuMetalShop from './pages/ShuMetal/ShuMetalShop';
import ShuMetalLeaderboard from './pages/ShuMetal/ShuMetalLeaderboard';
import ShuMetalMood from './pages/ShuMetal/ShuMetalMood';

import ShuDomIntro from './pages/ShuDom/ShuDomIntro';
import ShuDomGame from './pages/ShuDom/ShuDomGame';
import ShuDomRooms from './pages/ShuDom/ShuDomRooms';
import ShuDomHouse from './pages/ShuDom/ShuDomHouse';
import ShuDomRoomDetail from './pages/ShuDom/ShuDomRoomDetail';
import ShuGnumGame from './pages/ShuGnum/ShuGnumGame';

import ShuQazHome from './pages/ShuQaz/ShuQazHome';
import ShuQazDictionary from './pages/ShuQaz/ShuQazDictionary';
import ShuQazTraining from './pages/ShuQaz/ShuQazTraining';

import ScrollToTop from './components/ScrollToTop';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                {/* ShuBoom Routes */}
                {/* ShuBoom Routes */}
                <Route element={<MobileContainer />}>
                    <Route path="/game/shuboom" element={<ShuBoomIntro />} />
                    <Route path="/game/shuboom/play" element={<ShuBoomHome />} />
                    <Route path="/game/shuboom/collection" element={<ShuBoomCollection />} />
                    <Route path="/game/shuboom/map" element={<ShuBoomMap />} />
                    <Route path="/game/shuboom/ar" element={<ShuBoomAR />} />
                    <Route path="/game/shuboom/shop" element={<ShuBoomShop />} />
                </Route>

                <Route element={<MobileContainer />}>
                    <Route path="/game/nauryz" element={<NauryzIntro />} />
                    <Route path="/game/nauryz/play" element={<NauryzGame />} />
                </Route>

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
                <Route path="/game/shushi" element={<ShuShi />} />
                <Route path="/game/shushi/play" element={<ShuShiPlay />} />
                <Route path="/game/shalam" element={<ShalamGame />} />

                <Route path="/game/shubank" element={<ShuBankIntro />} />
                <Route path="/game/shubank/play" element={<ShuBankPlay />} />
                <Route path="/game/shubank/shop" element={<ShuBankShop />} />

                <Route path="/game/shubeauty" element={<ShuBeautyIntro />} />
                <Route path="/game/shubeauty/play" element={<ShuBeautyPlay />} />

                {/* ShuMetal Routes */}
                <Route element={<MobileContainer />}>
                    <Route path="/game/shumetal" element={<ShuMetalIntro />} />
                    <Route path="/game/shumetal/play" element={<ShuMetalHome />} />
                    <Route path="/game/shumetal/tasks" element={<ShuMetalTasks />} />
                    <Route path="/game/shumetal/shop" element={<ShuMetalShop />} />
                    <Route path="/game/shumetal/social" element={<ShuMetalLeaderboard />} />
                    <Route path="/game/shumetal/mood" element={<ShuMetalMood />} />
                </Route>

                <Route element={<MobileContainer />}>
                    <Route path="/game/shudom" element={<ShuDomIntro />} />
                    <Route path="/game/shudom/play" element={<ShuDomGame />} />
                    <Route path="/game/shudom/rooms" element={<ShuDomRooms />} />
                    <Route path="/game/shudom/house" element={<ShuDomHouse />} />
                    <Route path="/game/shudom/room/:roomId" element={<ShuDomRoomDetail />} />

                    {/* ShuGnum: Оливье Doda */}
                    <Route path="/game/shugnum" element={<ShuGnumGame />} />

                    {/* ShuQaz: Learn Kazakh */}
                    <Route path="/game/shuqaz" element={<ShuQazHome />} />
                    <Route path="/game/shuqaz/dictionary" element={<ShuQazDictionary />} />
                    <Route path="/game/shuqaz/train" element={<ShuQazTraining />} />
                </Route>

                <Route path="/game/:gameId" element={<GamePage />} />
            </Routes>
            <BusinessValueControl />
        </Router>
    )
}

export default App

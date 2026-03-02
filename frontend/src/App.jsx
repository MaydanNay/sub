import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import BusinessValueControl from './components/BusinessValueControl';
import MobileContainer from './components/MobileContainer';
import ScrollToTop from './components/ScrollToTop';
import { ShuBankProvider } from './components/ShuBankProvider';

// Lazy load components to optimize initial bundle size
const Catalog = React.lazy(() => import('./pages/Catalog'));
const GamePage = React.lazy(() => import('./pages/GamePage'));
const MemoryGame = React.lazy(() => import('./pages/MemoryGame'));
const MemoryPlay = React.lazy(() => import('./pages/MemoryPlay'));
const ReactionGame = React.lazy(() => import('./pages/ReactionGame'));
const ReactionPlay = React.lazy(() => import('./pages/ReactionPlay'));
const QuizGame = React.lazy(() => import('./pages/QuizGame'));
const QuizPlay = React.lazy(() => import('./pages/QuizPlay'));
const CoffeeMaker = React.lazy(() => import('./pages/CoffeeMaker'));
const CoffeeMakerPlay = React.lazy(() => import('./pages/CoffeeMakerPlay'));
const PuzzleCollector = React.lazy(() => import('./pages/PuzzleCollector'));
const PuzzlePlay = React.lazy(() => import('./pages/PuzzlePlay'));
const QuestGame = React.lazy(() => import('./pages/QuestGame'));
const QuestPlay = React.lazy(() => import('./pages/QuestPlay'));
const PrizeDrop = React.lazy(() => import('./pages/PrizeDrop'));
const PrizeDropPlay = React.lazy(() => import('./pages/PrizeDropPlay'));
const Slots = React.lazy(() => import('./pages/Slots'));
const SlotsPlay = React.lazy(() => import('./pages/SlotsPlay'));
const ScratchCard = React.lazy(() => import('./pages/ScratchCard'));
const ScratchCardPlay = React.lazy(() => import('./pages/ScratchCardPlay'));
const ReferralSystem = React.lazy(() => import('./pages/ReferralSystem'));
const ReferralView = React.lazy(() => import('./pages/ReferralView'));
const VotingSystem = React.lazy(() => import('./pages/VotingSystem'));
const VotingView = React.lazy(() => import('./pages/VotingView'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const LeaderboardView = React.lazy(() => import('./pages/LeaderboardView'));
const DiceIntro = React.lazy(() => import('./pages/DiceIntro'));
const WheelIntro = React.lazy(() => import('./pages/WheelIntro'));
const TreasureMapIntro = React.lazy(() => import('./pages/TreasureMapIntro'));
const TreasureMapPlay = React.lazy(() => import('./pages/TreasureMapPlay'));
const MysteryBoxIntro = React.lazy(() => import('./pages/MysteryBoxIntro'));
const MysteryBoxPlay = React.lazy(() => import('./pages/MysteryBoxPlay'));
const ShuShi = React.lazy(() => import('./pages/ShuShi'));
const ShuShiPlay = React.lazy(() => import('./pages/ShuShiPlay'));

const ShuBoomIntro = React.lazy(() => import('./pages/ShuBoom/ShuBoomIntro'));
const ShuBoomHome = React.lazy(() => import('./pages/ShuBoom/ShuBoomHome'));
const ShuBoomCollection = React.lazy(() => import('./pages/ShuBoom/ShuBoomCollection'));
const ShuBoomMap = React.lazy(() => import('./pages/ShuBoom/ShuBoomMap'));
const ShuBoomAR = React.lazy(() => import('./pages/ShuBoom/ShuBoomAR'));
const ShuBoomShop = React.lazy(() => import('./pages/ShuBoom/ShuBoomShop'));

const NauryzIntro = React.lazy(() => import('./pages/Nauryz/NauryzIntro'));
const NauryzGame = React.lazy(() => import('./pages/Nauryz/NauryzGame'));
const ShalamGame = React.lazy(() => import('./pages/Shalam/ShalamGame'));

const ShuBankIntro = React.lazy(() => import('./pages/ShuBank/ShuBankIntro'));
const ShuBankPlay = React.lazy(() => import('./pages/ShuBank/ShuBankPlay'));
const ShuBankShop = React.lazy(() => import('./pages/ShuBank/ShuBankShop'));

const ShuBeautyIntro = React.lazy(() => import('./pages/ShuBeauty/Intro'));
const ShuBeautyGame = React.lazy(() => import('./pages/ShuBeauty/Game'));
const ShuBeautyPlay = React.lazy(() => import('./pages/ShuBeauty/ShuBeautyPlay'));

const ShuMetalIntro = React.lazy(() => import('./pages/ShuMetal/ShuMetalIntro'));
const ShuMetalHome = React.lazy(() => import('./pages/ShuMetal/ShuMetalHome'));
const ShuMetalTasks = React.lazy(() => import('./pages/ShuMetal/ShuMetalTasks'));
const ShuMetalShop = React.lazy(() => import('./pages/ShuMetal/ShuMetalShop'));
const ShuMetalLeaderboard = React.lazy(() => import('./pages/ShuMetal/ShuMetalLeaderboard'));
const ShuMetalMood = React.lazy(() => import('./pages/ShuMetal/ShuMetalMood'));

const ShuDomIntro = React.lazy(() => import('./pages/ShuDom/ShuDomIntro'));
const ShuDomGame = React.lazy(() => import('./pages/ShuDom/ShuDomGame'));
const ShuDomRooms = React.lazy(() => import('./pages/ShuDom/ShuDomRooms'));
const ShuDomHouse = React.lazy(() => import('./pages/ShuDom/ShuDomHouse'));
const ShuDomRoomDetail = React.lazy(() => import('./pages/ShuDom/ShuDomRoomDetail'));
const ShuGnumGame = React.lazy(() => import('./pages/ShuGnum/ShuGnumGame'));

const ShuQazHome = React.lazy(() => import('./pages/ShuQaz/ShuQazHome'));
const ShuQazDictionary = React.lazy(() => import('./pages/ShuQaz/ShuQazDictionary'));
const ShuQazTraining = React.lazy(() => import('./pages/ShuQaz/ShuQazTraining'));

const ThankYou = React.lazy(() => import('./components/ThankYou'));

const PageLoader = () => (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <Loader className="w-10 h-10 text-white animate-spin opacity-20" />
    </div>
);

function AppInner() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const navigate = useNavigate();

    const openModal = () => {
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);

    const handleFormSuccess = () => {
        closeModal();
        navigate('/thanks');
    };

    return (
        <>
            <ScrollToTop />
            <React.Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Catalog and Modal Logic */}
                    <Route path="/" element={<Catalog openModal={openModal} />} />
                    <Route path="/thanks" element={<div className="min-h-screen bg-shu-bg"><ThankYou isFullPage={true} isModal={false} onClose={() => navigate('/')} /></div>} />

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
                    <Route element={<MobileContainer />}>
                        <Route path="/game/shushi" element={<ShuShi />} />
                        <Route path="/game/shushi/play" element={<ShuShiPlay />} />
                        <Route path="/game/shalam" element={<ShalamGame />} />
                    </Route>

                    <Route element={<ShuBankProvider><MobileContainer /></ShuBankProvider>}>
                        <Route path="/game/shubank" element={<ShuBankIntro />} />
                        <Route path="/game/shubank/play" element={<ShuBankPlay />} />
                        <Route path="/game/shubank/shop" element={<ShuBankShop />} />
                    </Route>

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
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title="ОСТАВИТЬ ЗАЯВКУ"
                >
                    <RequestForm
                        onSuccess={handleFormSuccess}
                        onClose={closeModal}
                        isModal={true}
                    />
                </Modal>
            </React.Suspense>
            <BusinessValueControl />
        </>
    )
}

function App() {
    return (
        <Router>
            <AppInner />
        </Router>
    )
}

const Modal = React.lazy(() => import('./components/ui/Modal'));
const RequestForm = React.lazy(() => import('./components/RequestForm'));

export default App

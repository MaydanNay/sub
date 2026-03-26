import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import api from '../api';
import '../styles/ShuCRM.css';

// Components
import Layout from '../components/Layout';
import Dashboard from './Dashboard';
import PulseFeed from './PulseFeed';
import WalletPage from './WalletPage';
import LeaderDesk from './LeaderDesk';
import Profile from './Profile';
import { useLocation } from 'react-router-dom';

const CRMHome = () => {
    const [communities, setCommunities] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [stats, setStats] = useState({
        visits: 52,
        goals: [
            { id: 1, title: "Weekly Sketch", progress: 3, target: 5 },
            { id: 2, title: "Book Club Read", progress: 45, target: 50 }
        ],
        points: 1540,
        level: 12
    });
    const [isLeaderMode, setIsLeaderMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [venues, setVenues] = useState([]);
    const [newMeeting, setNewMeeting] = useState({
        community_id: '',
        title: '',
        description: '',
        date_time: '',
        location_address: '',
        venue_id: '',
        materials: '',
        cost: 0,
        is_open: false
    });
    const [registeredMeetings, setRegisteredMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMeetingParticipants, setSelectedMeetingParticipants] = useState(null);
    const [wallet, setWallet] = useState({ balance: 0, currency: 'KZT' });
    const [transactions, setTransactions] = useState([]);
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedPhone, setScannedPhone] = useState('');
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'PAYMENT', title: 'Payment Confirmed', desc: '1,500 KZT received for Watercolor Masterclass', time: '2m ago' },
        { id: 2, type: 'APPROVAL', title: 'Goal Approved', desc: 'Leader approved your "Weekly Sketch" proof', time: '1h ago' }
    ]);
    const [pendingProofs, setPendingProofs] = useState([
        { id: 101, user: "7776665544", goal: "Weekly Sketch", proof_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f" }
    ]);

    const userPhone = localStorage.getItem('userPhone') || '7770000000';

    useEffect(() => {
        fetchData();
    }, [selectedFilters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const commsRes = await api.get(`/crm/user/communities?user_phone=${userPhone}`);
            setCommunities(commsRes.data);

            const filterQuery = selectedFilters.length > 0 ? `&community_ids=${selectedFilters.join(',')}` : '';
            const meetingsRes = await api.get(`/crm/meetings?user_phone=${userPhone}${filterQuery}`);
            setMeetings(meetingsRes.data);

            const venuesRes = await api.get('/crm/venues');
            setVenues(venuesRes.data);

            const walletRes = await api.get(`/crm/wallet?user_phone=${userPhone}`);
            setWallet(walletRes.data);

            const transRes = await api.get(`/crm/transactions?user_phone=${userPhone}`);
            setTransactions(transRes.data);
        } catch (error) {
            console.error('Error fetching CRM data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFilter = (id) => {
        setSelectedFilters(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const handleParticipate = async (meetingId) => {
        try {
            await api.post(`/crm/meetings/participate?meeting_id=${meetingId}&user_phone=${userPhone}`);
            setRegisteredMeetings(prev => [...prev, meetingId]);

            const walletRes = await api.get(`/crm/wallet?user_phone=${userPhone}`);
            setWallet(walletRes.data);
            const transRes = await api.get(`/crm/transactions?user_phone=${userPhone}`);
            setTransactions(transRes.data);

            const meetingsRes = await api.get('/crm/meetings');
            setMeetings(meetingsRes.data);
        } catch (error) {
            console.error('Error participating in meeting:', error);
            alert(error.response?.data?.detail || 'Insufficent funds or payment error');
        }
    };

    const fetchParticipants = async (meetingId) => {
        try {
            const res = await api.get(`/crm/meetings/${meetingId}/participants`);
            setSelectedMeetingParticipants({ id: meetingId, list: res.data });
        } catch (error) {
            console.error('Error fetching participants:', error);
        }
    };

    const handleApproveProof = (proofId) => {
        setPendingProofs(prev => prev.filter(p => p.id !== proofId));
        setStats(prev => ({ ...prev, points: prev.points + 50 }));
        setNotifications(prev => [{
            id: Date.now(),
            type: 'SYSTEM',
            title: 'Reward Issued',
            desc: 'Member rewarded with 50 BP',
            time: 'Just now'
        }, ...prev]);
    };

    const handleCheckIn = async (meetingId) => {
        if (!scannedPhone) return;
        try {
            await api.post(`/crm/meetings/check-in?meeting_id=${meetingId}&user_phone=${scannedPhone}`);
            alert('User checked in successfully!');
            setIsScannerOpen(false);
            setScannedPhone('');
            fetchData();
        } catch (error) {
            alert('Check-in failed');
        }
    };

    const handleCreatePulse = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newMeeting,
                community_id: communities[0]?.id,
                materials: newMeeting.materials.split(',').map(m => m.trim()).filter(m => m),
                date_time: new Date(newMeeting.date_time).toISOString()
            };
            await api.post('/crm/meetings', payload);
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error creating meeting:', error);
        }
    };

    const location = useLocation();
    const isLightTheme = location.pathname === '/' || location.pathname === '/profile' || location.pathname === '/wallet';

    if (loading && communities.length === 0) {
        return <div className="crm-container flex items-center justify-center text-white">Loading ShuTeam...</div>;
    }

    return (
        <Layout
            wallet={wallet}
            stats={stats}
            isLeaderMode={isLeaderMode}
            setIsLeaderMode={setIsLeaderMode}
            isNotifOpen={isNotifOpen}
            setIsNotifOpen={setIsNotifOpen}
            notifications={notifications}
            setNotifications={setNotifications}
            setIsWalletOpen={setIsWalletOpen}
            theme={isLightTheme ? 'light' : 'dark'}
        >
            <Routes>
                <Route path="/" element={
                    <Dashboard 
                        stats={stats} 
                        isLeaderMode={isLeaderMode} 
                        setIsScannerOpen={setIsScannerOpen} 
                    />
                } />
                <Route path="/events" element={
                    <PulseFeed 
                        meetings={meetings}
                        communities={communities}
                        selectedFilters={selectedFilters}
                        toggleFilter={toggleFilter}
                        setSelectedFilters={setSelectedFilters}
                        isLeaderMode={isLeaderMode}
                        setIsModalOpen={setIsModalOpen}
                        registeredMeetings={registeredMeetings}
                        handleParticipate={handleParticipate}
                        selectedMeetingParticipants={selectedMeetingParticipants}
                        setSelectedMeetingParticipants={setSelectedMeetingParticipants}
                        fetchParticipants={fetchParticipants}
                    />
                } />
                <Route path="/wallet" element={
                    <WalletPage 
                        wallet={wallet} 
                        transactions={transactions} 
                    />
                } />
                <Route path="/leader" element={
                    isLeaderMode ? (
                        <LeaderDesk 
                            pendingProofs={pendingProofs} 
                            handleApproveProof={handleApproveProof} 
                        />
                    ) : (
                        <Navigate to="/" replace />
                    )
                } />
                <Route path="/profile" element={<Profile stats={stats} />} />
            </Routes>

            {/* Global Modals */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto pt-20 pb-10 no-scrollbar">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#0d1117] border border-white/10 w-full max-w-[440px] rounded-3xl overflow-hidden relative z-10 shadow-2xl my-auto">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h2 className="text-lg font-black font-outfit uppercase tracking-tight text-white">Create New Pulse</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-crm-text-muted hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreatePulse} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-crm-text-muted uppercase tracking-widest ml-1">Event Title</label>
                                    <input required type="text" placeholder="Epic Community Meeting" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all" value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-crm-text-muted uppercase tracking-widest ml-1">Date & Time</label>
                                        <input required type="datetime-local" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all" value={newMeeting.date_time} onChange={(e) => setNewMeeting({ ...newMeeting, date_time: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-crm-text-muted uppercase tracking-widest ml-1">Entry Cost (₸)</label>
                                        <input type="number" placeholder="0" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all" value={newMeeting.cost} onChange={(e) => setNewMeeting({ ...newMeeting, cost: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-crm-text-muted uppercase tracking-widest ml-1">Target Venue</label>
                                    <select required className="w-full bg-[#0d1117] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all appearance-none" value={newMeeting.venue_id} onChange={(e) => {
                                        const vId = parseInt(e.target.value);
                                        const venue = venues.find(v => v.id === vId);
                                        setNewMeeting({ ...newMeeting, venue_id: e.target.value, location_address: venue?.address || '' });
                                    }}>
                                        <option value="">Select established space</option>
                                        {venues.map(v => (
                                            <option key={v.id} value={v.id}>{v.name} (Member Partner)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-crm-text-muted uppercase tracking-widest ml-1">Required Assets (comma separated)</label>
                                    <input type="text" placeholder="Watercolor, Brushes" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all" value={newMeeting.materials} onChange={(e) => setNewMeeting({ ...newMeeting, materials: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-crm-text-muted uppercase tracking-widest ml-1">Brief Intent</label>
                                    <textarea required rows="3" placeholder="Strategic goal?" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all resize-none" value={newMeeting.description} onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })} />
                                </div>
                                <button type="submit" className="w-full crm-button py-4 text-xs tracking-[0.2em] font-black uppercase mt-4 shadow-xl shadow-indigo-500/20">Broadcast Pulse</button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isWalletOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto no-scrollbar">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWalletOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#0d1117] border border-white/10 w-full max-w-[440px] rounded-3xl overflow-hidden relative z-10 shadow-2xl my-auto">
                            <div className="p-8 bg-gradient-to-br from-emerald-500/20 to-transparent border-b border-white/5">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Liquidity</div>
                                        <div className="text-2xl font-black text-white">{Number(wallet.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-emerald-500">{wallet.currency}</span></div>
                                    </div>
                                    <button onClick={() => setIsWalletOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors">Top Up</button>
                                    <button className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors">Withdraw</button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="text-[10px] font-black text-crm-text-muted uppercase tracking-widest mb-4">Recent Flux</div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                                    {transactions.map((tx, ti) => (
                                        <div key={ti} className="flex items-center gap-4 p-3 bg-white/3 border border-white/5 rounded-2xl">
                                            <div className="flex-1">
                                                <div className="text-[10px] font-black text-white uppercase">{tx.description}</div>
                                                <div className="text-[8px] font-black text-crm-text-muted">{new Date(tx.created_at).toLocaleDateString()}</div>
                                            </div>
                                            <div className={`text-xs font-black ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-crimson-400'}`}>{tx.type === 'CREDIT' ? '+' : '-'}{tx.amount}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isScannerOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsScannerOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#0d1117] border border-white/10 w-full max-w-[440px] rounded-3xl overflow-hidden relative z-10 shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h2 className="text-lg font-black uppercase tracking-tight text-white">Digital Scanner</h2>
                                <button onClick={() => setIsScannerOpen(false)} className="text-crm-text-muted hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-8 flex flex-col items-center">
                                <div className="w-64 h-64 border-2 border-dashed border-blue-500/30 rounded-3xl flex items-center justify-center relative overflow-hidden bg-blue-500/5">
                                    <div className="absolute w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[scan_3s_linear_infinite]" />
                                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] animate-pulse">Scanning...</div>
                                </div>
                                <input type="text" placeholder="Enter Member Phone" className="mt-8 w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white text-center focus:border-blue-500 outline-none" value={scannedPhone} onChange={(e) => setScannedPhone(e.target.value)} />
                                <button onClick={() => handleCheckIn(meetings[0]?.id)} className="mt-4 w-full crm-button py-3 text-xs font-black uppercase tracking-widest">Verify Access</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Wallet Logic could be moved here but WalletPage covers it */}
        </Layout>
    );
};

export default CRMHome;

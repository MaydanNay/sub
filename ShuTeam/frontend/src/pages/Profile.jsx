import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, XCircle, Trophy, Star, Gem, Palette, Mountain, Book, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ stats }) => {
    const navigate = useNavigate();
    
    // Mock data for the specific design elements not in global stats
    const profileData = {
        name: "Аня Иванова",
        title: "Sketch Explorer",
        streak: 7,
        visited: 12,
        missed: 3,
        xp: 850,
        rank: "Меданскетч Мастер"
    };

    return (
        <div className="profile-page">
            <div className="w-full max-w-[400px] mb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="profile-card-light"
            >
                <div className="profile-banner" />
                
                <div className="relative">
                    <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop" 
                        alt="Avatar" 
                        className="profile-avatar-large"
                    />
                    <div className="profile-avatar-badge">
                        <Palette size={14} />
                    </div>
                </div>

                <h2 className="profile-name">{profileData.name}</h2>
                <div className="profile-title">{profileData.title}</div>

                <div className="profile-streak-badge">
                    <span className="text-xl">🔥</span>
                    <span className="streak-text">{profileData.streak}</span>
                    <span className="streak-label">дней в серии</span>
                </div>

                <div className="profile-stats-container">
                    <div className="profile-stat-box">
                        <div className="stat-icon bg-emerald-100 text-emerald-600">
                            <CheckCircle2 size={18} />
                        </div>
                        <div className="stat-details">
                            <span className="stat-value">{profileData.visited}</span>
                            <span className="stat-label">Посещено</span>
                        </div>
                    </div>
                    <div className="profile-stat-box">
                        <div className="stat-icon bg-rose-100 text-rose-500">
                            <XCircle size={18} />
                        </div>
                        <div className="stat-details">
                            <span className="stat-value">{profileData.missed}</span>
                            <span className="stat-label">Пропущено</span>
                        </div>
                    </div>
                </div>

                <div className="profile-skills-row">
                    <motion.div whileHover={{ scale: 1.1 }} className="profile-skill-icon text-orange-400">
                        <Palette size={24} />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} className="profile-skill-icon text-emerald-500">
                        <Mountain size={24} />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} className="profile-skill-icon text-purple-500">
                        <Book size={24} />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} className="profile-skill-icon text-blue-500">
                        <Globe size={24} />
                    </motion.div>
                </div>

                <div className="profile-actions">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="profile-action-btn purple"
                    >
                        <div className="btn-content">
                            <Trophy size={20} />
                            <span>{profileData.rank}</span>
                        </div>
                        <Star size={18} />
                    </motion.button>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="profile-action-btn blue"
                    >
                        <div className="btn-content">
                            <Gem size={20} />
                            <span>Вдохновение: <span className="xp-value">{profileData.xp} XP</span></span>
                        </div>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;

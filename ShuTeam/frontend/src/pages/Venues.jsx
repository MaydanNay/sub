import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, Coffee, Wifi, Zap, Users, ChevronLeft, Star, ExternalLink, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/ShuCRM.css';

const CRMVenues = () => {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            const res = await api.get('/crm/venues');
            setVenues(res.data);
        } catch (error) {
            console.error('Error fetching venues:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAmenityIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('wi-fi')) return <Wifi size={16} />;
        if (lower.includes('socket')) return <Zap size={16} />;
        if (lower.includes('coffee')) return <Coffee size={16} />;
        return <Info size={16} />;
    };

    return (
        <div className="crm-container">
            <div className="crm-mesh-bg" />
            
            <header className="crm-header flex items-center gap-6 mb-16">
                <motion.button 
                    whileHover={{ scale: 1.1, x: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/')}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-xl backdrop-blur-md"
                >
                    <ChevronLeft size={24} />
                </motion.button>
                <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    <h1 className="crm-title">Strategic Venues</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-px w-8 bg-cyan-500/50" />
                        <p className="text-crm-text-muted text-[10px] font-black letter-spacing-wide uppercase tracking-[0.3em]">Premium Operational Spaces</p>
                    </div>
                </motion.div>
            </header>

            <div className="crm-layout">
                <main className="crm-main">
                    {/* Operational Intel - Integrated */}
                    <div className="crm-card !p-6 bg-gradient-to-b from-white/[0.04] to-transparent mb-8">
                        <div className="glass-shine" />
                        <h4 className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 relative z-10">Operational Intel</h4>
                        <div className="grid grid-cols-1 gap-4 relative z-10">
                            <div className="flex gap-4 items-center group">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
                                    <Star size={18} fill="currentColor" />
                                </div>
                                <div className="text-[11px] font-black text-white uppercase tracking-tight">Privileged Pricing Applied</div>
                            </div>
                            <div className="flex gap-4 items-center group">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg">
                                    <Zap size={18} />
                                </div>
                                <div className="text-[11px] font-black text-white uppercase tracking-tight">Direct Neural Uplink Active</div>
                            </div>
                        </div>
                    </div>

                    <motion.div 
                        className="grid grid-cols-1 gap-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AnimatePresence>
                        {venues.map((venue, idx) => (
                            <motion.div 
                                key={venue.id} 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * idx }}
                                className="crm-card !p-0 overflow-hidden group !mb-0"
                            >
                                <div className="glass-shine" />
                                {venue.image_urls?.[0] && (
                                    <div className="relative h-64 overflow-hidden">
                                        <img 
                                            src={venue.image_urls[0]} 
                                            alt={venue.name} 
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-crm-bg/90 via-transparent to-transparent" />
                                        {venue.is_partner && (
                                            <div className="absolute top-4 right-4 bg-indigo-600/80 backdrop-blur-xl text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-2x">
                                                <Star size={10} fill="white" className="text-yellow-400" /> Member Choice
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="p-6 relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-outfit font-black text-xl tracking-tight text-white mb-1.5 uppercase">{venue.name}</h3>
                                            <div className="flex items-center gap-2 text-[8px] text-indigo-300 font-black uppercase tracking-widest bg-indigo-500/10 w-fit px-2 py-1 rounded-md border border-indigo-500/10">
                                                <MapPin size={10} />
                                                <span className="truncate max-w-[120px]">{venue.address}</span>
                                            </div>
                                        </div>
                                        <motion.div 
                                            whileHover={{ scale: 1.1 }}
                                            className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-crm-text-muted"
                                        >
                                            <ExternalLink size={16} />
                                        </motion.div>
                                    </div>
                                    
                                    <p className="text-[11px] text-crm-text-muted leading-relaxed mb-6 font-bold opacity-80">{venue.description}</p>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-[8px] font-black text-crm-text-muted uppercase tracking-widest mb-1.5">
                                                <Users size={12} className="text-cyan-400" /> Capacity
                                            </div>
                                            <div className="font-outfit font-black text-xs text-white">{venue.capacity} guests</div>
                                        </div>
                                        <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                                             <div className="flex items-center gap-2 text-[8px] font-black text-crm-text-muted uppercase tracking-widest mb-1.5">
                                                <Info size={12} className="text-indigo-400" /> Perks
                                            </div>
                                            <div className="flex gap-1.5">
                                                {venue.amenities.map((amenity, idx) => (
                                                    <div key={idx} className="text-white/60">
                                                        {getAmenityIcon(amenity)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6 relative group/discount">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Trophy size={14} className="text-yellow-400" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Member Priority Benefit</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="font-outfit font-black text-lg text-indigo-300 uppercase tracking-tight">10% Off All Bookings</div>
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <Zap size={14} fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/discount:opacity-100 transition-opacity rounded-xl" />
                                    </div>

                                    <motion.button 
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="crm-button w-full py-3.5 text-[10px] tracking-widest uppercase font-black"
                                    >
                                        Book Space
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </motion.div>
                    
                    {/* Deploy Venue - Bottom Area */}
                    <div className="mt-12 p-8 rounded-[32px] bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent border border-indigo-500/20 text-center relative overflow-hidden group shadow-xl">
                        <div className="text-indigo-400 mb-4 inline-block group-hover:scale-110 transition-transform">
                             <MapPin size={32} />
                        </div>
                        <h5 className="text-base font-black uppercase tracking-tight mb-2 text-white">Deploy Strategic Space</h5>
                        <p className="text-[9px] text-crm-text-muted font-black uppercase leading-relaxed tracking-widest opacity-60">Apply to synchronize your venue with the pulse network</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CRMVenues;

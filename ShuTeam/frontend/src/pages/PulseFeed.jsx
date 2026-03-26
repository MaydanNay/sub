import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users2, MapPin, ClipboardList, Film, ChevronRight } from 'lucide-react';

const PulseFeed = ({ 
    meetings, 
    communities, 
    selectedFilters, 
    toggleFilter, 
    setSelectedFilters, 
    isLeaderMode, 
    setIsModalOpen, 
    registeredMeetings, 
    handleParticipate, 
    selectedMeetingParticipants, 
    setSelectedMeetingParticipants, 
    fetchParticipants 
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-white uppercase italic">Pulse Feed</h2>
                {isLeaderMode ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/20"
                    >
                        Create Pulse
                    </motion.button>
                ) : (
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg">Signals</div>
                )}
            </div>

            <div className="crm-filter-bar no-scrollbar mb-6">
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={`crm-filter-item !py-2.5 !px-5 !text-[10px] ${selectedFilters.length === 0 ? 'active' : ''}`}
                    onClick={() => setSelectedFilters([])}
                >
                    All
                </motion.div>
                {communities.map(comm => (
                    <motion.div
                        key={comm.id}
                        whileTap={{ scale: 0.95 }}
                        className={`crm-filter-item !py-2.5 !px-5 !text-[10px] ${selectedFilters.includes(comm.id) ? 'active' : ''}`}
                        onClick={() => toggleFilter(comm.id)}
                    >
                        {comm.name}
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="grid grid-cols-1 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence mode="popLayout">
                    {meetings.length > 0 ? meetings.map((meeting) => (
                        <motion.div
                            key={meeting.id}
                            variants={itemVariants}
                            layout
                            className="crm-card meeting-card group !p-6 !mb-0"
                        >
                            <div className="glass-shine" />
                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">
                                            {communities.find(c => c.id === meeting.community_id)?.name || 'Event'}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors uppercase">{meeting.title}</h3>

                                    <div className="flex flex-wrap gap-4 mt-4">
                                        <div className="flex items-center gap-1.5 text-[9px] text-crm-text-muted font-bold">
                                            <Calendar size={12} className="text-blue-500/50" />
                                            {new Date(meeting.date_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] text-crm-text-muted font-bold">
                                            <MapPin size={12} className="text-blue-500/50" />
                                            <span className="truncate max-w-[80px]">{meeting.location_address}</span>
                                        </div>
                                    </div>

                                    {meeting.materials && meeting.materials.length > 0 && (
                                        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <ClipboardList size={12} className="text-indigo-400" />
                                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Required Assets</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {meeting.materials.map((item, id) => (
                                                    <span key={id} className="text-[8px] font-bold text-crm-text-muted bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2 text-right">
                                    {meeting.cost > 0 && (
                                        <div className="text-white font-black text-[10px] bg-blue-500/20 px-2 py-1 rounded-lg">
                                            {meeting.cost.toLocaleString()}₸
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-crm-text-muted uppercase">
                                        <Users2 size={10} className="text-indigo-400" />
                                        {meeting.registration_count || 0}
                                    </div>
                                    {meeting.is_open && (
                                        <div className="text-[7px] font-black text-emerald-400 border border-emerald-400/30 px-1.5 py-0.5 rounded uppercase tracking-widest">
                                            Open Access
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isLeaderMode && (
                                <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 relative z-10">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Engagement Stats</span>
                                        <button
                                            onClick={() => selectedMeetingParticipants?.id === meeting.id ? setSelectedMeetingParticipants(null) : fetchParticipants(meeting.id)}
                                            className="text-[8px] font-black text-white hover:text-indigo-300 transition-colors uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5"
                                        >
                                            {selectedMeetingParticipants?.id === meeting.id ? 'Hide Roster' : 'View Roster'}
                                        </button>
                                    </div>

                                    {selectedMeetingParticipants?.id === meeting.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2 pt-2 border-t border-white/5"
                                        >
                                            {selectedMeetingParticipants.list.length > 0 ? selectedMeetingParticipants.list.map((reg, ri) => (
                                                <div key={ri} className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-[8px] font-black text-indigo-400">
                                                        {ri + 1}
                                                    </div>
                                                    <div className="text-[9px] font-bold text-white opacity-80">{reg.user?.phone}</div>
                                                    <div className="ml-auto text-[7px] font-black text-crm-text-muted uppercase">{new Date(reg.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            )) : (
                                                <div className="text-[8px] font-black text-crm-text-muted uppercase text-center py-2">No registrants yet</div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 flex gap-2 relative z-10">
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => !registeredMeetings.includes(meeting.id) && handleParticipate(meeting.id)}
                                    className={`crm-button flex-1 py-3 text-[10px] uppercase tracking-widest font-black ${registeredMeetings.includes(meeting.id) ? 'grayscale opacity-50' : ''}`}
                                >
                                    {registeredMeetings.includes(meeting.id) ? 'Registered' : 'Participate'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-crm-text-muted"
                                >
                                    <ChevronRight size={18} />
                                </motion.button>
                            </div>
                        </motion.div>
                    )) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="crm-card text-center py-12 bg-white/[0.01] border-dashed border-white/5"
                        >
                            <Calendar size={24} className="text-white/10 mx-auto mb-3" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-50">Signal Absent</h4>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </section>
    );
};

export default PulseFeed;

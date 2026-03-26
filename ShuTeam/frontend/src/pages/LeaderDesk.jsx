import React from 'react';
import { ShieldCheck, Star } from 'lucide-react';

const LeaderDesk = ({ pendingProofs, handleApproveProof }) => {
    return (
        <div className="space-y-6">
            {pendingProofs.length > 0 ? (
                <div className="crm-card !p-8 border-cyan-500/20 bg-cyan-950/10 mb-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck size={40} className="text-cyan-400" />
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                        <Star size={14} className="text-cyan-400" />
                        <h4 className="text-[10px] font-black text-cyan-200 uppercase tracking-[0.2em]">Pending Proofs</h4>
                    </div>
                    <div className="space-y-4">
                        {pendingProofs.map(proof => (
                            <div key={proof.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 group hover:border-cyan-500/30 transition-all">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-inner">
                                        <img src={proof.proof_url} alt="Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black text-white uppercase mb-1 tracking-tight">{proof.goal}</div>
                                        <div className="text-[8px] font-black text-indigo-400/70 uppercase tracking-widest mb-4">Member: {proof.user}</div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproveProof(proof.id)}
                                                className="px-3 py-1.5 bg-cyan-500 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-500/20"
                                            >
                                                Approve
                                            </button>
                                            <button className="px-3 py-1.5 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/40">
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="crm-card text-center py-20 opacity-40 italic">
                    <ShieldCheck size={32} className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No pending administrative tasks</p>
                </div>
            )}
        </div>
    );
};

export default LeaderDesk;

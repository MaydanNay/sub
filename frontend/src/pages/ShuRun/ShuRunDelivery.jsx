import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Truck, MapPin, Phone, User, Mail, ChevronLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import useShuRunStore from './useShuRunStore';

export default function ShuRunDelivery() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const marathonId = searchParams.get('marathonId');

    const user = useShuRunStore(s => s.user);
    const placeOrder = useShuRunStore(s => s.placeOrder);
    const selectedMarathon = useShuRunStore(s => s.selectedMarathon);

    const [formData, setFormData] = useState({
        fullName: user?.nickname || '',
        phone: user?.phone || '',
        city: 'Алматы',
        address: '',
        index: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            placeOrder({
                marathonId: marathonId || selectedMarathon?.id,
                ...formData
            });
            setLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-montserrat">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-white/10 rounded-[40px] p-8 text-center max-w-sm shadow-2xl"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3 font-montserrat">Заказ принят!</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        Твоя медаль за марафон <span className="text-white font-bold">{selectedMarathon?.title || 'ShuRun'}</span> уже готовится к отправке.
                        Мы пришлем уведомление, когда передадим её курьеру.
                    </p>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/game/shurun/home')}
                        className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
                    >
                        Вернуться на главную <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-montserrat pb-10">
            {/* Header */}
            <div className="bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 border-b border-white/5 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 bg-slate-800 rounded-xl text-slate-400"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold flex items-center gap-2 font-montserrat">
                    <Truck className="w-5 h-5 text-emerald-400" />
                    Оформление доставки
                </h1>
            </div>

            <div className="px-6 py-8">
                <div className="mb-8">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Награда участника</div>
                    <h2 className="text-3xl font-bold text-white leading-tight font-montserrat">Ваша медаль финишёра 🎖️</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium italic">Остался последний шаг до получения артефакта</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 ml-1">
                            <User className="w-3.5 h-3.5" /> ФИО Получателя
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Иван Иванов"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
                        />
                    </div>

                    {/* Phone (Readonly from auth) */}
                    <div className="space-y-2 opacity-60">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 ml-1">
                            <Phone className="w-3.5 h-3.5" /> Контактный телефон
                        </label>
                        <div className="bg-slate-900 border border-white/5 rounded-2xl py-4 px-5 text-slate-500 font-bold">
                            {formData.phone || '+7 (___) ___-__-__'}
                        </div>
                    </div>

                    {/* City & Index */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 ml-1">
                                <MapPin className="w-3.5 h-3.5" /> Город
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 ml-1">
                                <Mail className="w-3.5 h-3.5" /> Почтовый индекс
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="050000"
                                value={formData.index}
                                onChange={e => setFormData({ ...formData, index: e.target.value })}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Адрес (Улица, дом, квартира)</label>
                        <textarea
                            required
                            rows="3"
                            placeholder="пр. Абая, 123, кв. 45"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700 resize-none"
                        />
                    </div>

                    <div className="bg-slate-900/40 p-5 rounded-[32px] border border-emerald-500/10 mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-xs font-bold text-white">Доставка KazPost</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal ml-11">
                            Стандартная доставка марафона включена. Отправка производится в течение 7 рабочих дней после завершения марафона.
                        </p>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${loading
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/20'
                            }`}
                    >
                        {loading ? 'Оформляем...' : 'Отправить запрос'}
                        {!loading && <Truck className="w-5 h-5" />}
                    </motion.button>
                </form>
            </div>
        </div>
    );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, ShoppingBag, QrCode, Grid } from 'lucide-react';
import { useScanner } from '../../components/ScannerProvider';

const BottomNav = () => {
    const { handleScan } = useScanner();

    return (
        <nav
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="flex justify-around items-center py-1.5 px-2">
                <NavLink to="/game/shuboom/play" className={({ isActive }) => `p-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'} font-montserrat`}>
                    <Home className="w-6 h-6" />
                    <span className="text-[9px] font-bold font-montserrat">Главная</span>
                </NavLink>

                <NavLink to="/game/shuboom/map" className={({ isActive }) => `p-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'} font-montserrat`}>
                    <Map className="w-6 h-6" />
                    <span className="text-[9px] font-bold font-montserrat">Путь</span>
                </NavLink>

                {/* Scan Button - Floating */}
                <div className="-mt-8">
                    <button
                        onClick={handleScan}
                        className="bg-gray-900 text-white p-3.5 rounded-2xl shadow-lg shadow-gray-900/20 active:scale-95 transition-transform border-4 border-slate-50 relative flex flex-col items-center justify-center gap-0.5"
                    >
                        <QrCode className="w-6 h-6" />
                        <span className="text-[8px] font-bold font-montserrat">Скан</span>
                    </button>
                </div>

                <NavLink to="/game/shuboom/shop" className={({ isActive }) => `p-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'} font-montserrat`}>
                    <ShoppingBag className="w-6 h-6" />
                    <span className="text-[9px] font-bold font-montserrat">Магазин</span>
                </NavLink>

                <NavLink to="/game/shuboom/collection" className={({ isActive }) => `p-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'} font-montserrat`}>
                    <Grid className="w-6 h-6" />
                    <span className="text-[9px] font-bold font-montserrat">Инвентарь</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default BottomNav;

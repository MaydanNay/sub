import React, { useState, useEffect } from 'react';
import { ShoppingCart, Coins, ArrowLeft, Plus, X, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Marketplace = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [coins, setCoins] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    
    // Custom Notification State
    const [notification, setNotification] = useState({
        show: false,
        type: 'success', // success, error, info
        title: '',
        message: ''
    });

    // Categories State
    const [activeCategory, setActiveCategory] = useState('food');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemsRes, dashRes] = await Promise.all([
                    api.get('/marketplace/food'),
                    api.get('/student/dashboard/me')
                ]);
                setItems(itemsRes.data);
                setCoins(dashRes.data.character?.coins || 0);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const showNotification = (type, title, message) => {
        setNotification({ show: true, type, title, message });
    };

    const handleBuy = async (itemId, price, itemName) => {
        if (coins < price) {
            showNotification('info', 'Ой!', 'У тебя недостаточно коинов для этой покупки 🪙');
            return;
        }
        setProcessing(itemId);
        try {
            const res = await api.post('/marketplace/buy', null, { params: { item_id: itemId } });
            setCoins(res.data.remaining_coins);
            showNotification('success', 'Поздравляем!', `${itemName} успешно приобретен! Твой питомец будет доволен! 🎉`);
        } catch (err) {
            console.error(err);
            showNotification('error', 'Упс!', 'Произошла ошибка при покупке. Попробуй позже.');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>{t('loading')}</div>;

    const NotificationOverlay = () => {
        if (!notification.show) return null;
        
        const isSuccess = notification.type === 'success';
        const isError = notification.type === 'error';

        return (
            <div 
                className="notif-overlay animate-fade-in"
                onClick={() => setNotification({ ...notification, show: false })}
                style={{ 
                    position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', height: '100%',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                    zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}
            >
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="notif-modal animate-pop"
                    style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '30px', padding: '40px 30px', 
                        maxWidth: '400px', width: '100%', textAlign: 'center',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background glow based on type */}
                    <div style={{ 
                        position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', 
                        width: '200px', height: '200px', 
                        background: isSuccess ? 'var(--accent-green)' : (isError ? '#ff4d4d' : 'var(--accent-yellow)'),
                        opacity: 0.1, filter: 'blur(50px)', borderRadius: '50%', zIndex: 0
                    }}></div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <img 
                                    src="/mascots/system.PNG" 
                                    alt="system mascot" 
                                    style={{ width: '120px', height: '120px', objectFit: 'contain' }} 
                                />
                                <div style={{ 
                                    position: 'absolute', bottom: 0, right: 0, 
                                    background: isSuccess ? 'var(--accent-green)' : (isError ? '#ff4d4d' : 'var(--accent-yellow)'),
                                    color: isSuccess ? 'white' : 'black',
                                    borderRadius: '50%', padding: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                                }}>
                                    {isSuccess ? <CheckCircle size={24} /> : (isError ? <AlertCircle size={24} /> : <Sparkles size={24} />)}
                                </div>
                            </div>
                        </div>

                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginBottom: '10px' }}>{notification.title}</h2>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '30px' }}>
                            {notification.message}
                        </p>

                        <button 
                            className="btn-primary" 
                            onClick={() => setNotification({ ...notification, show: false })}
                            style={{ 
                                width: '100%', height: '56px', borderRadius: '18px', fontWeight: '800', fontSize: '16px',
                                background: isSuccess ? 'var(--accent-green)' : (isError ? '#ff4d4d' : 'var(--accent-yellow)'),
                                color: isSuccess ? 'white' : 'black',
                                border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                            }}
                        >
                            {isSuccess ? 'Круто!' : 'Понятно'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '15px', minHeight: '100vh', backgroundColor: '#0a0a0a', color: 'white' }} className="animate-fade-in">
            <NotificationOverlay />

            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                        onClick={() => navigate(-1)} 
                        style={{ border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', padding: '8px', borderRadius: '12px', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h2 style={{ fontSize: '20px', fontWeight: '900' }}>{t('marketplace')}</h2>
                </div>
                <div style={{ background: 'var(--accent-yellow)', color: '#000', padding: '8px 15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '900', fontSize: '14px', boxShadow: '0 5px 15px rgba(255, 236, 139, 0.1)' }}>
                    <Coins size={16} />
                    <span>{coins}</span>
                </div>
            </header>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                <button 
                    onClick={() => setActiveCategory('food')}
                    style={{ 
                        flex: 1, padding: '10px', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                        background: activeCategory === 'food' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: activeCategory === 'food' ? 'white' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.2s'
                    }}
                >
                    🍔 {t('food') || 'Еда'}
                </button>
                <button 
                    onClick={() => setActiveCategory('skins')}
                    style={{ 
                        flex: 1, padding: '10px', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                        background: activeCategory === 'skins' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: activeCategory === 'skins' ? 'white' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.2s'
                    }}
                >
                    🎭 {t('skins') || 'Скины'}
                </button>
            </div>

            {activeCategory === 'food' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                    {items.map(item => (
                        <div key={item.id} className="item-card premium-card">
                            <div className="item-icon-container">
                                <span style={{ fontSize: '32px', filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.2))' }}>
                                    {item.id === 'apple' && '🍎'}
                                    {item.id === 'pizza' && '🍕'}
                                    {item.id === 'burger' && '🍔'}
                                    {item.id === 'cake' && '🍰'}
                                </span>
                            </div>
                            <div style={{ padding: '12px' }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '800' }}>{item.name}</h4>
                                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                    <span className="benefit-badge">+{item.hunger_benefit} 🥯</span>
                                </div>
                                <button 
                                    onClick={() => handleBuy(item.id, item.price, item.name)}
                                    disabled={processing === item.id || coins < item.price}
                                    className="buy-button premium-btn"
                                    style={{ 
                                        backgroundColor: coins < item.price ? 'rgba(255,255,255,0.05)' : 'var(--accent-green)',
                                        color: coins < item.price ? 'rgba(255,255,255,0.3)' : 'white'
                                    }}
                                >
                                    {processing === item.id ? '...' : (
                                        <>
                                            <Coins size={14} /> {item.price}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="item-card skin-locked" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <div className="coming-soon-badge">{t('coming_soon')}</div>
                            <div className="item-icon-container" style={{ background: 'transparent' }}>
                                <div style={{ fontSize: '28px', filter: 'grayscale(1)' }}>🎭</div>
                            </div>
                            <div style={{ padding: '12px' }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>Skin #{i}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
                                    <Coins size={12} /> ???
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style sx>{`
                .premium-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                }
                .premium-card:hover:not(.skin-locked) {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(255,255,255,0.15);
                    transform: translateY(-5px);
                }
                .item-icon-container {
                    background: rgba(255,255,255,0.02);
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .benefit-badge {
                    background: rgba(40, 199, 111, 0.1);
                    color: var(--accent-green);
                    padding: 4px 10px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 600;
                }
                .buy-button.premium-btn {
                    width: 100%;
                    height: 44px;
                    border-radius: 14px;
                    font-size: 15px;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-weight: 800;
                    margin-top: 10px;
                }
                .buy-button.premium-btn:hover:not(:disabled) {
                    transform: scale(1.02);
                    filter: brightness(1.1);
                }
                .coming-soon-badge {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(5px);
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    padding: 4px 10px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 900;
                }
                
                .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
                .animate-pop { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default Marketplace;

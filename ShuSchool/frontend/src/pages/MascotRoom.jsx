import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft, Package, Sparkles, Send, MessageCircle } from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import NovelDialogue from '../components/NovelDialogue';

const MascotRoom = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [character, setCharacter] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInventory, setShowInventory] = useState(false);
    const [animation, setAnimation] = useState(null);

    // Chat State
    const [chatInput, setChatInput] = useState("");
    const [showNovel, setShowNovel] = useState(false);
    const [novelText, setNovelText] = useState("");
    const [chatHistory, setChatHistory] = useState([]); // Array of { type: 'user' | 'mascot', text: string }
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashRes, invRes] = await Promise.all([
                    api.get('/student/dashboard/me'),
                    api.get('/student/inventory')
                ]);
                setCharacter(dashRes.data.character);
                setInventory(invRes.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const processMessage = async (text) => {
        const input = text.toLowerCase();
        
        // Archive the PREVIOUS mascot response if it exists
        if (novelText && novelText !== "..." && !isThinking) {
            setChatHistory(prev => [...prev, { type: 'mascot', text: novelText }]);
        }

        // Add current User message to history
        const userMsg = { type: 'user', text: text };
        setChatHistory(prev => [...prev, userMsg]);
        
        setIsThinking(true);
        setShowNovel(true);
        setNovelText("...");

        try {
            const res = await api.post('/mascot/chat', { message: text });
            const response = res.data.response;
            // Only update novelText! History will be updated on the NEXT message.
            setNovelText(response);
        } catch (err) {
            console.error("AI Chat failed, using fallback:", err);
            
            // Fallback to Smart Responses Logic
            let response = "";
            if (input.includes("привет") || input.includes("салем") || input.includes("hello")) {
                response = "Привет! Я так рад тебя видеть! Чем займемся? 😊";
            } else if (input.includes("как дела") || input.includes("как ты")) {
                response = "У меня всё супер! Радуюсь каждому мгновению с тобой. А как ты?";
            } else if (input.includes("есть") || input.includes("кушать")) {
                response = "Еда! Это отличная тема. Загляни в инвентарь! 🍕";
            } else {
                response = "Хмм, интересно! Я пока учусь, но мне очень нравится с тобой общаться. 💬";
            }

            setNovelText(response);
        } finally {
            setIsThinking(false);
        }
    };

    const handleMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        processMessage(chatInput);
        setChatInput("");
    };

    const handleFeed = async (itemId) => {
        try {
            const res = await api.post('/mascot/feed', null, { params: { item_id: itemId } });
            setCharacter(prev => ({
                ...prev,
                mascot_hunger: res.data.hunger,
                mascot_happiness: res.data.happiness
            }));
            setAnimation('eating');
            setTimeout(() => setAnimation(null), 2000);
            
            // Refresh inventory
            const invRes = await api.get('/student/inventory');
            setInventory(invRes.data);
            setShowInventory(false);

            // Mascot comments on food
            const foodNames = { apple: "яблоко", pizza: "пиццу", burger: "бургер", cake: "тортик" };
            const resp = `Ммм, спасибо за ${foodNames[itemId] || 'вкусняшку'}! Это было очень вкусно! 😋`;
            
            setNovelText(resp);
            setShowNovel(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePet = async () => {
        try {
            const res = await api.post('/mascot/pet');
            setCharacter(prev => ({
                ...prev,
                mascot_happiness: res.data.happiness
            }));
            setAnimation('happy');
            setTimeout(() => setAnimation(null), 1500);

            // Occasionally comment when petted
            if (Math.random() > 0.5) {
                const resp = "Ооо да, это то, что нужно! Мне так нравятся твои поглаживания. ^_^";
                setNovelText(resp);
                setShowNovel(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t('loading')}</div>;

    const activeMascot = character?.active_mascot || (character?.unlocked_mascots?.[0]) || "system.PNG";

    return (
        <div style={{ 
            height: '100vh', 
            background: 'linear-gradient(180deg, #f3f4f6 0%, #ffffff 100%)', 
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* VN Dialogue Overlay */}
            <NovelDialogue 
                show={showNovel}
                onClose={() => setShowNovel(false)}
                text={novelText}
                history={chatHistory}
                onSend={processMessage}
                isThinking={isThinking}
                mascotImg={`/mascots/${activeMascot}`}
                mascotName={character?.active_mascot ? (t('mascot_name') || 'Маскот') : 'Маскот'}
            />

            {/* Header */}
            <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ border: 'none', background: 'white', padding: '10px', borderRadius: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="stat-card">
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>{t('hunger')}</span>
                        <div className="progress-bg">
                            <div className="progress-fill hunger" style={{ width: `${character?.mascot_hunger || 0}%` }}></div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>{t('happiness')}</span>
                        <div className="progress-bg">
                            <div className="progress-fill happiness" style={{ width: `${character?.mascot_happiness || 0}%` }}></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mascot Area */}
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div 
                    className={`mascot-container ${animation}`}
                    onClick={handlePet}
                    style={{ cursor: 'pointer' }}
                >
                    <img 
                        src={`/mascots/${activeMascot}`} 
                        alt="mascot" 
                        style={{ width: '250px', height: '250px', objectFit: 'contain' }} 
                    />
                    {animation === 'happy' && <div className="floating-hearts">❤️❤️❤️</div>}
                    {animation === 'eating' && <div className="sparkles"><Sparkles color="#FFD700" fill="#FFD700" /></div>}
                </div>
            </main>

            {/* Chat Bar & Controls */}
            <footer style={{ padding: '20px', zIndex: 10 }}>
                {/* Chat Input Bar */}
                <form 
                    onSubmit={handleMessage}
                    style={{ 
                        maxWidth: '500px', margin: '0 auto 20px', 
                        display: 'flex', gap: '10px', 
                        background: 'white', padding: '8px', 
                        borderRadius: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{ padding: '0 10px', display: 'flex', alignItems: 'center', color: '#999' }}>
                        <MessageCircle size={20} />
                    </div>
                    <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Напиши что-нибудь маскоту..."
                        style={{ 
                            flex: 1, border: 'none', outline: 'none', 
                            fontSize: '15px', background: 'transparent' 
                        }}
                    />
                    <button 
                        type="submit"
                        style={{ 
                            border: 'none', 
                            background: chatInput.trim() ? '#3b82f6' : '#eee', 
                            color: 'white', 
                            width: '40px', height: '40px', 
                            borderRadius: '50%', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.3s'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <button 
                        className="action-btn pet"
                        onClick={handlePet}
                    >
                        <Heart size={20} fill="currentColor" /> {t('pet')}
                    </button>
                    <button 
                        className="action-btn feed"
                        onClick={() => setShowInventory(true)}
                    >
                        <Package size={20} /> {t('feed')}
                    </button>
                </div>
            </footer>

            {/* Inventory Modal */}
            {showInventory && (
                <div className="inventory-overlay">
                    <div className="inventory-modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0 }}>{t('inventory')}</h3>
                            <button onClick={() => setShowInventory(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                        </div>
                        <div className="inventory-grid">
                            {inventory.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>У тебя пока нет еды. Купи её в маркетплейсе!</p>
                            ) : (
                                inventory.map(item => (
                                    <div key={item.id} className="inv-item" onClick={() => handleFeed(item.item_id)}>
                                        <div className="inv-icon">
                                            {item.item_id === 'apple' && '🍎'}
                                            {item.item_id === 'pizza' && '🍕'}
                                            {item.item_id === 'burger' && '🍔'}
                                            {item.item_id === 'cake' && '🍰'}
                                        </div>
                                        <span className="inv-qty">x{item.quantity}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style sx>{`
                .stat-card {
                    background: white;
                    padding: 8px 12px;
                    border-radius: 15px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    width: 100px;
                }
                .progress-bg {
                    height: 6px;
                    background: #eee;
                    border-radius: 3px;
                    margin-top: 4px;
                    overflow: hidden;
                }
                .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
                .progress-fill.hunger { background: #f59e0b; }
                .progress-fill.happiness { background: #ef4444; }

                .mascot-container {
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .mascot-container.happy {
                    transform: scale(1.1) translateY(-20px);
                }
                .mascot-container.eating {
                    animation: shake 0.5s infinite;
                }

                @keyframes shake {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(5deg); }
                    75% { transform: rotate(-5deg); }
                    100% { transform: rotate(0deg); }
                }

                .action-btn {
                    border: none;
                    padding: 12px 24px;
                    border-radius: 20px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    transition: transform 0.2s;
                }
                .action-btn:active { transform: scale(0.95); }
                .action-btn.pet { background: #fee2e2; color: #ef4444; }
                .action-btn.feed { background: #dbeafe; color: #3b82f6; }

                .inventory-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    z-index: 100;
                    backdrop-filter: blur(4px);
                }
                .inventory-modal {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    border-radius: 30px 30px 0 0;
                    padding: 25px;
                    animation: slideUp 0.3s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }

                .inventory-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    padding: 10px 0;
                }
                .inv-item {
                    background: #f8fafc;
                    padding: 15px 10px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .inv-item:hover {
                    transform: translateY(-3px);
                    background: white;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }
                .inv-icon { 
                    font-size: 32px; 
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
                }
                .inv-qty {
                    background: #374151;
                    color: white;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 10px;
                    position: absolute;
                    top: -5px;
                    right: -5px;
                }

                .floating-hearts {
                    position: absolute;
                    top: -50px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 24px;
                    animation: floatUp 1.5s ease-out forwards;
                }
                @keyframes floatUp {
                    to { transform: translate(-50%, -100px); opacity: 0; }
                }
                .sparkles {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
};

export default MascotRoom;

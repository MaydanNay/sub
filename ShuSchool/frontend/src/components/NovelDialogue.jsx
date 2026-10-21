import React, { useState, useRef, useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { useLanguage } from '../context/LanguageContext';
import { Send, X } from 'lucide-react';

const NovelDialogue = ({ 
    show, 
    onClose, 
    text, 
    mascotImg, 
    mascotName,
    history = [], // Array of { type: 'user' | 'mascot', text: string }
    onSend,       // Callback for sending messages from inside VN
    isThinking = false, // Show AI processing state
    speed = 40 
}) => {
    const { displayedText, isFinished, skip } = useTypewriter(text, speed, show);
    const { t } = useLanguage();
    const [inputValue, setInputValue] = useState("");
    const historyEndRef = useRef(null);

    // Auto-scroll history to bottom
    useEffect(() => {
        if (historyEndRef.current) {
            historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    if (!show) return null;

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !onSend) return;
        onSend(inputValue);
        setInputValue("");
    };

    const handleOverlayClick = (e) => {
        // Only skip if not clicking input or buttons
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'SVG' && e.target.tagName !== 'path') {
            if (!isFinished) {
                skip();
            }
        }
    };

    return (
        <div 
            onClick={handleOverlayClick}
            style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                background: 'rgba(0,0,0,0.4)', 
                backdropFilter: 'blur(8px)',
                zIndex: 4000, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'flex-end',
                animation: 'novelFadeIn 0.3s ease'
            }}
        >
            {/* Close Button UI Wrapper (constrained) */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', height: '100%', pointerEvents: 'none' }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '20px', right: '20px',
                        background: 'rgba(255,255,255,0.1)', border: 'none',
                        color: 'white', width: '40px', height: '40px', 
                        borderRadius: '50%', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', cursor: 'pointer', zIndex: 4001,
                        pointerEvents: 'auto'
                    }}
                >
                    <X size={24} />
                </button>
            </div>

            {/* Mascot Image - Centered within constrained width */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px' }}>
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '30vh' }}>
                    <img 
                        src={mascotImg} 
                        alt="mascot large" 
                        style={{ 
                            width: '45vh', height: '45vh', objectFit: 'contain',
                            filter: 'drop-shadow(0 0 50px rgba(255,255,255,0.2))',
                            animation: 'novelBounceUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }} 
                    />
                </div>
            </div>

            {/* Dialogue Panel - Centered within constrained width */}
            <div style={{ 
                width: '100%',
                maxWidth: '480px',
                left: '50%',
                transform: 'translateX(-50%)',
                maxHeight: '60vh',
                background: 'linear-gradient(to bottom, rgba(20,20,20,1), rgba(0,0,0,1))',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 -20px 50px rgba(0,0,0,0.8)',
                zIndex: 4002,
                borderRadius: '30px 30px 0 0',
                padding: '40px 20px 30px'
            }}>
                {/* Name Label */}
                <div style={{ 
                    position: 'absolute', top: '-18px', left: '40px', 
                    background: 'var(--accent-yellow)', 
                    color: '#000', 
                    padding: '8px 25px', 
                    borderRadius: '12px',
                    fontWeight: '900',
                    fontSize: '14px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                }}>
                    {mascotName}
                </div>

                {/* History & Active Text Scroll Area */}
                <div style={{ 
                    overflowY: 'auto', 
                    flex: 1, 
                    marginBottom: '20px',
                    padding: '0 20px',
                    maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
                }}>
                    {/* Previous Messages */}
                    {history
                        .filter((msg, idx) => {
                            // Safety check: if the last message in history is the same as current active text, don't show it twice
                            if (idx === history.length - 1 && msg.type === 'mascot' && msg.text === text) return false;
                            return true;
                        })
                        .map((msg, idx) => (
                            <div key={idx} style={{ 
                                marginBottom: '15px', 
                                textAlign: msg.type === 'user' ? 'right' : 'left',
                                opacity: 0.6
                            }}>
                                <div style={{ 
                                    display: 'inline-block', 
                                    color: msg.type === 'user' ? '#93c5fd' : 'rgba(255, 255, 255, 0.5)',
                                    fontSize: '14px',
                                    maxWidth: '85%'
                                }}>
                                    <span style={{ fontSize: '9px', fontWeight: 'bold', display: 'block', marginBottom: '2px', opacity: 0.4 }}>
                                        {msg.type === 'user' ? 'ТЫ' : mascotName.toUpperCase()}
                                    </span>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    
                    {/* Active Text (Typewriter) */}
                    <div style={{ 
                        fontSize: '18px', 
                        color: 'white', 
                        lineHeight: '1.6', 
                        marginTop: '20px',
                        paddingBottom: '20px'
                    }}>
                        {isThinking ? (
                            <span style={{ animation: 'novelPulse 1s infinite', opacity: 0.6, fontStyle: 'italic' }}>
                                {mascotName} думает...
                            </span>
                        ) : displayedText}
                    </div>
                    <div ref={historyEndRef} />
                </div>

                {/* Input Bar */}
                <div style={{ padding: '0 20px' }}>
                    {isThinking ? (
                         <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'right', fontStyle: 'italic', padding: '10px' }}>
                            Обработка ИИ...
                        </div>
                    ) : isFinished ? (
                        onSend ? (
                            <form 
                                onSubmit={handleSend}
                                style={{ 
                                    display: 'flex', gap: '10px', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    padding: '8px 8px 8px 20px', 
                                    borderRadius: '30px', 
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <input 
                                    autoFocus
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Напиши что-нибудь..."
                                    style={{ 
                                        flex: 1, background: 'transparent', border: 'none', 
                                        outline: 'none', color: 'white', fontSize: '16px' 
                                    }}
                                />
                                <button 
                                    type="submit"
                                    style={{ 
                                        background: 'var(--accent-yellow)', color: 'black',
                                        border: 'none', width: '40px', height: '40px', 
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', 
                                        justifyContent: 'center', cursor: 'pointer'
                                    }}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        ) : (
                            <div style={{ 
                                textAlign: 'right', 
                                fontSize: '15px', 
                                color: 'rgba(255,255,255,0.4)',
                                animation: 'novelPulse 1.5s infinite',
                                cursor: 'pointer',
                                padding: '15px'
                            }} onClick={onClose}>
                                 Нажми, чтобы продолжить ▽
                            </div>
                        )
                    ) : (
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'right', fontStyle: 'italic', padding: '10px' }}>
                            {mascotName} говорит...
                        </div>
                    )}
                </div>
            </div>

            <style sx>{`
                @keyframes novelFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes novelSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes novelBounceUp { from { opacity: 0; transform: translateY(50px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes novelPulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
            `}</style>
        </div>
    );
};

export default NovelDialogue;

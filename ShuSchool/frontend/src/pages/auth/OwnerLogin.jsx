import React, { useState } from 'react';
import { useAuth, getDashboardPath } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const OwnerLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(username, password);
            navigate(getDashboardPath(user.role));
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (detail === "Incorrect username, phone, or password") {
                setError(t('login_error_user'));
            } else if (detail === "Incorrect password") {
                setError(t('login_error_password'));
            } else {
                setError(t('login_error'));
            }
        }
    };

    return (
        <div className="owner-auth-container animate-fade-in">
            <div className="owner-auth-card">
                <div className="owner-auth-header">
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #333', marginBottom: '20px' }}>
                        <img src="/logo.jpg" alt="ShuSchool" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h1>{t('owner_portal')}</h1>
                    <p>{t('welcome_sub')}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="owner-auth-form">
                    <div className="owner-input-group">
                        <label>{t('username_or_phone')}</label>
                        <div className="owner-input-wrapper">
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                placeholder={t('username_or_phone')}
                                required
                            />
                        </div>
                    </div>
                    <div className="owner-input-group">
                        <label>{t('password_label')}</label>
                        <div className="owner-input-wrapper">
                            <Lock size={16} color="#666" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="••••••••"
                                style={{ letterSpacing: showPassword ? '1px' : '4px' }}
                                required
                            />
                            <button 
                                type="button" 
                                className="visibility-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={18} color="#666" /> : <Eye size={18} color="#666" />}
                            </button>
                        </div>
                    </div>
                    
                    {error && <p className="owner-error-msg">{error}</p>}
                    
                    <button type="submit" className="owner-btn">
                        {t('enter_cabinet')}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .owner-auth-container {
                    display: flex; justify-content: center; align-items: center; min-height: 100vh;
                    max-width: 480px; margin: 0 auto;
                    background: #080808; font-family: 'Outfit', sans-serif; padding: 20px;
                    position: relative;
                }
                .owner-auth-card {
                    width: 100%; max-width: 400px; padding: 50px 40px; text-align: center;
                    background: #111; border-radius: 12px; border: 1px solid #333;
                }
                .owner-auth-header { margin-bottom: 40px; display: flex; flex-direction: column; align-items: center; }
                .owner-auth-header h1 { margin: 20px 0 5px; font-size: 24px; color: #fff; font-weight: 300; letter-spacing: 4px; }
                .owner-auth-header p { color: #888; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
                
                .owner-auth-form { display: flex; flex-direction: column; gap: 25px; }
                .owner-input-group { text-align: left; }
                .owner-input-group label { display: block; font-size: 11px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
                
                .owner-input-wrapper { display: flex; align-items: center; background: #000; border: 1px solid #333; border-radius: 6px; padding: 0 15px; transition: border-color 0.3s; }
                .owner-input-wrapper input { width: 100%; padding: 15px; background: transparent; border: none; color: white; font-size: 16px; outline: none; letter-spacing: 1px;}
                .owner-input-group:focus-within .owner-input-wrapper { border-color: var(--accent-yellow); }
                
                .owner-btn { width: 100%; padding: 16px; border-radius: 6px; border: 1px solid var(--accent-yellow); background: rgba(255, 215, 0, 0.1); color: var(--accent-yellow); font-size: 14px; letter-spacing: 4px; display: flex; align-items: center; justify-content: center; margin-top: 10px; cursor: pointer; transition: 0.3s; text-transform: uppercase;}
                .owner-btn:hover { background: var(--accent-yellow); color: black; }
                
                .owner-error-msg { color: #ff4d4d; font-size: 12px; margin: 0; text-align: center; }
            `}</style>
        </div>
    );
};

export default OwnerLogin;

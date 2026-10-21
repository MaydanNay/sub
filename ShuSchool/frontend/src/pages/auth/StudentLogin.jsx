import React, { useState } from 'react';
import { useAuth, getDashboardPath } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api';

const StudentLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        <div className="auth-container animate-fade-in">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="icon-wrapper" style={{ overflow: 'hidden', padding: 0 }}>
                        <img src="/logo.jpg" alt="ShuSchool" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h1>ShuSchool</h1>
                    <p>{t('welcome_sub')}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>{t('username_label')}</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder={t('login_placeholder')}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('password_secret')}</label>
                        <div className="password-toggle-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="••••••••"
                                style={{ width: '100%', paddingRight: '45px' }}
                                required
                            />
                            <button 
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.5 }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    
                    {error && <p className="error-msg">{error}</p>}
                    
                    <button type="submit" className="btn-primary auth-btn pop-btn">
                        <LogIn size={18} /> {t('login_button')}
                    </button>
                    
                    <div className="auth-links">
                        <p>{t('no_account')} <Link to="/register">{t('register_link')}</Link></p>
                    </div>
                </form>
                
                <div className="staff-link-wrapper">
                    <Link to="/staff" className="staff-link">{t('staff_link')}</Link>
                </div>
            </div>

            <style jsx>{`
                .auth-container {
                    display: flex; justify-content: center; align-items: center; min-height: 100vh;
                    max-width: 480px; margin: 0 auto;
                    padding: 20px; background: linear-gradient(135deg, #fef9e7 0%, #fdf2c9 100%);
                    font-family: 'Inter', sans-serif;
                    position: relative;
                }
                .auth-card {
                    width: 100%; max-width: 400px; padding: 40px; text-align: center;
                    background: white; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.05);
                    position: relative;
                }
                .icon-wrapper {
                    width: 70px; height: 70px; background: var(--accent-yellow); border-radius: 20px;
                    display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
                    transform: rotate(-5deg);
                }
                .auth-header h1 { margin: 0; font-size: 28px; color: #333; font-weight: 800; }
                .auth-header p { color: #666; font-size: 14px; margin: 10px 0 30px; }
                
                .auth-form { display: flex; flex-direction: column; gap: 20px; }
                .input-group { text-align: left; }
                .input-group label { display: block; font-size: 12px; font-weight: bold; color: #555; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
                .input-group input { width: 100%; padding: 14px; border: 2px solid #eee; border-radius: 16px; background: #fafafa; font-size: 15px; transition: 0.2s; }
                .input-group input:focus { border-color: var(--accent-yellow); background: white; outline: none; box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.2); }
                
                .pop-btn { width: 100%; padding: 16px; border-radius: 16px; font-size: 16px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px; transition: transform 0.2s, box-shadow 0.2s; }
                .pop-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(255,215,0,0.3); }
                
                .error-msg { color: #ff6b6b; font-size: 13px; font-weight: bold; background: #fff0f0; padding: 10px; border-radius: 10px; }
                
                .auth-links { margin-top: 20px; font-size: 14px; color: #666; }
                .auth-links a { color: #e6b800; font-weight: bold; text-decoration: none; }
                
                .staff-link-wrapper { margin-top: 40px; padding-top: 20px; border-top: 2px dashed #eee; }
                .staff-link { color: #ccc; font-size: 12px; font-weight: bold; text-decoration: none; text-transform: uppercase; transition: 0.2s; }
                .staff-link:hover { color: #999; }
            `}</style>
        </div>
    );
};

export default StudentLogin;

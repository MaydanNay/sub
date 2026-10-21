import React, { useState, useEffect } from 'react';
import { Settings, Coins, Library, RefreshCcw, Save, Plus, Trash2, ShieldCheck } from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

const AdminSettings = () => {
    const { t } = useLanguage();
    const [settings, setSettings] = useState({
        coins_attendance_ontime: 5,
        coins_attendance_late: 0,
        coins_lesson_attendance: 3,
        coins_hw_step: 2,
        coins_hw_full_bonus: 5,
        reception_refresh_minutes: 5
    });
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [userResp, subjectsResp] = await Promise.all([
                api.get('/auth/me'),
                api.get('/subjects')
            ]);
            // School settings come from user.school.settings
            if (userResp.data.school?.settings) {
                setSettings(prev => ({ ...prev, ...userResp.data.school.settings }));
            }
            setSubjects(subjectsResp.data);
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await api.patch('/admin/school/settings', settings);
            alert(t('save'));
        } catch (err) {
            console.error(err);
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key, val) => {
        setSettings({ ...settings, [key]: parseInt(val) || 0 });
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t('loading')}...</div>;

    return (
        <div className="admin-settings animate-fade-in">
            {/* Rewards Configuration */}
            <div className="card settings-card">
                <div className="card-header">
                    <div className="icon-box" style={{ background: 'rgba(255, 215, 0, 0.1)', color: 'var(--accent-yellow)' }}>
                        <Coins size={20} />
                    </div>
                    <h3>Система вознаграждений</h3>
                </div>
                <div className="settings-grid">
                    <div className="setting-item">
                        <label>Приход вовремя (коины)</label>
                        <input 
                            type="number" 
                            value={settings.coins_attendance_ontime} 
                            onChange={(e) => updateSetting('coins_attendance_ontime', e.target.value)} 
                        />
                    </div>
                    <div className="setting-item">
                        <label>Опоздание (коины)</label>
                        <input 
                            type="number" 
                            value={settings.coins_attendance_late} 
                            onChange={(e) => updateSetting('coins_attendance_late', e.target.value)} 
                        />
                    </div>
                    <div className="setting-item">
                        <label>Посещение урока</label>
                        <input 
                            type="number" 
                            value={settings.coins_lesson_attendance} 
                            onChange={(e) => updateSetting('coins_lesson_attendance', e.target.value)} 
                        />
                    </div>
                    <div className="setting-item">
                        <label>Шаг ДЗ</label>
                        <input 
                            type="number" 
                            value={settings.coins_hw_step} 
                            onChange={(e) => updateSetting('coins_hw_step', e.target.value)} 
                        />
                    </div>
                    <div className="setting-item">
                        <label>Бонус за всё ДЗ</label>
                        <input 
                            type="number" 
                            value={settings.coins_hw_full_bonus} 
                            onChange={(e) => updateSetting('coins_hw_full_bonus', e.target.value)} 
                        />
                    </div>
                </div>
                <button className="btn-primary" onClick={handleSaveSettings} disabled={saving} style={{ marginTop: '20px' }}>
                    <Save size={18} /> {saving ? t('saving_btn') : t('save_grades_btn')}
                </button>
            </div>

            {/* Reception Settings */}
            <div className="card settings-card">
                <div className="card-header">
                    <div className="icon-box" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>
                        <RefreshCcw size={20} />
                    </div>
                    <h3>Настройки Ресепшн</h3>
                </div>
                <div className="setting-item">
                    <label>Обновление QR (мин)</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                            type="number" 
                            style={{ flex: 1 }}
                            value={settings.reception_refresh_minutes} 
                            onChange={(e) => updateSetting('reception_refresh_minutes', e.target.value)} 
                        />
                        <span style={{ fontSize: '12px', color: '#666' }}>Период смены кода</span>
                    </div>
                </div>
                <button className="btn-secondary" onClick={handleSaveSettings} style={{ marginTop: '15px', borderColor: '#3498db', color: '#3498db' }}>
                    Применить
                </button>
            </div>

            {/* Subjects Overview */}
            <div className="card settings-card">
                <div className="card-header">
                    <div className="icon-box" style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}>
                        <Library size={20} />
                    </div>
                    <h3>Предметы и Статы</h3>
                </div>
                <div className="subject-list">
                    {subjects.map(s => (
                        <div key={s.id} className="subject-row">
                            <span className="sub-name">{s.name}</span>
                            <span className="sub-tag">{s.mapped_stat}</span>
                        </div>
                    ))}
                    <button className="add-btn-minimal">
                        <Plus size={14} /> Добавить предмет
                    </button>
                </div>
            </div>

            <style jsx>{`
                .admin-settings {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .settings-card {
                    padding: 20px;
                    background: #111;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 800;
                }
                .icon-box {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                }
                .setting-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .setting-item label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #888;
                }
                .setting-item input {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 10px;
                    padding: 10px;
                    color: white;
                    font-family: inherit;
                    font-weight: 800;
                }
                .subject-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .subject-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                }
                .sub-name {
                    font-size: 14px;
                    font-weight: 600;
                }
                .sub-tag {
                    font-size: 10px;
                    text-transform: uppercase;
                    background: #333;
                    padding: 2px 8px;
                    border-radius: 6px;
                    color: #999;
                    font-weight: 800;
                }
                .add-btn-minimal {
                    background: transparent;
                    border: 1px dashed #444;
                    color: #666;
                    padding: 8px;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 12px;
                    margin-top: 5px;
                }
            `}</style>
        </div>
    );
};

export default AdminSettings;

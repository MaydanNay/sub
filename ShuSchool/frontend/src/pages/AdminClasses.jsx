import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

const AdminClasses = () => {
    const { t } = useLanguage();
    const [classes, setClasses] = useState([]);
    const [newClassName, setNewClassName] = useState('');
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/classes');
            setClasses(response.data);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        if (!newClassName.trim()) return;
        setActionLoading(true);
        try {
            await api.post('/admin/classes', { name: newClassName.trim() });
            setNewClassName('');
            fetchClasses();
        } catch (err) {
            alert("Ошибка при создании класса");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm("Вы уверены? Это не удалит учеников, но они больше не смогут выбрать этот класс при регистрации.")) return;
        try {
            await api.delete(`/admin/classes/${id}`);
            fetchClasses();
        } catch (err) {
            alert("Ошибка при удалении");
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await api.post('/admin/classes/sync');
            alert(res.data.message);
            fetchClasses();
        } catch (err) {
            alert("Ошибка синхронизации");
        } finally {
            setSyncing(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>{t('loading')}...</div>;

    return (
        <div className="admin-classes animate-fade-in">
            <div className="admin-card card">
                <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Layers className="icon-accent" size={20} />
                        <h3 className="section-title" style={{ margin: 0 }}>Управление классами</h3>
                    </div>
                    <button 
                        className={`btn-sync ${syncing ? 'spinning' : ''}`} 
                        onClick={handleSync}
                        disabled={syncing}
                        title="Синхронизировать с текущими учениками"
                    >
                        <RefreshCw size={16} />
                        <span>Синхронизировать</span>
                    </button>
                </div>

                <p className="helper-text">
                    Создайте список официальных классов вашей школы. Новые ученики смогут выбирать только из этого списка.
                </p>

                <form onSubmit={handleAddClass} className="add-class-form">
                    <input 
                        type="text" 
                        placeholder="Название класса (напр. 10-А)" 
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="premium-input"
                    />
                    <button type="submit" className="btn-add" disabled={actionLoading || !newClassName.trim()}>
                        <Plus size={20} />
                    </button>
                </form>

                <div className="classes-grid">
                    {classes.length === 0 ? (
                        <div className="empty-state">
                            <AlertCircle size={32} opacity={0.3} />
                            <p>Классы еще не созданы. Используйте синхронизацию или добавьте вручную.</p>
                        </div>
                    ) : (
                        classes.map(cls => (
                            <div key={cls.id} className="class-tag card">
                                <span className="class-name">{cls.name}</span>
                                <button className="btn-trash" onClick={() => handleDeleteClass(cls.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style jsx>{`
                .admin-classes {
                    padding: 20px;
                }
                .admin-card {
                    padding: 25px;
                    background: #111;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .section-title {
                    font-size: 18px;
                    font-weight: 800;
                }
                .icon-accent {
                    color: var(--accent-yellow);
                }
                .helper-text {
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 25px;
                    line-height: 1.4;
                }
                .btn-sync {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #888;
                    padding: 8px 12px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .btn-sync:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                .spinning svg {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .add-class-form {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 30px;
                }
                .premium-input {
                    flex: 1;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 15px;
                    padding: 14px;
                    color: white;
                    font-weight: 600;
                    outline: none;
                }
                .premium-input:focus {
                    border-color: var(--accent-yellow);
                }
                .btn-add {
                    background: var(--accent-yellow);
                    color: black;
                    border: none;
                    width: 50px;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-add:hover:not(:disabled) { transform: scale(1.05); }

                .classes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 12px;
                }
                .class-tag {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 15px;
                    background: #181818;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                }
                .class-name {
                    font-weight: 800;
                    font-size: 15px;
                    color: var(--accent-yellow);
                }
                .btn-trash {
                    background: transparent;
                    border: none;
                    color: #444;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-trash:hover { color: #ff4d4d; }

                .empty-state {
                    grid-column: 1 / -1;
                    padding: 40px;
                    text-align: center;
                    color: #444;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px dashed rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }
                .empty-state p { margin-top: 10px; font-size: 13px; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default AdminClasses;

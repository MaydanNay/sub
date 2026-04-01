import React, { useState, useEffect } from 'react';
import { Users, Trophy, Calendar, MapPin, Image, CheckCircle2, ChevronRight, Settings, Globe, User, Bell, Shield, LogOut, Palette, HelpCircle, Save } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import * as api from '../../api';
import './ProfilePage.css';

/* ── UTILS ── */
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

/* ════════════════════════════
   PROFILE PAGE
════════════════════════════ */
const ProfilePage = ({ onLogout }) => {
  const { showAlert, showConfirm } = useNotification();
  const [activeTab] = useState('achievements');
  const [showSettings, setShowSettings] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  /* ── User state (loaded from API + cached in localStorage) ── */
  const [user, setUser] = useState(() => api.getUser() || { name: '...', phone: '', bio: '', city: '' });
  const [editForm, setEditForm] = useState({ name: '', bio: '', city: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const [myCommunities, setMyCommunities] = useState([]);
  const [myMeetings, setMyMeetings] = useState([]);
  const [myBadges, setMyBadges] = useState([]);

  useEffect(() => {
    api.getMe()
      .then(async data => {
        setUser(data);
        api.setUser(data);

        // Fetch user's real data
        try {
          const comms = await api.getUserCommunities();
          setMyCommunities(comms || []);
          
          const meets = await api.getMeetings();
            const mapped = (meets || []).map(m => {
              const dt = new Date(m.date_time);
              return {
                id: m.id,
                title: m.title,
                date: dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                time: dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                location: m.location_address || '',
                cost: m.cost || 0
              };
            });
            setMyMeetings(mapped);
            
            const badges = await api.getUserBadges();
            setMyBadges(badges || []);
          } catch(e) { console.error('Error fetching user data', e); }
      })
      .catch(() => {});
  }, []);

  const openEdit = () => {
    setEditForm({ name: user.name || '', bio: user.bio || '', city: user.city || '' });
    setSaveError('');
    setEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const updated = await api.updateMe({
        name: editForm.name || undefined,
        bio: editForm.bio || undefined,
        city: editForm.city || undefined,
      });
      setUser(updated);
      api.setUser(updated);
      setEditModal(false);
    } catch (err) {
      setSaveError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!(await showConfirm("Вы точно хотите выйти из аккаунта?", "Выход"))) return;
    setShowSettings(false);
    onLogout?.();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await api.uploadAvatar(file);
      setUser(updated);
      api.setUser(updated);
      showAlert('Фото профиля обновлено!', 'Успех');
    } catch (err) {
      showAlert('Ошибка при загрузке аватара: ' + err.message, 'Ошибка');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : 'недавно';

  return (
    <div className="community-detail">

      {/* ── ХЕДЕР ── */}
      <header className="detail-header">
        <div className="header-nav">
          <div style={{width:44}}/>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setShowSettings(true)}><Settings size={22}/></button>
          </div>
        </div>

        <div className="community-main-info">
          <div className="main-info-card">
            <div className="profile-big-avatar" onClick={handleAvatarClick} style={{ cursor: 'pointer', position: 'relative' }}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
              ) : (
                initials(user.name || user.phone)
              )}
              {uploading && (
                <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span className="spinner" style={{width:20, height:20, borderTopColor:'white', borderRightColor:'white', borderBottomColor:'transparent', borderLeftColor:'transparent', borderRadius:'50%', border:'2px solid', animation:'spin 1s linear infinite'}}></span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{display: 'none'}} />
            <div className="community-text">
              <h1>{user.name || user.phone}</h1>
              <p>
                {user.city ? `${user.city} · ` : ''}
                Участник с {memberSince}
              </p>
              {user.bio && <p style={{marginTop: 4, opacity: 0.75, fontSize: 13}}>{user.bio}</p>}
              <div className="community-stats">
                <span><Users size={15}/> {user.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="detail-content">
        {activeTab === 'achievements' && (
          <section className="detail-section">
            <div className="ap-card">
              <h4>Мои сообщества</h4>
              {myCommunities.length === 0 ? (
                <p style={{fontSize: 13, color: '#888'}}>Вы пока не состоите ни в одном сообществе</p>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 10 }}>
                  {myCommunities.map(c => (
                    <div key={c.id} style={{
                      background: '#1F1F1F', border: '1px solid #333', borderRadius: '50px',
                      padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 13
                    }}>
                      <div style={{width: 24, height: 24, borderRadius: '50%', background: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600}}>
                        {c.name[0]}
                      </div>
                      <span style={{color: '#ddd'}}>{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ap-card" style={{marginTop: 15}}>
              <h4>Мои достижения</h4>
              {myBadges.length === 0 ? (
                <p style={{fontSize: 13, color: '#888', padding: 0}}>У вас пока нет достижений. Участвуйте в мероприятиях и закрывайте цели!</p>
              ) : (
                <div className="prof-badges-grid">
                  {myBadges.map(b => (
                    <div key={b.id} className="prof-badge">
                      <div className="prof-badge-icon">{b.icon_url || '🏆'}</div>
                      <div className="prof-badge-name">{b.name}</div>
                      <div className="prof-badge-comm">{b.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ══ ШТОРКА НАСТРОЕК ══ */}
      {showSettings && (
        <div className="ap-overlay" onClick={() => setShowSettings(false)}>
          <div className="ap-sheet" onClick={e => e.stopPropagation()}>
            <div className="ap-sheet-handle"></div>
            <h3 className="ap-sheet-title">Настройки</h3>

            <div className="settings-list">
              <button className="settings-item" onClick={() => { setShowSettings(false); openEdit(); }}>
                <div className="si-icon green"><User size={18}/></div>
                <div className="si-text"><div className="si-label">Редактировать профиль</div><div className="si-sub">Имя, город, о себе</div></div>
                <ChevronRight size={16} className="si-arrow"/>
              </button>

              <button className="settings-item">
                <div className="si-icon blue"><Bell size={18}/></div>
                <div className="si-text"><div className="si-label">Уведомления</div><div className="si-sub">Встречи, напоминания</div></div>
                <ChevronRight size={16} className="si-arrow"/>
              </button>

              <button className="settings-item">
                <div className="si-icon purple"><Palette size={18}/></div>
                <div className="si-text"><div className="si-label">Внешний вид</div><div className="si-sub">Тема, язык</div></div>
                <ChevronRight size={16} className="si-arrow"/>
              </button>

              <button className="settings-item">
                <div className="si-icon gray"><Shield size={18}/></div>
                <div className="si-text"><div className="si-label">Конфиденциальность</div><div className="si-sub">Кто видит мой профиль</div></div>
                <ChevronRight size={16} className="si-arrow"/>
              </button>

              <button className="settings-item">
                <div className="si-icon gray"><HelpCircle size={18}/></div>
                <div className="si-text"><div className="si-label">Помощь и поддержка</div><div className="si-sub">FAQ, связаться с нами</div></div>
                <ChevronRight size={16} className="si-arrow"/>
              </button>

              <div className="settings-divider"/>

              <button className="settings-item danger" onClick={handleLogout}>
                <div className="si-icon red"><LogOut size={18}/></div>
                <div className="si-text"><div className="si-label">Выйти из аккаунта</div></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ МОДАЛКА РЕДАКТИРОВАНИЯ ══ */}
      {editModal && (
        <div className="ap-overlay" onClick={() => setEditModal(false)}>
          <div className="ap-sheet" onClick={e => e.stopPropagation()}>
            <div className="ap-sheet-handle"></div>
            <h3 className="ap-sheet-title">Редактировать профиль</h3>
            {saveError && <div className="auth-error" style={{margin:'0 0 10px'}}>{saveError}</div>}
            <form className="sheet-form" onSubmit={handleSaveProfile}>
              <div className="edit-avatar-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div className="profile-big-avatar" style={{width:80, height:80, fontSize:24, flexShrink: 0}}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                  ) : (
                    initials(editForm.name || user.phone)
                  )}
                  {uploading && (
                    <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <span className="spinner" style={{width:20, height:20, borderTopColor:'white', borderRightColor:'white', borderBottomColor:'transparent', borderLeftColor:'transparent', borderRadius:'50%', border:'2px solid', animation:'spin 1s linear infinite'}}></span>
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={handleAvatarClick}
                  style={{
                    background: '#141414', color: '#fff', border: 'none', padding: '10px 20px', 
                    borderRadius: '40px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  {uploading ? 'Загрузка...' : 'Сменить фото'}
                </button>
              </div>
              <div className="ap-group">
                <label>Имя</label>
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({...f, name: e.target.value}))}
                  placeholder="Ваше имя"
                />
              </div>
              <div className="ap-group">
                <label>Город</label>
                <input
                  value={editForm.city}
                  onChange={e => setEditForm(f => ({...f, city: e.target.value}))}
                  placeholder="Алматы"
                />
              </div>
              <div className="ap-group">
                <label>О себе</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm(f => ({...f, bio: e.target.value}))}
                  placeholder="Напишите немного о себе..."
                  rows={3}
                />
              </div>
              <div className="ap-footer">
                <button type="button" className="ap-btn-cancel" onClick={() => setEditModal(false)}>Отмена</button>
                <button type="submit" className="ap-btn-ok" disabled={saving}>
                  {saving ? 'Сохранение...' : <><Save size={14}/> Сохранить</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

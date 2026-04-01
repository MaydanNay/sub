import React, { useState, useEffect } from 'react';
import { Plus, Users, ChevronRight, Globe, Lock, ChevronDown, Check, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import * as api from '../../api';
import './MyCommunities.css';

const CATEGORIES_LIST = ['Художники', 'Чтение', 'Музыка', 'Аниме', 'Кулинария', 'Философия', 'Спорт'];

/* ════════════════════════════════
   CUSTOM DROPDOWN
   ════════════════════════════════ */
const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => (o.value || o) === value);
  const label = selected ? (selected.label || selected) : (placeholder || 'Выбрать');

  return (
    <div className="cselect" ref={ref}>
      <div className={`cselect-trigger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <span>{label}</span>
        <ChevronDown size={16} className={`cselect-arrow ${open ? 'rotated' : ''}`} />
      </div>
      {open && (
        <div className="cselect-dropdown">
          {options.map(o => {
            const val = o.value || o;
            const lbl = o.label || o;
            return (
              <div key={val} className={`cselect-option ${val === value ? 'selected' : ''}`} onClick={() => { onChange(val); setOpen(false); }}>
                <span>{lbl}</span>
                {val === value && <Check size={14} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════
   BOTTOM SHEET MODAL
   ════════════════════════════════ */
const BottomSheet = ({ title, onClose, children }) => (
  <div className="ap-overlay" onClick={onClose}>
    <div className="ap-sheet" onClick={e => e.stopPropagation()}>
      <div className="ap-sheet-handle"></div>
      <h3 className="ap-sheet-title">{title}</h3>
      {children}
    </div>
  </div>
);

/* ════════════════════════════════
   МОИ СООБЩЕСТВА
   ════════════════════════════════ */
const MyCommunities = () => {
  const navigate = useNavigate();
  const { showAlert } = useNotification();
  const [communities, setCommunities] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Художники', type: 'open', description: '', avatar_url: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setCommunities([]);
      setLoading(false);
      return;
    }
    api.getUserCommunities()
      .then(data => {
        setCommunities(data || []);
      })
      .catch(err => {
        console.error('Ошибка загрузки сообществ:', err);
        setCommunities([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingAvatar(true);
    try {
      const { urls } = await api.uploadMedia(files);
      setForm(f => ({ ...f, avatar_url: urls[0] }));
    } catch (err) {
      showAlert("Ошибка загрузки: " + err.message, "Ошибка");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = api.getToken();
    if (!token) {
      showAlert("Авторизуйтесь для создания сообщества", "Внимание");
      return;
    }

    const privacyMap = { open: 'OPEN', closed: 'CLOSED' };
    try {
      const created = await api.createCommunity({
        name: form.name,
        description: form.description,
        category: form.category,
        privacy_type: privacyMap[form.type] || 'OPEN',
        avatar_url: form.avatar_url,
      });

      setCommunities(prev => [...prev, created]);
      setIsCreateOpen(false);
      setForm({ name: '', category: 'Художники', type: 'open', description: '', avatar_url: '' });
      showAlert("Сообщество успешно создано!", "Успех");
      
      // Redirect to the new community
      navigate(`/community/${created.id}`);
    } catch (err) {
      showAlert("Ошибка при создании сообщества: " + err.message, "Ошибка");
    }
  };

  if (loading) return <div style={{ padding: 20, color: '#E6E6D7' }}>Загрузка...</div>;

  return (
    <div className="mc-page">
      <header className="mc-header">
        <h1>Мои сообщества</h1>
        <p>Клубы, в которых вы состоите или которыми управляете</p>
      </header>

      <div className="mc-content">
        <button className="mc-create-btn" onClick={() => setIsCreateOpen(true)}>
          <Plus size={20} /> Создать сообщество
        </button>

        {communities.length === 0 ? (
          <div className="mc-empty" style={{ marginTop: 40 }}>
            <div className="mc-empty-icon" style={{ fontSize: 40, marginBottom: 10 }}>🏘️</div>
            <p style={{ color: 'rgba(20,20,20,0.5)' }}>У вас пока нет сообществ</p>
          </div>
        ) : (
          <div className="mc-list">
            {communities.map(c => (
              <div key={c.id} className="mc-card" onClick={() => navigate(`/community/${c.id}`)}>
                <div className="card-tags" style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div className="tag-category" style={{ background: '#E6E6D7', padding: '4px 10px', borderRadius: 10, fontSize: 12 }}>{c.category || 'Общее'}</div>
                  <div className={`badge ${c.privacy_type === 'OPEN' ? 'open' : 'closed'}`} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {c.privacy_type === 'OPEN' ? <Globe size={13} /> : <Lock size={13} />}
                    {c.privacy_type === 'OPEN' ? 'Открытое' : 'Закрытое'}
                  </div>
                </div>
                <div className="card-main">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {c.avatar_url ? (
                      <img src={c.avatar_url} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} alt="c-icon" />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={22} color="#888" />
                      </div>
                    )}
                    <h3 style={{ margin: 0, fontSize: 18 }}>{c.name}</h3>
                  </div>
                  {c.description && (
                    <p style={{ margin: '10px 0', fontSize: 14, color: 'rgba(20,20,20,0.6)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.description}
                    </p>
                  )}
                  <div className="mc-card-meta" style={{ display: 'flex', gap: 15, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginTop: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {c.members_count || 0} участников</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check style={{ color: '#77BC79' }} size={14} /> 
                      {c.user_role === 'LEADER' ? 'Владелец' : (c.user_role === 'MODERATOR' ? 'Админ' : 'Участник')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модалка создания сообщества */}
      {isCreateOpen && (
        <BottomSheet title="Создание сообщества" onClose={() => setIsCreateOpen(false)}>
          <form onSubmit={handleCreate} className="sheet-form">
            <div className="ap-group">
              <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Название</label>
              <input 
                required 
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd' }}
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                placeholder="Название клуба" 
              />
            </div>
            <div className="ap-group" style={{ marginTop: 15 }}>
              <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Описание</label>
              <textarea 
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd', resize: 'none' }}
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
                placeholder="Коротко о вашем клубе..." 
                rows={3} 
              />
            </div>
            <div className="ap-group" style={{ marginTop: 15 }}>
              <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Категория</label>
              <CustomSelect value={form.category} onChange={v => setForm({ ...form, category: v })} options={CATEGORIES_LIST} />
            </div>
            <div className="ap-group" style={{ marginTop: 15 }}>
              <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Тип сообщества</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'open' })}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '40px', border: '1px solid #141414',
                    background: form.type === 'open' ? '#141414' : 'transparent',
                    color: form.type === 'open' ? '#fff' : '#141414',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Открытая
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'closed' })}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '40px', border: '1px solid #141414',
                    background: form.type === 'closed' ? '#141414' : 'transparent',
                    color: form.type === 'closed' ? '#fff' : '#141414',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Закрытая
                </button>
              </div>
            </div>

            <div className="ap-group" style={{ marginTop: 15 }}>
              <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Аватарка сообщества</label>
              <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ccc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {form.avatar_url ? <img src={form.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={32} color="#888" />}
                </div>
                <label className="mc-create-btn" style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', background: '#fff', border: '1px solid #141414', color: '#141414' }}>
                  {uploadingAvatar ? 'Загрузка...' : 'Выбрать файл'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>

            <button type="submit" className="mc-create-btn" style={{ marginTop: 25, width: '100%', padding: 15, background: '#141414', color: '#fff' }}>Создать сообщество</button>
          </form>
        </BottomSheet>
      )}
    </div>
  );
};

export default MyCommunities;

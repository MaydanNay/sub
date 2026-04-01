import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { MapPin, Clock, Users, ChevronRight, ArrowLeft, Globe, Lock, Plus, Share2, MoreVertical } from 'lucide-react';
import * as api from '../../api';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import './Dashboard.css';

const BottomSheet = ({ title, onClose, children }) => (
  <div className="ap-overlay" onClick={onClose} style={{ zIndex: 1000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
    <div className="ap-sheet" onClick={e => e.stopPropagation()} style={{ background: '#E6E6D7', width: '100%', borderRadius: '30px 30px 0 0', padding: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
      <div className="ap-sheet-handle" style={{ width: 40, height: 4, background: '#ccc', borderRadius: 2, margin: '0 auto 15px' }}></div>
      <h3 className="ap-sheet-title" style={{ fontSize: 20, marginBottom: 20 }}>{title}</h3>
      {children}
    </div>
  </div>
);

/* ── EVENT CARD ── */
const EventCard = ({ ev, onRegister }) => (
  <div className="event-full-card">
    <div className="event-header">
      <span className="event-type">{ev.type}</span>
      <span className={`event-tag ${ev.status === 'Посещено' ? 'past' : ''}`}>{ev.status}</span>
    </div>
    <h2>{ev.title}</h2>
    <div className="event-meta">
      <div className="meta-item"><Clock size={16} /> {ev.time}</div>
      <div className="meta-item"><MapPin size={16} /> {ev.place}</div>
    </div>
    {ev.materials.length > 0 && (
      <div className="materials-box">
        <h4>Что взять с собой:</h4>
        <ul>{ev.materials.map((m, i) => <li key={i}>{m}</li>)}</ul>
      </div>
    )}
    {ev.cost > 0 && <div className="ev-cost-row">Стоимость: <strong>{ev.cost} ₸</strong></div>}
    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
      <button className="action-btn" style={{ flex: 1 }}>Смотреть на карте</button>
      {ev.status !== 'Посещено' && (
        <button 
          className="action-btn" 
          style={{ flex: 1, background: '#141414', color: '#fff' }}
          onClick={() => onRegister?.(ev)}
        >
          Записаться
        </button>
      )}
    </div>
  </div>
);

/* ── COMMUNITY SCHEDULE ── */
const CommunitySchedule = ({ community, onBack, onShowCreateModal, onPay }) => {
  const { showAlert } = useNotification();
  const [tab, setTab] = useState('upcoming');
  const navigate = useNavigate();
  const moreMenuRef = useRef(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: community.name || '',
    description: community.description || '',
    category: community.category || 'Общее',
    privacy_type: (community.type === 'open') ? 'OPEN' : 'PARTIAL',
    avatar_url: community.avatar_url || ''
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAvatarUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingAvatar(true);
    try {
      const { urls } = await api.uploadMedia(files);
      setEditForm(f => ({ ...f, avatar_url: urls[0] }));
    } catch (err) { showAlert(err.message, 'Ошибка'); }
    finally { setUploadingAvatar(false); }
  };

  const handleUpdateCommunity = async (e) => {
    e.preventDefault();
    try {
      await api.updateCommunity(community.id, editForm);
      setShowEditModal(false);
      showAlert("Сообщество обновлено! Пожалуйста, обновите страницу.", "Успех");
      window.location.reload();
    } catch (err) { showAlert(err.message, 'Ошибка'); }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/community/${community.id}`;
    if (navigator.share) {
      navigator.share({
        title: community.name,
        text: community.description,
        url: shareUrl,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(shareUrl);
      showAlert("Ссылка скопирована в буфер обмена!", "Успех");
    }
  };

  const events = tab === 'upcoming' ? community.upcoming : community.past;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header sched-header">
        <div className="header-nav">
          <button className="icon-btn" onClick={onBack}><ArrowLeft size={24} /></button>
          <div className="header-actions" ref={moreMenuRef} style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={handleShare}><Share2 size={24} /></button>
            <button className="icon-btn" onClick={() => setShowMoreMenu(!showMoreMenu)}><MoreVertical size={24} /></button>

            {showMoreMenu && (
              <div style={{
                position: 'absolute', top: '40px', right: '0', background: '#E6E6D7', borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px', zIndex: 100, minWidth: '180px', border: '1px solid #ccc'
              }}>
                {((community.userRole || '').toUpperCase() === 'LEADER' || (community.userRole || '').toUpperCase() === 'MODERATOR') && (
                  <button
                    onClick={() => { setShowEditModal(true); setShowMoreMenu(false); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none',
                      fontSize: '14px', cursor: 'pointer', borderRadius: '8px', color: '#141414'
                    }}
                  >
                    Редактировать
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div>
          <h1>{community.name}</h1>
          <p className="sched-sub">{community.members} участников · {community.type === 'open' ? 'Открытое' : 'Частичное'}</p>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="tabs">
          <button className={`tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Ближайшие</button>
          <button className={`tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>Прошедшие</button>
        </div>

        <section className="events-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '18px', margin: 0 }}>Встречи</h2>
            {((community.userRole || '').toUpperCase() === 'LEADER' || (community.userRole || '').toUpperCase() === 'MODERATOR') && (
              <button
                onClick={() => onShowCreateModal(community)}
                style={{ background: '#141414', color: '#E6E6D7', border: 'none', padding: '10px 16px', borderRadius: '40px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Plus size={16} /> Создать
              </button>
            )}
          </div>
          {events.length === 0 ? (
            <div className="sched-empty">
              <div className="sched-empty-icon"></div>
              <p>{tab === 'upcoming' ? 'Нет предстоящих событий' : 'История встреч пуста'}</p>
            </div>
          ) : (
            events.map(ev => <EventCard key={ev.id} ev={ev} onRegister={onPay} />)
          )}
        </section>
      </div>

      {/* Модалка редактирования сообщества */}
      {showEditModal && (
        <BottomSheet title="Редактировать сообщество" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleUpdateCommunity} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: 13, color: '#888' }}>Название</label>
              <input
                required
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc', background: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: 13, color: '#888' }}>Описание</label>
              <textarea
                required
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                style={{ minHeight: '80px', borderRadius: '12px', padding: '12px', border: '1px solid #ccc', background: '#fff', width: '100%', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ccc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {editForm.avatar_url ? <img src={editForm.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={30} color="#888" />}
              </div>
              <label style={{ background: '#141414', color: '#fff', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', borderRadius: '40px' }}>
                {uploadingAvatar ? '...' : 'Выбрать файл'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </label>
            </div>

            <button type="submit" style={{ background: '#141414', color: '#fff', border: 'none', padding: '16px', borderRadius: '20px', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
              Сохранить изменения
            </button>
          </form>
        </BottomSheet>
      )}
    </div>
  );
};

/* ── MAIN PAGE ── */
const Dashboard = () => {
  const { showAlert } = useNotification();
  const [selected, setSelected] = useState(null);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', time: '', cost: '', spots: '', age: 'all', materials: '', location: '', media_urls: [] });
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [payEvent, setPayEvent] = useState(null);

  useEffect(() => {
    const phone = api.getUserPhone();
    if (!phone) return;

    Promise.all([
      api.getMeetings({ user_phone: phone }).catch(() => []),
      api.getUserCommunities().catch(() => [])
    ]).then(([meetings, comms]) => {
      const roleMap = {};
      comms.forEach(c => { roleMap[c.id] = c.user_role || 'MEMBER'; });
      const grouped = {};

      comms.forEach(c => {
        grouped[c.id] = {
          id: String(c.id),
          name: c.name || 'Сообщество',
          category: c.category || 'Общее',
          type: c.privacy_type === 'OPEN' ? 'open' : c.privacy_type === 'CLOSED' ? 'closed' : 'partial',
          members: c.members_count ?? 0,
          userRole: c.user_role || 'MEMBER',
          avatar_url: c.avatar_url || '',
          icon: '',
          nextEvent: null,
          upcoming: [],
          past: [],
        };
      });

      // Now map meetings in
      (meetings || []).forEach(m => {
        const cid = m.community_id;
        if (!grouped[cid]) {
          grouped[cid] = {
            id: String(cid),
            name: m.community_name || 'Сообщество',
            category: 'Общее',
            type: 'open',
            members: 0,
            userRole: roleMap[cid] || 'MEMBER',
            avatar_url: m.community_avatar_url || '',
            icon: '',
            nextEvent: null,
            upcoming: [],
            past: [],
          };
        }
        const ev = {
          id: m.id,
          title: m.title,
          type: 'Встреча',
          status: 'Подтверждено',
          time: new Date(m.date_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
          place: m.location_address || '',
          materials: m.materials || [],
          cost: m.cost ?? 0,
        };
        const isPast = new Date(m.date_time) < new Date();
        if (isPast) { ev.status = 'Посещено'; grouped[cid].past.push(ev); }
        else grouped[cid].upcoming.push(ev);
      });

      setJoinedCommunities(Object.values(grouped));
    });
  }, []);

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingMedia(true);
    try {
      const { urls } = await api.uploadMedia(files);
      setEventForm(f => ({ ...f, media_urls: [...f.media_urls, ...urls] }));
    } catch (err) { showAlert(err.message, 'Ошибка'); }
    finally { setUploadingMedia(false); }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setCreatingMeeting(true);

    try {
      const payload = {
        community_id: parseInt(selected.id),
        title: eventForm.title,
        description: eventForm.description,
        date_time: `${eventForm.date}T${eventForm.time}:00`,
        location_address: eventForm.location,
        cost: parseInt(eventForm.cost) || 0,
        age_group: eventForm.age === 'junior' ? 'До 18' : (eventForm.age === 'senior' ? '18+' : 'Все возрасты'),
        materials: eventForm.materials ? eventForm.materials.split(',').map(m => m.trim()) : [],
        media_urls: eventForm.media_urls
      };
      await api.createMeeting(parseInt(selected.id), payload);

      setIsMeetingModalOpen(false);
      setEventForm({ title: '', description: '', date: '', time: '', cost: '', spots: '', age: 'all', materials: '', location: '', media_urls: [] });
      showAlert("Встреча создана! Обновите страницу, чтобы увидеть её.", "Успех");
    } catch (err) {
      showAlert("Ошибка создания: " + err.message, "Ошибка");
    } finally {
      setCreatingMeeting(false);
    }
  };

  if (selected) {
    return (
      <>
        <CommunitySchedule 
          community={selected} 
          onBack={() => setSelected(null)} 
          onShowCreateModal={() => setIsMeetingModalOpen(true)} 
          onPay={setPayEvent}
        />

        {isMeetingModalOpen && (
          <BottomSheet title="Создать встречу" onClose={() => setIsMeetingModalOpen(false)}>
            <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="ap-group"><label style={{ fontSize: 13, color: '#888', marginBottom: 5, display: 'block' }}>Название мероприятия</label>
                <input required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Ужин с фанатами" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc', background: '#fff' }} /></div>

              <div className="ap-group">
                <label style={{ fontSize: 13, color: '#888', marginBottom: 5, display: 'block' }}>Описание</label>
                <textarea required value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Подробности..." style={{ width: '100%', minHeight: '80px', borderRadius: '12px', padding: '12px', border: '1px solid #ccc', background: '#fff', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="ap-group" style={{ flex: 1 }}><label style={{ fontSize: 13, color: '#888', marginBottom: 5, display: 'block' }}>Дата</label><input required type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc', background: '#fff' }} /></div>
                <div className="ap-group" style={{ flex: 1 }}><label style={{ fontSize: 13, color: '#888', marginBottom: 5, display: 'block' }}>Время</label><input required type="time" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc', background: '#fff' }} /></div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="ap-group" style={{ flex: 1 }}><label style={{ fontSize: 13, color: '#888', marginBottom: 5, display: 'block' }}>Стоимость (₸)</label><input type="number" value={eventForm.cost} onChange={e => setEventForm({ ...eventForm, cost: e.target.value })} placeholder="0" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc', background: '#fff' }} /></div>
                <div className="ap-group" style={{ flex: 1 }}><label style={{ fontSize: 13, color: '#888', marginBottom: 5, display: 'block' }}>Мест</label><input type="number" value={eventForm.spots} onChange={e => setEventForm({ ...eventForm, spots: e.target.value })} placeholder="20" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc', background: '#fff' }} /></div>
              </div>

              <div className="ap-group"><label style={{ fontSize: 13, color: '#888', marginBottom: 5, display: 'block' }}>Локация</label><input required value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} placeholder="Адрес..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc', background: '#fff' }} /></div>

              <div className="ap-group">
                <label style={{ fontSize: 13, color: '#888', marginBottom: 5, display: 'block' }}>Фото (по желанию)</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {eventForm.media_urls.map((url, i) => (
                    <img key={i} src={url} alt="event" style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                  ))}
                  <label style={{ width: 50, height: 50, borderRadius: 8, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {uploadingMedia ? "..." : <Plus size={20} color="#888" />}
                    <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleMediaUpload} />
                  </label>
                </div>
              </div>

              <button type="submit" style={{ background: '#141414', color: '#fff', border: 'none', padding: '16px', borderRadius: '20px', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
                Создать встречу
              </button>
            </form>
          </BottomSheet>
        )}
      </>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Расписание</h1>
        <p className="sched-sub-main">Мои сообщества и встречи</p>
      </header>

      <div className="dashboard-content">
        <div className="joined-list">
          {joinedCommunities.map(c => (
            <div key={c.id} className="joined-card" onClick={() => setSelected(c)}>
              {/* Стиль карточки как community-card-new */}
              <div className="card-tags">
                <div className="tag-category">{c.category}</div>
                <div className={`badge ${c.type === 'open' ? 'open' : 'partial'}`}>
                  {c.type === 'open'
                    ? <><Globe size={13} /> Открытое</>
                    : <><Users size={13} /> Частичное</>}
                </div>
              </div>
              <div className="card-main joined-main">
                <h3>{c.name}</h3>
                <div className="joined-meta">
                  <span><Users size={13} /> {c.members} участников</span>
                  {c.nextEvent && <span> {c.nextEvent}</span>}
                </div>
              </div>
              <div className="card-actions">
                <button className="join-btn-new" style={{ pointerEvents: 'none' }}>
                  Расписание <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {payEvent && <PaymentModal event={payEvent} onClose={() => setPayEvent(null)} />}
    </div>
  );
};

export default Dashboard;

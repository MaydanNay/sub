import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Share2, MoreVertical, Users, Trophy,
  Calendar, MapPin, CheckCircle2, Image, Lock, Globe, Clock, Plus,
  ChevronDown, Check, Trash2, ChevronRight
} from 'lucide-react';
import QRScanner from '../../components/QRScanner/QRScanner';
import { useNotification } from '../../context/NotificationContext';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import * as api from '../../api';
import './CommunityDetail.css';

const CATEGORIES_LIST = ['Художники', 'Чтение', 'Музыка', 'Аниме', 'Кулинария', 'Философия', 'Спорт'];
const ROLES_MAP = { LEADER: 'Владелец', MODERATOR: 'Админ', MEMBER: 'Участник' };

/* ════════════════════════════════
   CUSTOM DROPDOWN
   ════════════════════════════════ */
const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

const CommunityDetail = () => {
  const { showAlert, showConfirm } = useNotification();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [payEvent, setPayEvent] = useState(null);
  const [joined, setJoined] = useState(false);
  const [saving, setSaving] = useState(false);

  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [createMeetingModal, setCreateMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: '', description: '', date_time: '', location_address: '', cost: 0, spots: 15, materials: '' });

  // Default shape while loading
  const [community, setCommunity] = useState({
    name: '...', description: '', members: 0, rank: '-', icon: '', privacy: 'open', user_role: null, user_status: null
  });
  const [meetings, setMeetings] = useState([]);
  const [goals, setGoals] = useState([]);
  const [proofUrl, setProofUrl] = useState('');

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', category: '', privacy_type: 'OPEN', avatar_url: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [communityMembers, setCommunityMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Admin States
  const [mgmtTab, setMgmtTab] = useState('members');
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingProofs, setPendingProofs] = useState([]);
  const [venues, setVenues] = useState([]);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isRoleSheetOpen, setIsRoleSheetOpen] = useState(false);
  const [activeMember, setActiveMember] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', description: '', goal_type: 'WEEKLY', duration_days: 7, target_value: 1 });
  
  const [showGalleryItemModal, setShowGalleryItemModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [creatingGalleryItem, setCreatingGalleryItem] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ caption: '', files: [] });
  
  const [galleryItems, setGalleryItems] = useState([]);

  const combinedFeed = useMemo(() => {
    const items = [
      ...meetings.map(m => ({ type: 'meeting', date: new Date(m.date_time), item: m })),
      ...goals.map(g => ({ type: 'goal', date: new Date(g.created_at), item: g })),
      ...galleryItems.map(gi => ({ type: 'gallery', date: new Date(gi.created_at), item: gi }))
    ];
    return items.sort((a, b) => b.date - a.date);
  }, [meetings, goals, galleryItems]);

  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!id) return;

    // Check if the current user is a member
    api.getUserCommunities()
      .then(comms => {
        const isJoined = comms.some(c => c.id === parseInt(id));
        setJoined(isJoined);
      })
      .catch(() => setJoined(false));

    api.getCommunity(id)
      .then(data => {
        setCommunity({
          name: data.name,
          description: data.description || '',
          members: data.members_count ?? 0,
          rank: `#${data.id}`,
          icon: '',
          privacy: data.privacy_type === 'OPEN' ? 'open' : data.privacy_type === 'CLOSED' ? 'closed' : 'partial',
          user_role: data.user_role,
          user_status: data.user_status,
          id: data.id,
          avatar_url: data.avatar_url || ''
        });
        setEditForm({
          name: data.name,
          description: data.description || '',
          category: data.category || 'Общее',
          privacy_type: data.privacy_type || 'PARTIAL',
          avatar_url: data.avatar_url || ''
        });
      })
      .catch(err => console.error('Ошибка загрузки сообщества:', err));

    api.getMeetings({ community_id: id })
      .then(data => setMeetings(data || []))
      .catch(err => console.error('Ошибка загрузки встреч:', err));

    // For simplicity, we just fetch all goals of the community
    // In a real app, we'd also fetch user's progress for each goal
    api.getCommunityGoals(id)
      .then(data => setGoals(data || []))
      .catch(err => console.error('Ошибка загрузки целей:', err));

    api.getGallery(id)
      .then(data => setGalleryItems(data || []))
      .catch(err => console.error('Ошибка загрузки галереи:', err));

    api.getVenues()
      .then(data => setVenues(data || []))
      .catch(err => console.error('Ошибка загрузки площадок:', err));

    api.getCommunityMembers(id)
      .then(data => setCommunityMembers(data || []))
      .catch(err => console.error('Ошибка загрузки участников рейтингов:', err));
  }, [id]);


  useEffect(() => {
    if (!id || !community.user_role) return;
    const role = (community.user_role || '').toUpperCase();
    if (role === 'LEADER' || role === 'MODERATOR') {
      api.getCommunityStats(id)
        .then(setStats)
        .catch(err => console.error('Ошибка статистики:', err));

      api.getPendingProofs(id)
        .then(setPendingProofs)
        .catch(err => console.error('Ошибка пруфов:', err));

      if (mgmtTab === 'members') {
        api.getJoinRequests(id)
          .then(setPendingRequests)
          .catch(err => console.error('Ошибка заявок:', err));
      }
    }
  }, [id, community.user_role, mgmtTab]);

  const handleQRScan = async (data) => {
    const parts = data.split(':');
    if (parts.length < 3) return;
    const meetingId = parts[1];
    const userPhone = parts[2];

    try {
      await api.checkInParticipant(meetingId, userPhone);
      showAlert("Успешный чек-ин!", "Успех");
      setShowScanner(false);
      api.getCommunityStats(id).then(setStats);
    } catch (err) {
      showAlert("Ошибка чек-ина: " + err.message, "Ошибка");
    }
  };

  const handleApproveProof = async (proofId) => {
    try {
      await api.approveProof(proofId);
      setPendingProofs(prev => prev.filter(p => p.id !== proofId));
      showAlert("Достижение подтверждено!", "Успех");
    } catch (err) { showAlert(err.message, "Ошибка"); }
  };

  const handleRejectProof = async (proofId) => {
    try {
      await api.rejectProof(proofId);
      setPendingProofs(prev => prev.filter(p => p.id !== proofId));
      showAlert("Пруф отклонен", "Инфо");
    } catch (err) { showAlert(err.message, "Ошибка"); }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.approveMembership(requestId);
      setPendingRequests(prev => prev.filter(r => r.membership_id !== requestId));
      api.getCommunityMembers(id).then(setCommunityMembers);
      showAlert("Заявка одобрена!", "Успех");
    } catch (err) { showAlert(err.message, "Ошибка"); }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.rejectMembership(requestId);
      setPendingRequests(prev => prev.filter(r => r.membership_id !== requestId));
      showAlert("Заявка отклонена", "Инфо");
    } catch (err) { showAlert(err.message, "Ошибка"); }
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingMedia(true);
    try {
      const { urls } = await api.uploadMedia(files);
      setEventForm(f => ({ ...f, media_urls: [...f.media_urls, ...urls] }));
    } catch (err) { showAlert(err.message, "Ошибка"); }
    finally { setUploadingMedia(false); }
  };

  const handleJoin = () => {
    api.joinCommunity(id)
      .then((res) => {
        if (res.status === 'PENDING') {
          setCommunity(prev => ({ ...prev, user_status: 'PENDING' }));
          showAlert("Заявка на вступление отправлена!", "Успех");
        } else {
          setJoined(true);
          setCommunity(prev => ({ ...prev, user_status: 'APPROVED' }));
          showAlert("Вы вступили в сообщество!", "Успех");
        }
      })
      .catch((err) => showAlert(err.message, "Ошибка"));
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setCreatingMeeting(true);
    try {
      const payload = {
        community_id: parseInt(id),
        title: meetingForm.title,
        description: meetingForm.description || '',
        date_time: meetingForm.date_time,
        location_address: meetingForm.location_address,
        cost: meetingForm.cost,
        age_group: 'Все возрасты',
        materials: meetingForm.materials ? meetingForm.materials.split(',').map(m => m.trim()) : [],
        spots: meetingForm.spots
      };
      await api.createMeeting(payload);
      setCreateMeetingModal(false);
      // reload meetings
      const data = await api.getMeetings({ community_id: id });
      setMeetings(data || []);
      setMeetingForm({ title: '', description: '', date_time: '', location_address: '', cost: 0, spots: 15, materials: '' });
      showAlert('Встреча успешно создана!', 'Успех');
    } catch (err) {
      showAlert('Ошибка создания встречи: ' + err.message, 'Ошибка');
    } finally {
      setCreatingMeeting(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setCreatingGoal(true);
    try {
      await api.createGoal({
        ...goalForm,
        community_id: parseInt(id)
      });
      setShowGoalModal(false);
      showAlert('Цель успешно создана!', 'Успех');
      // Refresh goals
      const updatedGoals = await api.getCommunityGoals(id);
      setGoals(updatedGoals || []);
      setGoalForm({ title: '', description: '', goal_type: 'WEEKLY', duration_days: 7, target_value: 1 });
    } catch (err) {
      showAlert('Ошибка создания цели: ' + err.message, 'Ошибка');
    } finally {
      setCreatingGoal(false);
    }
  };

  const handleGalleryItemUpload = async (e) => {
    e.preventDefault();
    if (galleryForm.files.length === 0) {
      showAlert('Выберите хотя бы одно фото', 'Ошибка');
      return;
    }
    setCreatingGalleryItem(true);
    try {
      const { urls } = await api.uploadMedia(galleryForm.files);
      await api.addGalleryItem(id, {
        community_id: parseInt(id),
        caption: galleryForm.caption,
        image_urls: urls
      });
      showAlert('Запись добавлена в галерею!', 'Успех');
      setShowGalleryItemModal(false);
      setGalleryForm({ caption: '', files: [] });
      const items = await api.getGallery(id);
      setGalleryItems(items || []);
    } catch (err) {
      showAlert('Ошибка загрузки: ' + err.message, 'Ошибка');
    } finally {
      setCreatingGalleryItem(false);
    }
  };

  const handleFileChange = async (e, goalId) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSaving(true);
    try {
      const { urls } = await api.uploadMedia(files);
      await api.registerGoalProgress(goalId, { proof_urls: urls })
        .then(() => showAlert('Доказательство отправлено!', 'Успех'))
        .catch((err) => showAlert('Ошибка при отправке: ' + err.message, 'Ошибка'));
    } catch (err) {
      showAlert("Ошибка загрузки: " + err.message, "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!(await showConfirm("Вы уверены, что хотите навсегда удалить это сообщество? Это действие невозможно отменить.", "Удаление"))) return;
    try {
      await api.deleteCommunity(id);
      showAlert("Сообщество удалено", "Успех");
      navigate('/communities');
    } catch (err) {
      showAlert("Ошибка удаления: " + err.message, "Ошибка");
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/community/${id}`;
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

  const handleAvatarUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingAvatar(true);
    try {
      const { urls } = await api.uploadMedia(files);
      setEditForm(f => ({ ...f, avatar_url: urls[0] }));
    } catch (err) {
      showAlert("Ошибка загрузки: " + err.message, "Ошибка");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateCommunity = async (e) => {
    e.preventDefault();
    try {
      await api.updateCommunity(id, editForm);
      setShowEditModal(false);
      showAlert("Сообщество обновлено!", "Успех");
      window.location.reload();
    } catch (err) {
      showAlert("Ошибка обновления: " + err.message, "Ошибка");
    }
  };

  const handleShowMembers = async () => {
    setShowMembersModal(true);
    setLoadingMembers(true);
    try {
      const data = await api.getCommunityMembers(id);
      setCommunityMembers(data || []);
    } catch (err) {
      showAlert("Ошибка загрузки участников: " + err.message, "Ошибка");
      setShowMembersModal(false);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSubmitProof = async (goalId) => {
    if (!proofUrl) return showAlert("Введите ссылку на подтверждение", "Внимание");
    try {
      await api.registerGoalProgress(goalId, { increment: 1, proof_urls: [proofUrl] });
      showAlert("Пруф отправлен на проверку!", "Успех");
      setProofUrl('');
    } catch (err) { showAlert(err.message, "Ошибка"); }
  };

  // Map backend meetings to local shape for the calendar tab
  const EVENTS = meetings.map(m => ({
    id: m.id,
    title: m.title,
    date: new Date(m.date_time).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    location: m.location_address || '',
    cost: m.cost ?? 0,
    spots: m.spots ?? 0,
    filled: m.filled ?? 0,
    age: 'Все возрасты',
  }));


  const baseTabs = [
    { key: 'info', label: 'Лента' },
    { key: 'calendar', label: 'Встречи' },
    { key: 'goals', label: 'Цели' },
    { key: 'rating', label: 'Рейтинг' },
    { key: 'gallery', label: 'Галерея' }
  ];

  const canManage = (community.user_role || '').toUpperCase() === 'LEADER' || (community.user_role || '').toUpperCase() === 'MODERATOR';
  const TABS = canManage ? [...baseTabs, { key: 'manage', label: 'Админка' }] : baseTabs;

  const MGMT_TABS = [
    { key: 'members', label: 'Участники' },
    { key: 'moderation', label: 'Модерация' }
  ];

  return (
    <div className="community-detail">
      <header className="detail-header">
        <div className="header-nav">
          <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
          <div className="header-actions" ref={moreMenuRef} style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => setShowMoreMenu(!showMoreMenu)}><MoreVertical size={24} /></button>

            {showMoreMenu && (
              <div style={{
                position: 'absolute', top: '40px', right: '0', background: '#E6E6D7', borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px', zIndex: 100, minWidth: '180px', border: '1px solid #ccc'
              }}>
                {((community.user_role || '').toUpperCase() === 'LEADER' || (community.user_role || '').toUpperCase() === 'MODERATOR') && (
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
                {((community.user_role || '').toUpperCase() === 'LEADER') && (
                  <button
                    onClick={handleDeleteCommunity}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none',
                      fontSize: '14px', cursor: 'pointer', borderRadius: '8px', color: '#ff4d4f'
                    }}
                  >
                    Удалить сообщество
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="community-main-info">
          <div className="main-info-card">
            <div className="community-avatar">
              {community.avatar_url ? (
                <img src={community.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={40} color="#888" />
                </div>
              )}
            </div>
            <div className="community-text">
              <h1>{community.name}</h1>
              <p>{community.description}</p>
              <div className="community-stats">
                <span onClick={handleShowMembers}><Users size={16} /> {community.members} участников</span>
                <span>{community.privacy === 'open' ? <><Globe size={14} /> Открытое</> : <><Lock size={14} /> Закрытое</>}</span>
              </div>
            </div>
            <div className="main-actions">
              {!joined ? (
                community.user_status === 'PENDING' ? (
                  <button className="btn-primary" style={{ background: '#ccc', color: '#666', cursor: 'default' }} disabled>Заявка отправлена</button>
                ) : (
                  <button className="btn-primary" onClick={handleJoin}>
                    {community.privacy === 'open' ? 'Вступить' : 'Подать заявку'}
                  </button>
                )
              ) : (
                <button className="btn-primary" style={{ background: '#C6C6BE' }}>Вы участник ✓</button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Вкладки */}
      <div className="detail-tabs">
        {TABS.map(t => (
          <button key={t.key} className={`detail-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="detail-content">
        {/* === ЛЕНТА (ОБЩЕЕ) === */}
        {activeTab === 'info' && (
          <section className="detail-section">
            <h2 style={{ marginBottom: 15 }}>Лента активностей</h2>
            <p style={{ color: '#666', marginBottom: 25, fontSize: 14 }}>{community.description || 'Общий поток событий и обновлений сообщества.'}</p>

            {(community.privacy === 'open' || joined || community.user_role === 'LEADER' || community.user_role === 'MODERATOR') ? (
              <div className="combined-feed" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {combinedFeed.length === 0 ? (
                  <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Здесь пока пусто. Скоро здесь появятся новости!</p>
                ) : (
                  combinedFeed.map((entry, idx) => {
                    if (entry.type === 'meeting') {
                      const m = entry.item;
                      return (
                        <div key={`m-${m.id}`} className="next-meeting-card">
                          <div className="meeting-header">
                            <h3 style={{ fontSize: 20, fontWeight: 800 }}>{m.title}</h3>
                            <span className="badge-free">{m.cost > 0 ? `${m.cost} ₸` : 'Бесплатно'}</span>
                          </div>
                          <div className="meeting-meta">
                            <div className="meta-row"><Calendar size={18} /> {new Date(m.date_time).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })} · {new Date(m.date_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="meta-row"><MapPin size={18} /> {m.location_address}</div>
                            <div className="meta-row"><Users size={18} /> {m.filled || 0}/{m.spots} записано</div>
                          </div>
                          
                          {m.materials && m.materials.length > 0 && (
                            <div className="bring-list">
                              <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 15 }}>Что принести:</p>
                              <div className="tags" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {m.materials.map((item, i) => (
                                  <span key={i} className="tag-item">{item}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <button 
                            className="join-meeting-btn" 
                            style={{ width: '100%', marginTop: 5 }}
                            onClick={() => setPayEvent(m)}
                          >
                            Записаться на встречу
                          </button>
                        </div>
                      );
                    }
                    if (entry.type === 'goal') {
                      const g = entry.item;
                      return (
                        <div key={`g-${g.id}`} className="feed-item-card" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 15, border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontSize: 10, padding: '4px 8px', borderRadius: 8, background: '#141414', color: '#fff', textTransform: 'uppercase', fontWeight: 'bold' }}>Новая цель</span>
                            <span style={{ fontSize: 11, color: '#555' }}>{new Date(g.created_at).toLocaleDateString('ru-RU')}</span>
                          </div>
                          <h3 style={{ marginBottom: 6, fontSize: 16 }}>{g.title}</h3>
                          <p style={{ fontSize: 14, color: '#666', lineHeight: '1.4' }}>{g.description}</p>
                          <div style={{ marginTop: 10, fontSize: 11, fontWeight: '600', color: '#141414' }}>
                            {g.goal_type === 'WEEKLY' ? 'Еженедельное достижение' : 'Ежемесячное достижение'}
                          </div>
                        </div>
                      );
                    }
                    if (entry.type === 'gallery') {
                      const gi = entry.item;
                      return (
                        <div key={`gi-${gi.id}`} className="feed-item-card" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 15, border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontSize: 10, padding: '4px 8px', borderRadius: 8, background: '#141414', color: '#fff', textTransform: 'uppercase', fontWeight: 'bold' }}>Обновление галереи</span>
                            <span style={{ fontSize: 11, color: '#555' }}>{new Date(gi.created_at).toLocaleDateString('ru-RU')}</span>
                          </div>
                          {gi.caption && <p style={{ fontSize: 14, marginBottom: 12, lineHeight: '1.4' }}>{gi.caption}</p>}
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: gi.image_urls.length === 1 ? '1fr' : 'repeat(2, 1fr)', 
                            gap: 6 
                          }}>
                            {gi.image_urls.map((url, i) => (
                              <div key={i} style={{ 
                                aspectRatio: gi.image_urls.length === 1 ? '16/9' : '1/1', 
                                borderRadius: 12, 
                                overflow: 'hidden', 
                                background: '#333' 
                              }}>
                                <img src={url} alt="gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })
                )}
              </div>
            ) : (
              <div style={{ marginTop: 30, padding: 30, borderRadius: 20, textAlign: 'center' }}>
                <Lock size={32} color="#888" style={{ marginBottom: 10 }} />
                <p style={{ color: '#888', fontSize: 14 }}>Общий поток событий доступен только участникам.</p>
              </div>
            )}
          </section>
        )}

        {/* === ВСТРЕЧИ === */}
        {activeTab === 'calendar' && (
          <section className="detail-section">
            {(community.privacy === 'open' || joined || community.user_role === 'LEADER' || community.user_role === 'MODERATOR') ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <h2>Расписание встреч</h2>
                  {(community.user_role === 'LEADER' || community.user_role === 'MODERATOR') && (
                    <button
                      onClick={() => setCreateMeetingModal(true)}
                      style={{ background: '#141414', color: '#E6E6D7', border: 'none', padding: '10px 16px', borderRadius: '40px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <Plus size={16} /> Создать
                    </button>
                  )}
                </div>
                <div className="events-calendar">
                  {EVENTS.map(ev => (
                    <div key={ev.id} className="cal-event-card">
                      <div className="cal-header">
                        <div style={{ flex: 1 }}>
                          <div className="cal-title">{ev.title}</div>
                          <div className="cal-meta"><Calendar size={14} /> {ev.date}</div>
                          <div className="cal-meta"><MapPin size={14} /> {ev.location}</div>
                          <div className={`cal-age ${ev.age && ev.age.toLowerCase().includes('senior') ? 'senior' : 'all'}`}>
                            👥 {ev.age || 'Все возрасты'}
                          </div>
                        </div>
                        <div className="cal-right">
                          <div className="cal-spots">{ev.filled}/{ev.spots} мест</div>
                          <div className="cal-cost">{ev.cost > 0 ? `${ev.cost} ₸` : 'Бесплатно'}</div>
                        </div>
                      </div>
                      <button className="join-meeting-btn" onClick={() => setPayEvent(ev)}>
                        {ev.cost > 0 ? `Купить билет (${ev.cost} ₸)` : 'Записаться'}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: 50, textAlign: 'center' }}>
                <Lock size={48} color="#888" style={{ marginBottom: 15 }} />
                <h3>Это закрытое сообщество</h3>
                <p style={{ color: '#888' }}>Подайте заявку на вступление, чтобы увидеть расписание встреч.</p>
              </div>
            )}
          </section>
        )}

        {/* === ЦЕЛИ === */}
        {activeTab === 'goals' && (
          <section className="detail-section">
            {(community.privacy === 'open' || joined || community.user_role === 'LEADER' || community.user_role === 'MODERATOR') ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0 }}>Цели и челленджи</h2>
                  {(community.user_role === 'LEADER' || community.user_role === 'MODERATOR') && (
                    <button
                      onClick={() => setShowGoalModal(true)}
                      style={{ background: '#141414', color: '#E6E6D7', border: 'none', padding: '10px 16px', borderRadius: '40px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <Plus size={16} /> Создать
                    </button>
                  )}
                </div>
                <div className="goals-list">
                  {goals.length === 0 ? (
                    <p style={{ color: '#888', padding: '0 15px' }}>В этом сообществе пока нет активных целей.</p>
                  ) : (
                    goals.map(g => {
                      const progressPercent = Math.min(100, Math.round(((g.current_value || 0) / (g.target_value || 1)) * 100));
                      return (
                        <div key={g.id} className="goal-card">
                          <div className="goal-header">
                            <span className="goal-label-pill">
                              {g.goal_type === 'WEEKLY' ? 'Цель недели' : 'Челлендж месяца'}
                            </span>
                            <div className="goal-percent">{progressPercent}%</div>
                          </div>
                          <h4>{g.title}</h4>
                          <p>{g.current_value || 0}/{g.target_value || 1} {g.goal_type === 'WEEKLY' ? 'участников' : 'выполнено'}</p>
                          <div className="goal-progress">
                            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                          </div>
                          
                          {joined && (
                            <button className="mark-btn" onClick={() => {
                              setSelectedGoal(g);
                              // Logic to show proof input or just mark
                            }}>
                              <CheckCircle2 size={18} /> Отметить выполнение
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div style={{ padding: 50, textAlign: 'center' }}>
                <Lock size={48} color="#888" style={{ marginBottom: 15 }} />
                <h3>Контент скрыт</h3>
                <p style={{ color: '#888' }}>Цели и достижения доступны только участникам клуба.</p>
              </div>
            )}
          </section>
        )}

        {/* === РЕЙТИНГ === */}
        {activeTab === 'rating' && (
          <section className="detail-section">
            <h2 style={{ padding: '0 15px' }}>Рейтинг участников</h2>
            <div className="rating-list">
              {(() => {
                let currentRank = 1;
                return communityMembers.map((member, i) => {
                  if (i > 0 && (member.points || 0) < (communityMembers[i - 1].points || 0)) {
                    currentRank = i + 1;
                  }
                  
                  const currentUser = api.getUser() || {};
                  const isMe = member.id === currentUser.id;
                  const rank = currentRank;
                  
                  let color = '#8a8a8a';
                  if ((member.points || 0) > 0) {
                    if (rank === 1) color = '#f1d821';
                    else if (rank === 2) color = '#c0c0c0';
                    else if (rank === 3) color = '#cd7f32';
                  }

                  return (
                    <div key={member.id} className={`rating-item ${isMe ? 'is-me' : ''}`}>
                      <div className="user-rank" style={{ backgroundColor: color }}>
                        {rank}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{member.name || 'Аноним'}</div>
                        <div className="user-points">{member.points || 0} очков</div>
                      </div>
                      {isMe && <CheckCircle2 size={18} className="me-check" />}
                    </div>
                  );
                });
              })()}
              {communityMembers.length === 0 && <p style={{color: '#888', padding: '0 15px'}}>Пока нет участников</p>}

            </div>

          </section>
        )}
        {activeTab === 'gallery' && (
          <section className="detail-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Галерея</h2>
              {canManage && (
                <button 
                  onClick={() => setShowGalleryItemModal(true)}
                  style={{ background: '#141414', color: '#E6E6D7', border: 'none', padding: '10px 16px', borderRadius: '40px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <Plus size={16} /> Добавить
                </button>
              )}
            </div>

            {(community.privacy === 'open' || joined || community.user_role === 'LEADER' || community.user_role === 'MODERATOR') ? (
              !selectedAlbum ? (
                <div className="media-grid">
                  {galleryItems.length === 0 ? (
                    <p style={{ color: '#888'}}>В галерее пока нет альбомов.</p>
                  ) : (
                    galleryItems.map(item => (
                      <div key={item.id} className="media-album" onClick={() => setSelectedAlbum(item)}>
                        <div className="media-title">{item.caption || 'Без названия'}</div>
                        <div className="media-count"><Image size={12}/> {item.image_urls?.length || 0} фото</div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="gallery-feed" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <button onClick={() => setSelectedAlbum(null)} style={{ background: 'transparent', border: 'none', color: '#141414', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', cursor: 'pointer', padding: 0, width: 'fit-content' }}>
                    <ArrowLeft size={16} /> Назад к альбомам
                  </button>
                  <div className="gallery-post" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 15 }}>
                    {selectedAlbum.caption && <h3 style={{ marginBottom: 15 }}>{selectedAlbum.caption}</h3>}
                    <div className="gallery-post-grid" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: selectedAlbum.image_urls.length === 1 ? '1fr' : 'repeat(2, 1fr)', 
                      gap: 8 
                    }}>
                      {selectedAlbum.image_urls.map((url, idx) => (
                        <div key={idx} style={{ 
                          aspectRatio: selectedAlbum.image_urls.length === 1 ? '16/9' : '1/1', 
                          borderRadius: 12, 
                          overflow: 'hidden', 
                          background: '#333' 
                        }}>
                          <img src={url} alt="gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: '#555' }}>
                      {new Date(selectedAlbum.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div style={{ padding: 50, textAlign: 'center' }}>
                <Lock size={48} color="#888" style={{ marginBottom: 15 }} />
                <h3>Доступ ограничен</h3>
                <p style={{ color: '#888' }}>Галерея доступна только участникам клуба.</p>
              </div>
            )}
          </section>
        )}

        {/* === АДМИН-ПАНЕЛЬ === */}
        {activeTab === 'manage' && canManage && (
          <section className="detail-section">
            <h2 style={{ padding: '0 15px' }}>Панель управления</h2>

            {stats && (
              <div className="admin-stats-grid" style={{ margin: '10px 15px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="astat-card" style={{ background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '20px', textAlign: 'center' }}>
                  <div className="astat-val" style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.active_members_count}</div>
                  <div className="astat-label" style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Участников</div>
                </div>
                <div className="astat-card" style={{ background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '20px', textAlign: 'center' }}>
                  <div className="astat-val" style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.total_attended}</div>
                  <div className="astat-label" style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Посещений</div>
                </div>
                <div className="astat-card" style={{ background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '20px', textAlign: 'center' }}>
                  <div className="astat-val" style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.total_revenue?.toLocaleString()} ₸</div>
                  <div className="astat-label" style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Выручка (90%)</div>
                </div>
              </div>
            )}

            <div className="admin-tabs" style={{ display: 'flex', gap: '8px', padding: '0 15px', marginBottom: '15px' }}>
              {MGMT_TABS.map(t => (
                <button
                  key={t.key}
                  className={`admin-tab ${mgmtTab === t.key ? 'active' : ''}`}
                  onClick={() => setMgmtTab(t.key)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: 'none',
                    background: mgmtTab === t.key ? '#141414' : 'rgba(20,20,20,0.05)',
                    color: mgmtTab === t.key ? '#fff' : '#141414',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Участники */}
            {mgmtTab === 'members' && (
              <div className="tab-section" style={{ padding: '0 15px' }}>
                {pendingRequests.length > 0 && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: 16, marginBottom: 10 }}>Заявки ({pendingRequests.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {pendingRequests.map(r => (
                        <div key={r.membership_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(119, 188, 121, 0.1)', borderRadius: '15px', border: '1px solid #77BC79' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '20px', background: '#77BC79', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{r.name[0]}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>{r.name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{r.phone}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => handleApproveRequest(r.membership_id)} style={{ padding: '6px 12px', borderRadius: '10px', border: 'none', background: '#77BC79', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>Ок</button>
                            <button onClick={() => handleRejectRequest(r.membership_id)} style={{ padding: '6px 12px', borderRadius: '10px', border: 'none', background: '#ff4d4f', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>Х</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 style={{ fontSize: 16, marginBottom: 10 }}>Участники ({communityMembers.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {communityMembers.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.3)', borderRadius: '15px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '20px', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{m.name?.[0] || '?'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{m.name || 'Аноним'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{m.phone}</div>
                      </div>
                      <div
                        onClick={() => { if (m.role !== 'LEADER') { setActiveMember(m); setIsRoleSheetOpen(true); } }}
                        style={{ padding: '4px 10px', borderRadius: '10px', background: '#141414', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        {ROLES_MAP[m.role]}
                        {m.role !== 'LEADER' && <ChevronDown size={12} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Модерация достижений */}
            {mgmtTab === 'moderation' && (
              <div className="tab-section" style={{ padding: '0 15px' }}>
                <h3 style={{ fontSize: 16, marginBottom: 15 }}>Ожидают проверки: {pendingProofs.length}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {pendingProofs.map(p => (
                    <div key={p.id} style={{ background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>Юзер #{p.user_id}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>Цель #{p.goal_id}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleApproveProof(p.id)} style={{ padding: '6px 12px', borderRadius: '10px', border: 'none', background: '#77BC79', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>Одобрить</button>
                          <button onClick={() => handleRejectProof(p.id)} style={{ padding: '6px 12px', borderRadius: '10px', border: 'none', background: '#ff4d4f', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>Отклонить</button>
                        </div>
                      </div>
                      {p.proof_urls?.length > 0 && (
                        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto' }}>
                          {p.proof_urls.map((url, i) => (
                            <img key={i} src={url} alt="proof" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {pendingProofs.length === 0 && <p style={{ color: '#888', textAlign: 'center' }}>Нет заявок на проверку</p>}
                </div>
              </div>
            )}

            {/* Управление целями */}
            {mgmtTab === 'goals' && (
              <div className="tab-section" style={{ padding: '0 15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, margin: 0 }}>Достижения сообщества</h3>
                  <button
                    onClick={() => setShowGoalModal(true)}
                    style={{ background: '#141414', color: '#E6E6D7', border: 'none', padding: '8px 16px', borderRadius: '40px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    <Plus size={16} /> Создать
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {goals.map(g => (
                    <div key={g.id} style={{ background: 'rgba(255,255,255,0.4)', padding: '15px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{g.title}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{g.goal_type === 'WEEKLY' ? 'Еженедельно' : 'Ежемесячно'} • {g.duration_days} дн.</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#77BC79' }}>x{g.target_value || 1}</div>
                    </div>
                  ))}
                  {goals.length === 0 && <p style={{ color: '#888', textAlign: 'center' }}>Цели еще не созданы</p>}
                </div>
              </div>
            )}
          </section>
        )}

      </div>

      {payEvent && <PaymentModal event={payEvent} onClose={() => setPayEvent(null)} />}

      {createMeetingModal && (
        <div className="ap-overlay" onClick={() => setCreateMeetingModal(false)}>
          <div className="ap-sheet" onClick={e => e.stopPropagation()}>
            <div className="ap-sheet-handle"></div>
            <h3 className="ap-sheet-title">Создать встречу</h3>
            <form className="sheet-form" onSubmit={handleCreateMeeting}>
              <div className="ap-group">
                <label>Название</label>
                <input required value={meetingForm.title} onChange={e => setMeetingForm({ ...meetingForm, title: e.target.value })} placeholder="Мастер-класс..." />
              </div>
              <div className="ap-group">
                <label>Дата и время</label>
                <input required type="datetime-local" value={meetingForm.date_time} onChange={e => setMeetingForm({ ...meetingForm, date_time: e.target.value })} />
              </div>
              <div className="ap-group">
                <label>Локация</label>
                <input required value={meetingForm.location_address} onChange={e => setMeetingForm({ ...meetingForm, location_address: e.target.value })} placeholder="Адрес..." />
              </div>
              <div className="ap-group">
                <label>Стоимость (₸)</label>
                <input type="number" required value={meetingForm.cost} onChange={e => setMeetingForm({ ...meetingForm, cost: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="ap-group">
                <label>Кол-во мест</label>
                <input type="number" required value={meetingForm.spots} onChange={e => setMeetingForm({ ...meetingForm, spots: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="ap-group">
                <label>Что принести? (через запятую)</label>
                <input value={meetingForm.materials} onChange={e => setMeetingForm({ ...meetingForm, materials: e.target.value })} placeholder="Акварель, кисти, бумага..." />
              </div>
              <div className="ap-footer">
                <button type="button" className="ap-btn-cancel" onClick={() => setCreateMeetingModal(false)}>Отмена</button>
                <button type="submit" className="ap-btn-ok" disabled={creatingMeeting}>
                  {creatingMeeting ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Модалка участников */}
      {showMembersModal && (
        <div className="ap-overlay" onClick={() => setShowMembersModal(false)} style={{ zIndex: 1100, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div className="ap-sheet" onClick={e => e.stopPropagation()} style={{ background: '#E6E6D7', width: '100%', borderRadius: '30px 30px 0 0', padding: '20px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="ap-sheet-handle" style={{ width: 40, height: 4, background: '#ccc', borderRadius: 2, margin: '0 auto 15px' }}></div>
            <h3 style={{ fontSize: 20, marginBottom: 20, color: '#141414' }}>Участники сообщества</h3>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loadingMembers ? (
                <p style={{ textAlign: 'center', padding: 20, color: '#888' }}>Загрузка...</p>
              ) : communityMembers.length === 0 ? (
                <p style={{ textAlign: 'center', padding: 20, color: '#888' }}>Нет участников</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {communityMembers.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.3)', borderRadius: '15px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#77BC79', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#141414' }}>
                        {m.name ? m.name[0].toUpperCase() : m.username ? m.username[0].toUpperCase() : '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#141414', fontSize: '15px' }}>{m.name || m.username || 'Аноним'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {m.role === 'LEADER' ? 'Лидер' : m.role === 'MODERATOR' ? 'Модератор' : 'Участник'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowMembersModal(false)}
              style={{ marginTop: '20px', background: '#141414', color: '#fff', border: 'none', padding: '15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
      {/* QR Scanner */}
      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}

      {/* Role Change Sheet */}
      {isRoleSheetOpen && activeMember && (
        <BottomSheet title="Сменить роль" onClose={() => setIsRoleSheetOpen(false)}>
          <div className="ap-role-list" style={{ padding: '0 20px 20px' }}>
            {Object.entries(ROLES_MAP).map(([roleVal, roleLabel]) => {
              if (roleVal === 'LEADER') return null;
              return (
                <div
                  key={roleVal}
                  className={`ap-role-option ${activeMember.role === roleVal ? 'active' : ''}`}
                  onClick={() => {
                    setCommunityMembers(prev => prev.map(m => m.id === activeMember.id ? { ...m, role: roleVal } : m));
                    setIsRoleSheetOpen(false);
                  }}
                  style={{
                    padding: '15px', borderRadius: '15px', marginBottom: '8px',
                    background: activeMember.role === roleVal ? 'rgba(119, 188, 121, 0.2)' : 'rgba(255,255,255,0.3)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{roleLabel}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {roleVal === 'MODERATOR' ? 'Может управлять встречами и участниками' : 'Участие во встречах и просмотр контента'}
                    </div>
                  </div>
                  {activeMember.role === roleVal && <Check size={18} color="#77BC79" />}
                </div>
              );
            })}
          </div>
        </BottomSheet>
      )}
      {/* Edit Community Modal */}
      {showEditModal && (
        <BottomSheet title="Редактировать сообщество" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleUpdateCommunity} className="sheet-form" style={{ padding: '0 20px 20px' }}>
            <div className="ap-group" style={{ marginBottom: 15 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Название</label>
              <input required style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd' }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="ap-group" style={{ marginBottom: 15 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Описание</label>
              <textarea required style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd', resize: 'none' }} rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="ap-group" style={{ marginBottom: 15 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Категория</label>
              <CustomSelect value={editForm.category} onChange={v => setEditForm({ ...editForm, category: v })} options={CATEGORIES_LIST} />
            </div>
            <div className="ap-group" style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8 }}>Тип сообщества</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setEditForm({ ...editForm, privacy_type: 'OPEN' })} style={{ flex: 1, padding: '10px', borderRadius: '40px', border: '1px solid #141414', background: editForm.privacy_type === 'OPEN' ? '#141414' : 'transparent', color: editForm.privacy_type === 'OPEN' ? '#fff' : '#141414', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Открытая</button>
                <button type="button" onClick={() => setEditForm({ ...editForm, privacy_type: 'PARTIAL' })} style={{ flex: 1, padding: '10px', borderRadius: '40px', border: '1px solid #141414', background: editForm.privacy_type === 'PARTIAL' ? '#141414' : 'transparent', color: editForm.privacy_type === 'PARTIAL' ? '#fff' : '#141414', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Закрытая</button>
              </div>
            </div>
            <div className="ap-group" style={{ marginBottom: 25 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Аватарка</label>
              <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ccc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editForm.avatar_url ? <img src={editForm.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={30} color="#888" />}
                </div>
                <label className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', borderColor: '#141414', color: '#141414' }}>
                  {uploadingAvatar ? '...' : 'Выбрать файл'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Сохранить</button>
          </form>
        </BottomSheet>
      )}
      {/* Gallery Create Modal */}
      {showGalleryItemModal && (
        <BottomSheet title="Добавить в галерею" onClose={() => setShowGalleryItemModal(false)}>
          <form onSubmit={handleGalleryItemUpload} className="sheet-form">
            <div className="ap-group" style={{ marginBottom: 15 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Название альбома/папки (Например: Зимний пленэр)</label>
              <textarea 
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd', resize: 'none' }} 
                rows={2} 
                value={galleryForm.caption} 
                onChange={e => setGalleryForm({ ...galleryForm, caption: e.target.value })} 
                placeholder="Как назовем папку?..."
              />
            </div>
            
            <div className="ap-group" style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Фотографии</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {Array.from(galleryForm.files).map((f, i) => (
                  <div key={i} style={{ width: 60, height: 60, borderRadius: 8, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, position: 'relative', overflow: 'hidden' }}>
                    <img src={URL.createObjectURL(f)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
                <label style={{ width: 60, height: 60, borderRadius: 8, border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', cursor: 'pointer' }}>
                  <Plus size={20} />
                  <input 
                    type="file" 
                    multiple 
                    hidden 
                    accept="image/*" 
                    onChange={e => setGalleryForm({ ...galleryForm, files: [...galleryForm.files, ...Array.from(e.target.files)] })} 
                  />
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%' }}
              disabled={creatingGalleryItem}
            >
              {creatingGalleryItem ? 'Загрузка...' : 'Опубликовать'}
            </button>
          </form>
        </BottomSheet>
      )}

      {/* Goal Create Modal */}
      {showGoalModal && (
        <BottomSheet title="Создать новую цель" onClose={() => setShowGoalModal(false)}>
          <form onSubmit={handleCreateGoal} className="sheet-form">
            <div className="ap-group" style={{ marginBottom: 15 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Название цели</label>
              <input
                required
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd' }}
                value={goalForm.title}
                onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
                placeholder="Например: Прочитать 5 книг"
              />
            </div>
            <div className="ap-group" style={{ marginBottom: 15 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Описание</label>
              <textarea
                required
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd', resize: 'none' }}
                rows={3}
                value={goalForm.description}
                onChange={e => setGoalForm({ ...goalForm, description: e.target.value })}
                placeholder="Что именно нужно сделать..."
              />
            </div>

            <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
              <div className="ap-group" style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Тип</label>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button
                    type="button"
                    onClick={() => setGoalForm({ ...goalForm, goal_type: 'WEEKLY', duration_days: 7 })}
                    style={{ flex: 1, padding: '8px 5px', borderRadius: 10, fontSize: 11, border: '1px solid #141414', background: goalForm.goal_type === 'WEEKLY' ? '#141414' : 'transparent', color: goalForm.goal_type === 'WEEKLY' ? '#fff' : '#141414' }}
                  >
                    Неделя
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalForm({ ...goalForm, goal_type: 'MONTHLY', duration_days: 30 })}
                    style={{ flex: 1, padding: '8px 5px', borderRadius: 10, fontSize: 11, border: '1px solid #141414', background: goalForm.goal_type === 'MONTHLY' ? '#141414' : 'transparent', color: goalForm.goal_type === 'MONTHLY' ? '#fff' : '#141414' }}
                  >
                    Месяц
                  </button>
                </div>
              </div>
              <div className="ap-group" style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Цель (раз)</label>
                <input
                  type="number"
                  required
                  style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd' }}
                  value={goalForm.target_value}
                  onChange={e => setGoalForm({ ...goalForm, target_value: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: 10 }}
              disabled={creatingGoal}
            >
              {creatingGoal ? 'Создание...' : 'Создать цель'}
            </button>
          </form>
        </BottomSheet>
      )}
    </div>
  );
};

export default CommunityDetail;

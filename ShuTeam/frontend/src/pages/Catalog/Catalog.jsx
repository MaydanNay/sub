import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Users, ChevronRight, Globe, Plus } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import CommunityCard from '../../components/CommunityCard/CommunityCard';
import * as api from '../../api';
import './Catalog.css';

// No fallback communities needed as they load from API


const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  if (d.toDateString() === now.toDateString()) return `Сегодня · ${timeStr}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Завтра · ${timeStr}`;

  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).replace(',', ' ·');
};

const CATEGORIES = [
  { id: 1, name: 'Чтение' },
  { id: 2, name: 'Аниме' },
  { id: 3, name: 'Художники' },
  { id: 4, name: 'Психология' },
  { id: 5, name: 'Философия' },
  { id: 6, name: 'Кулинария' },
  { id: 7, name: 'Музыка' },
  { id: 8, name: 'Спорт' },
  { id: 9, name: 'Путешествия' },
  { id: 10, name: 'Программирование' },
  { id: 11, name: 'Кино' },
  { id: 12, name: 'Йога' },
];

const Catalog = () => {
  const { showAlert } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCommunities, setActiveCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [tempSelected, setTempSelected] = useState([]);
  const [selectedChips, setSelectedChips] = useState(() => {
    try {
      const saved = localStorage.getItem('shuteam_selected_chips');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeFilters, setActiveFilters] = useState(() => {
    try {
      const saved = localStorage.getItem('shuteam_active_filters');
      return saved ? JSON.parse(saved) : ['Все', 'Мои сообщества'];
    } catch { return ['Все', 'Мои сообщества']; }
  });
  const [joinedIds, setJoinedIds] = useState([]);
  const [userJoinedDocs, setUserJoinedDocs] = useState([]);
  const [joinedCategories, setJoinedCategories] = useState([]);
  const [mainTab, setMainTab] = useState('communities'); // 'communities' | 'events'
  const [eventFilter, setEventFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [leadCommunities, setLeadCommunities] = useState([]);
  const [eventForm, setEventForm] = useState({ community_id: '', title: '', description: '', date: '', time: '', cost: '', spots: '', age: 'all', materials: '', location: '', media_urls: [] });
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const CITIES = ['Астана', 'Алматы', 'Шымкент', 'Караганда', 'Атырау', 'Актау'];

  const CATEGORIES_LIST = CATEGORIES.map(c => c.name);

  useEffect(() => {
    localStorage.setItem('shuteam_selected_chips', JSON.stringify(selectedChips));
    localStorage.setItem('shuteam_active_filters', JSON.stringify(activeFilters));
  }, [selectedChips, activeFilters]);

  useEffect(() => {
    api.getUserCommunities()
      .then(comms => {
        if (comms) {
          const mapped = comms.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            type: c.privacy_type === 'OPEN' ? 'open' : c.privacy_type === 'CLOSED' ? 'closed' : 'partial',
            category: c.category || 'Общее',
            user_role: c.user_role || c.userRole || 'MEMBER'
          }));
          setUserJoinedDocs(mapped);
          setJoinedIds(mapped.map(c => c.id));
          setJoinedCategories(mapped.map(c => c.category).filter(Boolean));

          const leads = mapped.filter(c => {
            const role = (c.user_role || '').toUpperCase();
            return role === 'LEADER' || role === 'MODERATOR' || role === 'ADMIN';
          });
          setLeadCommunities(leads);
          if (leads.length > 0 && !eventForm.community_id) {
            setEventForm(f => ({ ...f, community_id: leads[0].id }));
          }
        }
      })
      .catch(err => console.error("Catalog: Error loading roles:", err));
  }, []);

  useEffect(() => {
    setLoadingCommunities(true);
    const category = activeFilters.find(f => CATEGORIES_LIST.includes(f) && f !== 'Мои сообщества');

    const params = {};
    if (search && search.trim()) params.search = search.trim();
    if (category && category.trim()) params.category = category.trim();
    if (city && city.trim()) params.city = city.trim();

    api.getCommunities(params)
      .then(data => {
        if (data) {
          const mapped = data.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            type: c.privacy_type === 'OPEN' ? 'open' : c.privacy_type === 'CLOSED' ? 'closed' : 'partial',
            category: c.category || 'Общее',
            avatar_url: c.avatar_url || '',
          }));
          setActiveCommunities(mapped);
        }
      });
  }, [search, activeFilters, city]);

  useEffect(() => {
    setLoadingEvents(true);
    api.getMeetings()
      .then(data => {
        if (data) {
          const mapped = data.map(m => ({
            id: m.id,
            title: m.title,
            community: m.community_name || 'Сообщество',
            time: formatDate(m.date_time),
            location: m.location_address,
            spots: `${m.registration_count} участников`,
            type: m.is_open ? 'open' : 'partial',
            cost: Number(m.cost)
          }));
          setEvents(mapped);
        }
      })
      .catch(err => console.error('Ошибка загрузки событий:', err))
      .finally(() => setLoadingEvents(false));
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
    if (!eventForm.community_id) return showAlert("Выберите сообщество", "Внимание");

    try {
      const payload = {
        community_id: parseInt(eventForm.community_id),
        title: eventForm.title,
        description: eventForm.description,
        date_time: `${eventForm.date}T${eventForm.time}:00`,
        location_address: eventForm.location,
        cost: parseInt(eventForm.cost) || 0,
        age_group: eventForm.age === 'junior' ? 'До 18' : (eventForm.age === 'senior' ? '18+' : 'Все возрасты'),
        materials: eventForm.materials ? eventForm.materials.split(',').map(m => m.trim()) : [],
        media_urls: eventForm.media_urls
      };
      await api.createMeeting(payload);

      // Refresh meetings
      const data = await api.getMeetings();
      if (data) {
        const mapped = data.map(m => ({
          id: m.id,
          title: m.title,
          community: m.community_name || 'Сообщество',
          time: formatDate(m.date_time),
          location: m.location_address,
          spots: `${m.registration_count} участников`,
          type: m.is_open ? 'open' : 'partial',
          cost: Number(m.cost)
        }));
        setEvents(mapped);
      }

      setIsMeetingModalOpen(false);
      setEventForm({ ...eventForm, title: '', description: '', date: '', time: '', cost: '', spots: '', age: 'all', materials: '', location: '', media_urls: [] });
      showAlert("Встреча успешно создана!", "Успех");
    } catch (err) {
      showAlert("Ошибка создания встречи: " + err.message, "Ошибка");
    }
  };

  const filteredEvents = events.filter(ev => {
    if (eventFilter === 'free') return ev.cost === 0;
    if (eventFilter === 'paid') return ev.cost > 0;
    if (eventFilter === 'today') return ev.time.startsWith('Сегодня');
    return true;
  });

  const toggleFilter = (filterName) => {
    if (filterName === 'Все') {
      // Keep 'Мои сообщества' if it was already selected
      const isMyCommActive = activeFilters.includes('Мои сообщества');
      setActiveFilters(isMyCommActive ? ['Все', 'Мои сообщества'] : ['Все']);
      return;
    }

    if (filterName === 'Мои сообщества') {
      if (activeFilters.includes('Мои сообщества')) {
        setActiveFilters(activeFilters.filter(f => f !== 'Мои сообщества'));
      } else {
        setActiveFilters([...activeFilters, 'Мои сообщества']);
      }
      return;
    }

    let nextFilters = activeFilters.filter(f => f !== 'Все');

    if (nextFilters.includes(filterName)) {
      nextFilters = nextFilters.filter(f => f !== filterName);
    } else {
      nextFilters = [...nextFilters, filterName];
    }

    if (nextFilters.length === 0 || (nextFilters.length === 1 && nextFilters[0] === 'Мои сообщества')) {
      setActiveFilters(nextFilters.includes('Мои сообщества') ? ['Все', 'Мои сообщества'] : ['Все']);
    } else {
      setActiveFilters(nextFilters);
    }
  };

  const toggleTempCategory = (catName) => {
    if (tempSelected.includes(catName)) {
      setTempSelected(tempSelected.filter(n => n !== catName));
    } else {
      setTempSelected([...tempSelected, catName]);
    }
  };

  const applyCategories = () => {
    const newChips = Array.from(new Set([...selectedChips, ...tempSelected]));
    setSelectedChips(newChips);

    // Сразу активируем добавленные категории и убираем "Все"
    if (tempSelected.length > 0) {
      let nextFilters = activeFilters.filter(f => f !== 'Все');
      // Добавляем новые, которых еще нет в активных
      const toActivate = tempSelected.filter(cat => !nextFilters.includes(cat));
      setActiveFilters([...nextFilters, ...toActivate]);
    }

    setIsModalOpen(false);
    setTempSelected([]);
  };

  const removeChip = (chipName) => {
    setSelectedChips(selectedChips.filter(c => c !== chipName));
    setActiveFilters(activeFilters.filter(f => f !== chipName));
    if (activeFilters.length <= 1 && activeFilters.includes(chipName)) {
      setActiveFilters(['Все']);
    }
  };

  const filteredCommunities = (() => {
    const showMy = activeFilters.includes('Мои сообщества');
    const activeCategory = activeFilters.find(f => CATEGORIES_LIST.includes(f) && f !== 'Мои сообщества');

    // Merge search results and joined communities
    let base = [...activeCommunities];
    if (showMy) {
      // Add joined communities that are NOT in activeCommunities already
      const activeIds = new Set(activeCommunities.map(c => c.id));
      let joinedToAdd = userJoinedDocs.filter(c => !activeIds.has(c.id));

      // Если выбрана категория, то и в "Моих сообществах" оставляем только её (независимо от регистра)
      if (activeCategory) {
        const catLower = activeCategory.toLowerCase();
        joinedToAdd = joinedToAdd.filter(c =>
          c.category && c.category.toLowerCase() === catLower
        );
      }

      base = [...base, ...joinedToAdd];
    } else {
      // If 'Мои сообщества' is OFF, hide joined ones from the main results
      base = base.filter(c => !joinedIds.includes(c.id));
    }

    return base.sort((a, b) => {
      const aJoined = joinedIds.includes(a.id);
      const bJoined = joinedIds.includes(b.id);

      const aSelectedCat = activeFilters.includes(a.category);
      const bSelectedCat = activeFilters.includes(b.category);

      const aInterestMatch = joinedCategories.includes(a.category);
      const bInterestMatch = joinedCategories.includes(b.category);

      let aWeight = 0;
      if (aJoined) aWeight += 100;
      if (aSelectedCat) aWeight += 50;
      if (aInterestMatch) aWeight += 30;

      let bWeight = 0;
      if (bJoined) bWeight += 100;
      if (bSelectedCat) bWeight += 50;
      if (bInterestMatch) bWeight += 30;

      return bWeight - aWeight;
    });
  })();

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <h1>Вступай в новые сообщества !</h1>
      </header>

      {/* Рекламный блок или Новости могут быть здесь, пока убираем заглушку */}

      <div className="search-container">
        <div className="search-icon-circle">
          <Search size={22} color="#FFEC8B" />
        </div>
        <input
          type="text"
          placeholder="Поиск по интересам.."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="city-selector" onClick={() => setIsCityModalOpen(true)}>
          <MapPin size={18} />
        </div>
      </div>

      {/* Переключатель Сообщества / События — на тёмном фоне */}
      <div className="main-segment">
        <button
          className={`segment-btn ${mainTab === 'communities' ? 'active' : ''}`}
          onClick={() => setMainTab('communities')}
        >
          Сообщества
        </button>
        <button
          className={`segment-btn ${mainTab === 'events' ? 'active' : ''}`}
          onClick={() => setMainTab('events')}
        >
          События
        </button>
      </div>

      <div className="list-wrapper">

        {mainTab === 'communities' && (
          <>
            <div className="filter-chips">
              <button
                className={`chip ${activeFilters.includes('Все') ? 'active' : ''}`}
                onClick={() => toggleFilter('Все')}
              >
                Все ( {activeCommunities.length} )
              </button>

              {selectedChips.map(chipName => (
                <button
                  key={chipName}
                  className={`chip ${activeFilters.includes(chipName) ? 'active' : ''}`}
                  onClick={() => toggleFilter(chipName)}
                >
                  {chipName}
                </button>
              ))}

              <button
                className={`chip ${activeFilters.includes('Мои сообщества') ? 'active' : ''}`}
                onClick={() => toggleFilter('Мои сообщества')}
              >
                Мои сообщества
              </button>

              <button
                className={`chip ${activeFilters.includes('Новые') ? 'active' : ''}`}
                onClick={() => toggleFilter('Новые')}
              >
                Новые
              </button>

              <button
                className={`chip ${activeFilters.includes('Популярные') ? 'active' : ''}`}
                onClick={() => toggleFilter('Популярные')}
              >
                Популярные
              </button>

              <button className="add-btn" onClick={() => setIsModalOpen(true)}>+</button>
            </div>

            <div className="community-list">
              {filteredCommunities.map(c => <CommunityCard key={c.id} community={c} isJoined={joinedIds.includes(c.id)} />)}
            </div>
          </>
        )}

        {mainTab === 'events' && (
          <>
            <div className="filter-chips">
              <button className={`chip ${eventFilter === 'all' ? 'active' : ''}`} onClick={() => setEventFilter('all')}>Все</button>
              <button className={`chip ${eventFilter === 'free' ? 'active' : ''}`} onClick={() => setEventFilter('free')}>Бесплатные</button>
              <button className={`chip ${eventFilter === 'paid' ? 'active' : ''}`} onClick={() => setEventFilter('paid')}>Платные</button>
              <button className={`chip ${eventFilter === 'today' ? 'active' : ''}`} onClick={() => setEventFilter('today')}>Сегодня</button>
            </div>

            {leadCommunities.length > 0 && (
              <button
                className="btn-create-event-global"
                onClick={() => setIsMeetingModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '16px',
                  background: '#141414',
                  color: '#E6E6D7',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '600',
                  marginTop: '10px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={20} /> Создать свою встречу
              </button>
            )}

            <div className="events-card-list">
              {filteredEvents.map(ev => (
                <div key={ev.id} className="event-card-big">
                  <div className="card-tags">
                    <div className="tag-category">{ev.community}</div>
                    <div className={`badge ${ev.cost === 0 ? 'open' : 'closed'}`}>
                      {ev.cost === 0 ? 'Бесплатно' : `${ev.cost} ₸`}
                    </div>
                  </div>

                  <div className="card-main">
                    <h3>{ev.title}</h3>
                    <div className="event-meta-row">
                      <span><Clock size={13} /> {ev.time}</span>
                      <span><MapPin size={13} /> {ev.location}</span>
                      <span><Users size={13} /> {ev.spots}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="join-btn-new">
                      Записаться <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Поиск категорий */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Интересы</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>+</button>
            </div>

            <div className="category-pill-grid">
              {CATEGORIES.map(cat => (
                <div
                  key={cat.id}
                  className={`category-pill ${tempSelected.includes(cat.name) || selectedChips.includes(cat.name) ? 'active' : ''}`}
                  onClick={() => toggleTempCategory(cat.name)}
                >
                  {cat.name}
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Отмена</button>
              <button className="btn-apply" onClick={applyCategories}>Применить</button>
            </div>
          </div>
        </div>
      )}

      {/* Выбор города */}
      {isCityModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCityModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Выберите город</h3>
              <button className="close-btn" onClick={() => setIsCityModalOpen(false)}>+</button>
            </div>
            <div className="city-list">
              <div
                className={`city-option ${!city ? 'active' : ''}`}
                onClick={() => { setCity(''); setIsCityModalOpen(false); }}
              >
                <div className="city-icon-circle"><Globe size={20} /></div>
                <span>Весь Казахстан</span>
              </div>
              {CITIES.map(c => (
                <div
                  key={c}
                  className={`city-option ${city === c ? 'active' : ''}`}
                  onClick={() => { setCity(c); setIsCityModalOpen(false); }}
                >
                  <div className="city-icon-circle"><MapPin size={20} /></div>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Создание встречи из общего каталога */}
      {isMeetingModalOpen && (
        <div className="modal-overlay" onClick={() => setIsMeetingModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Создать встречу</h3>
              <button className="close-btn" onClick={() => setIsMeetingModalOpen(false)}>+</button>
            </div>

            <form onSubmit={handleCreateMeeting} className="sheet-form">
              <div className="ap-group">
                <label>Ваше сообщество</label>
                <select
                  required
                  value={eventForm.community_id}
                  onChange={e => setEventForm({ ...eventForm, community_id: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #141414', background: '#C6C6BE', color: '#141414', fontSize: '14px', fontWeight: '600' }}
                >
                  {leadCommunities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="ap-group"><label>Название мероприятия</label><input required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Пленэр в парке" /></div>

              <div className="ap-group">
                <label>Описание</label>
                <textarea
                  required
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="О чем будет встреча?"
                  style={{ width: '100%', minHeight: '80px', borderRadius: '12px', padding: '12px', border: '1px solid #141414', background: '#C6C6BE', fontSize: '14px', fontFamily: 'inherit', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="ap-group" style={{ flex: 1 }}><label>Дата</label><input required type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} /></div>
                <div className="ap-group" style={{ flex: 1 }}><label>Время</label><input required type="time" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} /></div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="ap-group" style={{ flex: 1 }}><label>Стоимость (₸)</label><input type="number" value={eventForm.cost} onChange={e => setEventForm({ ...eventForm, cost: e.target.value })} placeholder="0" /></div>
                <div className="ap-group" style={{ flex: 1 }}><label>Мест</label><input type="number" value={eventForm.spots} onChange={e => setEventForm({ ...eventForm, spots: e.target.value })} placeholder="20" /></div>
              </div>

              <div className="ap-group">
                <label>Возрастная группа</label>
                <select
                  value={eventForm.age}
                  onChange={e => setEventForm({ ...eventForm, age: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #141414', background: '#C6C6BE', color: '#141414', fontSize: '14px', fontWeight: '600' }}
                >
                  <option value="all">Все возрасты</option>
                  <option value="junior">До 18</option>
                  <option value="senior">18+</option>
                </select>
              </div>

              <div className="ap-group"><label>Что принести (через запятую)</label><input value={eventForm.materials} onChange={e => setEventForm({ ...eventForm, materials: e.target.value })} placeholder="Акварель, кисти" /></div>

              <div className="ap-group"><label>Локация</label><input required value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} placeholder="Адрес..." /></div>

              <div className="ap-group">
                <label>Фотографии</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                  {eventForm.media_urls.map((url, i) => (
                    <img key={i} src={url} alt="event" style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover', border: '1px solid #141414' }} />
                  ))}
                  <label style={{ width: 50, height: 50, borderRadius: 8, border: '1px dashed #141414', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {uploadingMedia ? "..." : <Plus size={20} color="#141414" />}
                    <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleMediaUpload} />
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: 20 }}>
                <button type="button" className="btn-cancel" onClick={() => setIsMeetingModalOpen(false)}>Отмена</button>
                <button type="submit" className="btn-apply">Создать встречу</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;

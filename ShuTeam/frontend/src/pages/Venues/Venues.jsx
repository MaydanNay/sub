import React, { useState, useEffect } from 'react';
import { MapPin, Wifi, Zap, Monitor, Coffee, Clock, Users, Star, Tag } from 'lucide-react';
import * as api from '../../api';
import './Venues.css';



const AMENITY_ICONS = { 'Wi-Fi': <Wifi size={12}/>, 'Розетки': <Zap size={12}/>, 'Проектор': <Monitor size={12}/>, 'Флипчарт': <Monitor size={12}/> };

const Venues = () => {
  const [expanded, setExpanded] = useState(null);
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    api.getVenues()
      .then(data => { setVenues(data || []); })
      .catch(err => console.error('Ошибка загрузки площадок:', err));
  }, []);

  return (
    <div className="venues-page">
      <header className="venues-header">
        <h1>Где собраться?</h1>
        <p>Партнёрские площадки для ваших встреч</p>
      </header>
      <div className="venues-content">
        <div className="venue-list">
          {venues.map(v => (
            <div key={v.id} className="venue-card">
              <div className="venue-img" style={{ backgroundImage: `url(${v.image})` }}>
                <div className="rating-badge"><Star size={12} fill="currentColor" /> {v.rating}</div>
                <div className="capacity-badge"><Users size={12} /> до {v.capacity}</div>
              </div>
              <div className="venue-content-inner">
                <div className="venue-main">
                  <h3>{v.name}</h3>
                  <p className="address"><MapPin size={12} /> {v.address}</p>
                  <p className="hours"><Clock size={12} /> {v.hours}</p>
                </div>

                <div className="amenities-row">
                  {v.amenities.map((a, i) => (
                    <span key={i} className="amenity-chip">
                      {AMENITY_ICONS[a] || <Coffee size={12}/>} {a}
                    </span>
                  ))}
                </div>

                <div className="menu-row"><Coffee size={12}/> {v.menu}</div>

                <div className="promo-banner">
                  <Tag size={14}/> {v.promo}
                </div>

                {expanded === v.id && (
                  <div className="special-offer">
                    <div className="special-title">🎁 Специальное предложение</div>
                    <div className="special-text">{v.special}</div>
                  </div>
                )}

                <div className="venue-btns">
                  <button className="offer-btn" onClick={() => setExpanded(expanded === v.id ? null : v.id)}>
                    {expanded === v.id ? 'Скрыть' : 'Спецпредложения'}
                  </button>
                  <button className="book-btn">Забронировать</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Venues;

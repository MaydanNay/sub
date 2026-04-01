import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Calendar, User, Users } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutGrid size={24} />
        <span>Главная</span>
      </NavLink>
      <NavLink to="/communities" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Users size={24} />
        <span>Сообщества</span>
      </NavLink>
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={24} />
        <span>Расписание</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={24} />
        <span>Профиль</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;

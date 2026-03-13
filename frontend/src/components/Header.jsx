import React, { useState } from 'react';
import { cn } from "../utils/cn";
import '../styles/Header.css';

const Header = ({ onCtaClick, onOpenContacts }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { href: 'https://shustudio.kz/#why-games', label: 'РЕШЕНИЯ' },
        { href: 'https://shustudio.kz/#solutions', label: 'УСЛУГИ' },
        { href: 'https://shustudio.kz/#ecosystem', label: 'ЭКОСИСТЕМА' },
        { href: 'https://shustudio.kz/#process', label: 'ПРОЦЕСС' },
        { href: '#contacts', label: 'КОНТАКТЫ' },
        { href: 'https://app.shustudio.kz', label: 'КАТАЛОГ ИГР' },
    ];

    return (
        <header className="header-sticky">
            <div className="header-container">
                <div className="header-logo">
                    <a href="https://shustudio.kz" className="logo-link">
                        <span className="logo-text">SHU</span>
                        <span className="logo-dot">.</span>
                        <span className="logo-subtext">STUDIO</span>
                    </a>
                </div>

                {/* Desktop Navigation */}
                <nav className="header-nav desktop-only">
                    {navLinks.map((link) => (
                        <a 
                            key={link.href} 
                            href={link.href} 
                            className="nav-link"
                            onClick={(e) => {
                                if (link.href === '#contacts') {
                                    e.preventDefault();
                                    onOpenContacts?.();
                                }
                            }}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="header-actions">
                    <button
                        className="cta-button desktop-only"
                        onClick={onCtaClick}
                    >
                        ОСТАВИТЬ ЗАЯВКУ
                    </button>

                    {/* Hamburger Button */}
                    <button
                        className={cn("hamburger-btn mobile-only", isMenuOpen && "open")}
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={cn("mobile-menu-overlay mobile-only", isMenuOpen && "active")} onClick={toggleMenu}>
                <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="mobile-nav-link"
                            onClick={(e) => {
                                if (link.href === '#contacts') {
                                    e.preventDefault();
                                    onOpenContacts?.();
                                }
                                toggleMenu();
                            }}
                        >
                            {link.label}
                        </a>
                    ))}
                    <button
                        className="cta-button mobile-cta"
                        onClick={() => {
                            toggleMenu();
                            onCtaClick();
                        }}
                    >
                        ОСТАВИТЬ ЗАЯВКУ
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;

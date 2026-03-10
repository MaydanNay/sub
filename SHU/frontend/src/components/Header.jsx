import React, { useState } from 'react';
import { cn } from "../lib/utils";
import '../styles/Header.css';

const Header = ({ onOpenSurvey }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { href: '#why-games', label: 'ПРОБЛЕМЫ' },
        { href: '#solutions', label: 'УСЛУГИ' },
        { href: '#ecosystem', label: 'ЭКОСИСТЕМА' },
        { href: '#process', label: 'ПРОЦЕСС' },
    ];

    return (
        <header className="header-sticky">
            <div className="header-container">
                <div className="header-logo">
                    <a href="/" className="logo-link">
                        <span className="logo-text">SHU</span>
                        <span className="logo-dot">.</span>
                        <span className="logo-subtext">STUDIO</span>
                    </a>
                </div>

                {/* Desktop Navigation */}
                <nav className="header-nav desktop-only">
                    {navLinks.map((link) => (
                        <a key={link.href} href={link.href} className="nav-link">
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="header-actions">
                    <button
                        className="cta-button desktop-only"
                        onClick={onOpenSurvey}
                    >
                        НАЧАТЬ ИГРУ
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
                            onClick={toggleMenu}
                        >
                            {link.label}
                        </a>
                    ))}
                    <button
                        className="cta-button mobile-cta"
                        onClick={() => {
                            toggleMenu();
                            onOpenSurvey?.();
                        }}
                    >
                        НАЧАТЬ ИГРУ
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;

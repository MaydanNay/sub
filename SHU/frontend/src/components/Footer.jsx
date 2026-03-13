import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import RequestForm from "./RequestForm";
import '../styles/Footer.css';

import telegramIcon from '../image/telegram.svg';
import whatsappIcon from '../image/whatsapp.png';
import phoneIcon from '../image/telephone.png';
import instagramIcon from '../image/instagram.svg';
import linkedinIcon from '../image/linkedin.png';

const Footer = ({ onFormSuccess }) => {
    const footerRef = useRef(null);
    const [showNumber, setShowNumber] = useState(false);
    const { scrollYProgress } = useScroll({
        target: footerRef,
        offset: ["start end", "center center"],
    });

    // Animate background color from black to primary-pink
    // More delayed to keep wave visible against black background
    const backgroundColor = useTransform(
        scrollYProgress,
        [0.6, 0.95],
        ["#000000", "#E66D7A"]
    );

    // Staggered text and card transitions
    const titleColor = useTransform(scrollYProgress, [0.3, 0.7], ["#E66D7A", "#000000"]);
    const subtitleColor = useTransform(scrollYProgress, [0.4, 0.8], ["#ffffff", "#333333"]);
    const cardBg = useTransform(scrollYProgress, [0.4, 0.8], ["#111111", "rgba(255, 255, 255, 0.9)"]);
    const cardBorder = useTransform(scrollYProgress, [0.4, 0.8], ["#333333", "#000000"]);
    const socialColor = useTransform(scrollYProgress, [0.5, 0.9], ["#666666", "#000000"]);
    const btnBg = useTransform(scrollYProgress, [0.5, 0.9], ["#E66D7A", "#000000"]);
    const inputBg = useTransform(scrollYProgress, [0.4, 0.8], ["#1a1a1a", "#ffe8ea"]);
    const inputTextColor = useTransform(scrollYProgress, [0.4, 0.8], ["#ffffff", "#000000"]);
    const labelColor = useTransform(scrollYProgress, [0.4, 0.8], ["#666666", "#333333"]);

    return (
        <motion.footer
            ref={footerRef}
            className="footer-section"
            style={{ backgroundColor: backgroundColor }}
        >
            {/* Multi-Ripple Paint Effect */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="paint-ripple"
                    style={{
                        x: "-50%",
                        scale: useTransform(scrollYProgress, [0 + i * 0.1, 0.5 + i * 0.1], [0, 3 + i * 1.5]),
                        opacity: useTransform(scrollYProgress, [0 + i * 0.1, 0.2 + i * 0.1, 0.5 + i * 0.1], [0, 1, 0]),
                    }}
                />
            ))}
            {/* Final coloring wave */}
            <motion.div
                className="paint-wave-final"
                style={{
                    x: "-50%",
                    scale: useTransform(scrollYProgress, [0, 1.0], [0, 12]), // Much slower and larger
                    opacity: useTransform(scrollYProgress, [0, 0.15], [0, 1]),
                }}
            />

            <div className="footer-container">
                <motion.h2
                    className="footer-main-title"
                    style={{ color: titleColor }}
                >
                    ГОТОВЫ СДЕЛАТЬ БИЗНЕС ИНТЕРЕСНЕЕ?
                </motion.h2>
                <motion.p
                    className="footer-subtitle"
                    style={{ color: subtitleColor }}
                >
                    Оставьте заявку, и мы бесплатно предложим идею геймификации. Без навязчивости.
                </motion.p>

                <motion.div
                    className="footer-form-card"
                    style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                >
                    {/* section label */}
                    <div className="form-section-tag">
                        ЗАЯВКА НА КОНЦЕПТ
                    </div>

                    <RequestForm
                        inputBg={inputBg}
                        inputTextColor={inputTextColor}
                        labelColor={labelColor}
                        btnBg={btnBg}
                        onSuccess={onFormSuccess}
                    />
                </motion.div>

                <motion.div
                    className="footer-contacts"
                    style={{ color: socialColor }}
                >
                    <a href="https://www.instagram.com/shu.studio/" target="_blank" rel="noopener noreferrer">
                        <img src={instagramIcon} alt="INST" className="contact-icon" />
                    </a>
                    <a href="https://t.me/irkibayev" target="_blank" rel="noopener noreferrer">
                        <img src={telegramIcon} alt="TG" className="contact-icon" />
                    </a>
                    <a href="https://wa.me/77769960222" target="_blank" rel="noopener noreferrer">
                        <img src={whatsappIcon} alt="WP" className="contact-icon" />
                    </a>
                    <a href="https://www.linkedin.com/in/sh%C5%AB-studio-4a13143b2?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noopener noreferrer">
                        <img src={linkedinIcon} alt="LINK" className="contact-icon" />
                    </a>
                    
                    <div className="phone-wrapper">
                        <button 
                            onClick={() => setShowNumber(!showNumber)}
                            className="phone-trigger-btn"
                        >
                            <img src={phoneIcon} alt="TEL" className="contact-icon" />
                        </button>
                        <AnimatePresence>
                            {showNumber && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -10, scale: 0.9 }}
                                    className="phone-reveal"
                                >
                                    +7 776 996 02 22
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <motion.div
                    className="footer-address"
                    style={{ color: socialColor }}
                >
                    Проспект Мангилик Ел, 55/8, в павильоне C 4.6 (территория EXPO)
                </motion.div>

                <motion.div
                    className="footer-copyright"
                    style={{ color: socialColor }}
                >
                    © {new Date().getFullYear()} SHU STUDIO. ВСЕ ПРАВА ЗАЩИЩЕНЫ. НАЖМИТЕ START ДЛЯ ПРОДОЛЖЕНИЯ.
                </motion.div>
            </div>
        </motion.footer>
    );
};

export default Footer;

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Button";
import instagramIcon from "../image/instagram.svg";
import telegramIcon from "../image/telegram.svg";
import whatsappIcon from "../image/whatsapp.png";
import phoneIcon from "../image/telephone.png";
import linkedinIcon from "../image/linkedin.png";
import "../styles/ThankYou.css";

const ThankYou = ({ onClose, isModal = true, isFullPage = false }) => {
    const [showNumber, setShowNumber] = useState(false);

    return (
        <motion.div
            className={`thank-you-container ${(!isModal && !isFullPage) ? 'inline-success' : ''} ${isFullPage ? 'full-page-success' : ''}`}
            initial={(isModal || isFullPage) ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
            animate={(isModal || isFullPage) ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
            exit={(isModal || isFullPage) ? { opacity: 0, scale: 0.9 } : { opacity: 0 }}
            transition={(isModal || isFullPage) ? { duration: 0.3, ease: "easeOut" } : { duration: 0.5 }}
        >
            <motion.div
                className="success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
            >
                <div className="pixel-check"></div>
            </motion.div>
            <motion.h2
                className="thank-you-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                СПАСИБО!
            </motion.h2>
            <motion.p
                className="thank-you-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                Ваша заявка успешно отправлена.<br />
                Мы свяжемся с вами в ближайшее время, чтобы обсудить ваш проект.
            </motion.p>

            <motion.div
                className="thank-you-social"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <p className="social-text">А пока можете подписаться на наши соцсети или связаться с нами сами</p>
                <div className="footer-contacts thank-you-icons">
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
                </div>
            </motion.div>

            {onClose && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <Button onClick={onClose} className="thank-you-btn">
                        ВЕРНУТЬСЯ
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ThankYou;

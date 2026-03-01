import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import instagramIcon from "../image/instagram.svg";
import "../styles/ThankYou.css";

const ThankYou = ({ onClose, isModal = true, isFullPage = false }) => {
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
                <p className="social-text">А пока можете подписаться на наш instagram</p>
                <a href="https://www.instagram.com/shu.studio/" target="_blank" rel="noopener noreferrer" className="social-link">
                    <img src={instagramIcon} alt="Instagram" className="social-icon" />
                </a>
            </motion.div>

            {onClose && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <Button onClick={onClose} className="thank-you-btn">
                        ВЕРНУТЬСЯ НА ГЛАВНУЮ
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ThankYou;

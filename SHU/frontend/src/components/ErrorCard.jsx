import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import '../styles/ErrorCard.css';

const ErrorCard = ({ headerTitle, title, text, initialTop, initialLeft, zIndex, onClose, id }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <motion.div
            className="error-card"
            drag
            dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
            dragMomentum={false}
            whileDrag={{ scale: 1.1, rotate: 2, zIndex: 9999, cursor: 'grabbing' }}
            whileHover={{ scale: 1.02 }}

            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            whileInView={{
                opacity: 1,
                scale: 1,
                y: 0,
                x: isMobile ? "-50%" : 0,
                left: isMobile ? "50%" : initialLeft,
                top: initialTop
            }}
            viewport={{ once: true, margin: "-50px" }}
            exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}

            style={{
                zIndex: zIndex,
                position: 'absolute',
            }}
        >
            <div className="error-window-header">
                <span className="error-header-title">{headerTitle}</span>
                <button
                    className="error-close-btn"
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    onClick={() => onClose(id)}
                >
                    X
                </button>
            </div>
            <div className="error-window-body">
                <div className="error-content">
                    <h3 className="error-main-title">{title}</h3>
                    <p className="error-message">{text}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default ErrorCard;

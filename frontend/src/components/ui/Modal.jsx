import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/Modal.css";

const Modal = ({ isOpen, onClose, children, title }) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" onClick={onClose}>
                    <motion.div
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            {title && <h3 className="modal-title">{title}</h3>}
                            <button className="modal-close-btn" onClick={onClose}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;

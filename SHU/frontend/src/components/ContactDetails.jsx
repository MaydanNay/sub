import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import telegramIcon from '../image/telegram.svg';
import whatsappIcon from '../image/whatsapp.png';
import phoneIcon from '../image/telephone.png';
import instagramIcon from '../image/instagram.svg';
import linkedinIcon from '../image/linkedin.png';

const ContactDetails = () => {
    const [showNumber, setShowNumber] = useState(false);

    return (
        <div className="contact-details-content flex-contacts-modal">
            <div className="footer-contacts thank-you-icons" style={{ marginTop: 0 }}>
                <a href="https://www.instagram.com/shu.studio/" target="_blank" rel="noopener noreferrer">
                    <img src={instagramIcon} alt="INST" className="contact-icon" />
                </a>
                <a href="https://t.me/irkibayev" target="_blank" rel="noopener noreferrer">
                    <img src={telegramIcon} alt="TG" className="contact-icon" />
                </a>
                <a href="https://wa.me/77769960222" target="_blank" rel="noopener noreferrer">
                    <img src={whatsappIcon} alt="WP" className="contact-icon" />
                </a>
                <a href="https://www.linkedin.com/in/shū-studio-4a13143b2?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noopener noreferrer">
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

            <div className="text-center" style={{ marginTop: '32px' }}>
                <p className="footer-address" style={{ fontSize: '12px', opacity: 0.9, marginBottom: '16px' }}>
                    Проспект Мангилик Ел, 55/8, в павильоне C 4.6 (территория EXPO)
                </p>
                <p className="footer-copyright" style={{ opacity: 0.6 }}>
                    Creative Tech Solutions • Almaty • KZ
                </p>
            </div>
        </div>
    );
};

export default ContactDetails;

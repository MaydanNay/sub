import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

import telegramIcon from '../image/telegram.svg';
import whatsappIcon from '../image/whatsapp.png';
import phoneIcon from '../image/telephone.png';
import instagramIcon from '../image/instagram.svg';
import linkedinIcon from '../image/linkedin.png';

const ContactDetails = () => {
    const [showNumber, setShowNumber] = useState(false);

    const iconStyle = "w-10 h-10 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-110";

    return (
        <div className="contact-details-content flex flex-col items-center gap-8 py-4">
            <div className="social-icons-row flex flex-wrap justify-center gap-8 items-center">
                <a href="https://www.instagram.com/shu.studio/" target="_blank" rel="noopener noreferrer">
                    <img src={instagramIcon} alt="INST" className={iconStyle} />
                </a>
                <a href="https://t.me/irkibayev" target="_blank" rel="noopener noreferrer">
                    <img src={telegramIcon} alt="TG" className={iconStyle} />
                </a>
                <a href="https://wa.me/77769960222" target="_blank" rel="noopener noreferrer">
                    <img src={whatsappIcon} alt="WP" className={iconStyle} />
                </a>
                <a href="https://www.linkedin.com/in/shū-studio-4a13143b2?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noopener noreferrer">
                    <img src={linkedinIcon} alt="LINK" className={iconStyle} />
                </a>
                
                <div className="relative flex items-center">
                    <button 
                        onClick={() => setShowNumber(!showNumber)}
                        className="focus:outline-none"
                    >
                        <img src={phoneIcon} alt="TEL" className={iconStyle} />
                    </button>
                    <AnimatePresence>
                        {showNumber && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -10, scale: 0.9 }}
                                className="absolute left-full ml-4 px-3 py-1 bg-[#E66D7A] text-black font-shupixel text-[10px] whitespace-nowrap shadow-pixel-sm z-50"
                            >
                                +7 776 996 02 22
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="text-center space-y-4">
                <p className="font-shupixel text-[10px] text-gray-400 uppercase tracking-widest max-w-sm leading-relaxed">
                    Проспект Мангилик Ел, 55/8, в павильоне C 4.6 (территория EXPO)
                </p>
                <p className="font-shupixel text-[9px] text-gray-500 uppercase tracking-[0.2em]">
                    Creative Tech Solutions • Almaty • KZ
                </p>
            </div>
        </div>
    );
};

export default ContactDetails;

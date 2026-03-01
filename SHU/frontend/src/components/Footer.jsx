import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "../lib/utils";
import RequestForm from "./RequestForm";
import '../styles/Footer.css';

const Footer = ({ onFormSuccess }) => {
    const footerRef = useRef(null);
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

                {/* social and copyright */}
                <motion.div
                    className="footer-social-grid"
                    style={{ color: socialColor }}
                >
                    <a href="https://www.instagram.com/shu.studio/" target="_blank" rel="noopener noreferrer" className="footer-social-link">INSTAGRAM</a>
                    <a href="#" className="footer-social-link">TELEGRAM</a>
                    <a href="#" className="footer-social-link">LINKEDIN</a>
                </motion.div>

                <motion.div
                    className="footer-copyright"
                    style={{ color: socialColor }}
                >
                    © 2026 SHU STUDIO. ВСЕ ПРАВА ЗАЩИЩЕНЫ. НАЖМИТЕ START ДЛЯ ПРОДОЛЖЕНИЯ.
                </motion.div>
            </div>
        </motion.footer>
    );
};

export default Footer;

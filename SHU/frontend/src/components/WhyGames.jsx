import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import '../styles/WhyGames.css'
import ErrorCard from './ErrorCard'
import star1 from '../image/star_1.svg';
import star2 from '../image/star_2.svg';

const WhyGames = () => {
    const [errors, setErrors] = useState([
        {
            id: 1,
            headerTitle: "Problem #1",
            title: "БАННЕРНАЯ СЛЕПОТА",
            text: <>Клиенты пролистывают вашу рекламу за секунду. <br /> А в игру - втягиваются на 10-15 минут и запоминают бренд.</>,
            top: "10%",
            left: "20%",
            zIndex: 1
        },
        {
            id: 2,
            headerTitle: "Problem #2",
            title: "РУТИНА УБИВАЕТ МОТИВАЦИЮ",
            text: <>Сотрудники зубрят инструкции, но ничего не запоминают. В игровом формате обучение превращается в квест с наградами.</>,
            top: "15%",
            left: "50%",
            zIndex: 2
        },
        {
            id: 3,
            headerTitle: "Problem #3",
            title: "БРЕНД БЕЗ ЭМОЦИЙ",
            text: "Когда продукты похожи, побеждает тот, кто вызвал эмоции. Игра - самый быстрый путь к сердцу покупателя.",
            top: "45%",
            left: "35%",
            zIndex: 3
        }
    ]);

    const handleClose = (id) => {
        setErrors(prev => prev.filter(error => error.id !== id));
    };

    return (
        <section id="why-games" className="why-games container" style={{ position: 'relative' }}>
            {/* Decorative Stars */}
            <motion.img
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                src={star1}
                alt=""
                className="star-decor star-1"
                style={{
                    position: 'absolute',
                    left: '-60px',
                    top: '40%',
                    width: '180px',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />
            <motion.img
                initial={{ opacity: 0, scale: 0.5, rotate: 20 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                src={star2}
                alt=""
                className="star-decor star-2"
                style={{
                    position: 'absolute',
                    right: '-10px',
                    top: '10%',
                    width: '120px',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                Люди устали от навязчивости, <br />
                но они обожают играть
            </motion.h2>

            <div className="error-desktop">
                <AnimatePresence>
                    {errors.length > 0 ? (
                        errors.map((error) => (
                            <ErrorCard
                                key={error.id}
                                id={error.id}
                                headerTitle={error.headerTitle}
                                title={error.title}
                                text={error.text}
                                initialTop={error.top}
                                initialLeft={error.left}
                                zIndex={error.zIndex}
                                onClose={handleClose}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
                            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                            className="success-message-card"
                        >
                            <div className="success-header">
                                <span className="success-icon">✔</span>
                                <span className="success-header-text">SYSTEM OPTIMIZED</span>
                            </div>
                            <div className="success-content">
                                <h3 className="success-title">ПРОБЛЕМЫ УСТРАНЕНЫ!</h3>
                                <p className="success-text">
                                    Все барьеры для роста вашего бизнеса сняты. <br />
                                    Готовы превратить идеи в реальность?
                                </p>
                                <a href="#solutions" className="success-cta-btn">
                                    К ВАРИАНТАМ РЕШЕНИЙ
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}

export default WhyGames

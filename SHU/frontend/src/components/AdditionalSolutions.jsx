import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useVelocity } from 'framer-motion';
import '../styles/AdditionalSolutions.css';
import windowSvg from '../image/window.svg';
// groundSvg import removed as we use Data URI now
import diamondSvg from '../image/diamond.svg';
import girlGif from '../image/girl.webp'; // Import the girl character

const AdditionalSolutions = () => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    // Tracking scroll velocity to "play/pause" the character animation
    const scrollVelocity = useVelocity(scrollYProgress);
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        return scrollVelocity.on("change", (v) => {
            // Sensitivity check: if velocity is very small, we consider it stopped
            if (Math.abs(v) > 0.001) {
                setIsMoving(true);
            } else {
                setIsMoving(false);
            }
        });
    }, [scrollVelocity]);

    // x: moves left to reveal cards and fully exit at the right spot
    const xRange = window.innerWidth < 768 ? [0, -4800] : [0, -4500];
    const x = useTransform(scrollYProgress, [0, 1], ["0px", `${xRange[1]}px`]);

    // Clouds move slower than cards for parallax effect
    const cloudX = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);
    const y = useTransform(scrollYProgress, [0, 1], ["0vh", "-30vh"]);

    const cards = [
        {
            id: 1,
            title: <>Полноценные<br />игры</>,
            subtitle: "Мобильные, Steam, Web",
            desc: "Визуальные новеллы, Раннеры, Головоломки. Любая сложность благодаря GCA.",
            buttonText: "Каталог игр",
            colorClass: "card-color-1"
        },
        {
            id: 2,
            title: <>ФИДЖИТАЛ<br />& МЕРЧ</>,
            subtitle: "Блайнд-боксы и AR",
            desc: "Коробочки с сюрпризом, эффект unboxing. Цифровой мир дополняем реальными эмоциями.",
            buttonText: "Смотреть кейсы",
            colorClass: "card-color-2"
        },
        {
            id: 3,
            title: <>АНИМАЦИЯ<br />& ВИДЕО</>,
            subtitle: "Продакшн полного цикла",
            desc: "Рекламные ролики, трейлеры, эксплейнеры. От сценария до монтажа.",
            buttonText: "Портфолио",
            colorClass: "card-color-3"
        }
    ];

    const clouds = [
        { top: '5%', left: '-5%', width: '400px', opacity: 0.8 },
        { top: '10%', right: '10%', width: '300px', opacity: 0.9 },
        { top: '40%', left: '15%', width: '250px', opacity: 0.7 },
        { top: '35%', right: '-5%', width: '350px', opacity: 0.8 },
        { bottom: '15%', right: '10%', width: '280px', opacity: 0.9 },
        { bottom: '10%', left: '5%', width: '320px', opacity: 0.8 },
        // Center clouds
        { top: '20%', left: '40%', width: '200px', opacity: 0.6 },
        { top: '55%', left: '50%', transform: 'translateX(-50%)', width: '350px', opacity: 0.5 },
        { bottom: '30%', left: '30%', width: '300px', opacity: 0.7 },
        // Off-screen clouds (appearing on scroll)
        { top: '15%', left: '110%', width: '380px', opacity: 0.8 },
        { top: '60%', left: '130%', width: '300px', opacity: 0.7 },
        { bottom: '20%', left: '150%', width: '320px', opacity: 0.9 },
        { top: '10%', left: '170%', width: '250px', opacity: 0.6 },
        { bottom: '40%', left: '190%', width: '350px', opacity: 0.8 },
        { top: '30%', left: '210%', width: '300px', opacity: 0.7 },
    ];

    return (
        <section id="ecosystem" ref={targetRef} className="additional-solutions">
            <div className="additional-solutions-sticky-container">
                {/* Background Clouds */}
                <motion.div
                    style={{ x: cloudX, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
                >
                    {clouds.map((cloud, index) => (
                        <img
                            key={index}
                            src={windowSvg}
                            alt=""
                            style={{
                                position: 'absolute',
                                top: cloud.top,
                                left: cloud.left,
                                right: cloud.right,
                                bottom: cloud.bottom,
                                width: cloud.width,
                                opacity: cloud.opacity,
                                transform: cloud.transform,
                                pointerEvents: 'none',
                            }}
                        />
                    ))}
                </motion.div>

                <motion.div
                    style={{ x, y, zIndex: 1, position: 'relative' }}
                    className="solutions-motion-container"
                >
                    {cards.map((card, index) => (
                        <div
                            key={card.id}
                            className={`solution-card-item ${card.colorClass} group`}
                            style={{
                                // Ladder effect: each subsequent card is lower
                                transform: `translateY(${index * 15}vh)`
                            }}
                        >
                            {/* Content Top */}
                            <div>
                                <h3 className="solution-card-title">
                                    {card.title}
                                </h3>
                                <p className="solution-card-subtitle">
                                    {card.subtitle}
                                </p>
                                <p className="solution-card-desc">
                                    {card.desc}
                                </p>
                            </div>
                            <div style={{ alignSelf: 'flex-end' }}>
                                <button
                                    className="solution-card-btn"
                                    onClick={() => window.open('https://app.shustudio.kz', '_blank', 'noopener,noreferrer')}
                                >
                                    {card.buttonText}
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* CHARACTER GIF - Pushing the cards */}
                    <CharacterPushing girlGif={girlGif} isMoving={isMoving} />

                    {/* GROUND CONTAINER - Expanded for infinite feel */}
                    <div className="ground-container">
                        {/* ROW 1: Grass Top Layer */}
                        <div className="ground-grass-layer" />

                        {/* ROW 2: Small Middle Layer (Dark Border) */}
                        <div className="ground-border-layer" />

                        {/* ROW 3: Bottom Jagged Edge Layer */}
                        <div className="ground-dirt-layer" />

                        {/* Diamonds scattered in the ground */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '15000px', height: '100%', pointerEvents: 'none' }}>
                            {[...Array(60)].map((_, i) => (
                                <img
                                    key={i}
                                    src={diamondSvg}
                                    alt=""
                                    style={{
                                        position: 'absolute',
                                        top: `${30 + (i % 12) * 30}px`,
                                        left: `${100 + i * 150}px`,
                                        width: `${30 + (i % 3) * 10}px`,
                                        transform: `rotate(${(i * 15) % 360}deg)`,
                                        opacity: 0.8
                                    }}
                                />
                            ))}
                        </div>

                        {/* Text at the end of the scroll - anchored to ground */}
                        <div className="startups-section-container">
                            <h3 className="startups-title">
                                Наши стартапы<br />(Innovation Lab)
                            </h3>

                            <div className="startups-card">
                                <h4 className="startups-card-title">
                                    Мы не только делаем проекты на заказ.<br />Мы создаём собственные продукты.
                                </h4>
                                <p className="startups-card-desc">
                                    SHU Studio развивает IT-решения и стартапы, которые помогают автоматизировать бизнес-процессы и улучшать опыт пользователей.
                                </p>
                                <button className="startups-card-button"
                                    onClick={() => window.open('https://app.shustudio.kz', '_blank', 'noopener,noreferrer')}
                                    onMouseDown={(e) => e.target.style.transform = 'translate(2px, 2px)'}
                                    onMouseUp={(e) => e.target.style.transform = 'none'}
                                    onMouseLeave={(e) => e.target.style.transform = 'none'}
                                >
                                    Перейти в блог стартапов
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const CharacterPushing = ({ girlGif, isMoving }) => {
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const updateCanvas = () => {
            if (isMoving) {
                // When moving, constantly update the canvas with the current GIF frame
                // We ensure canvas dimensions match image's natural dimensions if they are available
                if (img.naturalWidth && (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight)) {
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            animationFrameId = requestAnimationFrame(updateCanvas);
        };

        animationFrameId = requestAnimationFrame(updateCanvas);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isMoving]);

    return (
        <div style={{
            position: 'relative',
            width: '250px',
            height: '400px',
            flexShrink: 0,
            alignSelf: 'flex-start',
            marginTop: 'calc(50px + 30vh)',
            marginLeft: '-120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5
        }}>
            {/* The actual GIF - visible only when moving */}
            <img
                ref={imgRef}
                src={girlGif}
                alt="character"
                style={{
                    position: 'absolute',
                    width: '250px',
                    height: 'auto',
                    imageRendering: 'pixelated',
                    opacity: isMoving ? 1 : 0,
                    pointerEvents: 'none',
                    left: '35px',
                    top: '50px'
                }}
            />
            {/* The Canvas - visible only when stopped, showing the last frame */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    width: '250px',
                    height: 'auto',
                    imageRendering: 'pixelated',
                    opacity: isMoving ? 0 : 1,
                    pointerEvents: 'none',
                    left: '35px',
                    top: '50px'
                }}
            />
        </div>
    );
};

export default AdditionalSolutions;

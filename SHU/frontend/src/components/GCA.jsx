import { useState, useEffect } from 'react'
import '../styles/GCA.css'
import gsaSvg from '../image/gsa.svg'
import ScrollReveal from './ui/ScrollReveal'

const GCA = () => {
    const [activeStyle, setActiveStyle] = useState('pixel');

    const specialists = [
        'Авторы новелл',
        'композиторы',
        'эксперты по Unity',
        'эксперты по Unreal Engine'
    ]

    const [currentSpecialistIndex, setCurrentSpecialistIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSpecialistIndex((prevIndex) => (prevIndex + 1) % specialists.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    const styles = {
        anime: {
            title: 'Аниме стиль',
            icon: '👩‍🎤'
        },
        pixel: {
            title: 'Пиксель-арт',
            icon: '👾'
        },
        other: {
            title: '3D',
            icon: '👽'
        }
    };

    return (
        <section className="gca container">
            <div className="gca-header">
                <ScrollReveal direction="left" className="header-text-content">
                    <div className="header-text-content">
                        <h2 style={{ color: 'black', fontSize: '40px', }}
                            className="section-title">Мы - часть<br />экосистемы<br />GCA Communities</h2>
                        <p className="section-subtitle">
                            Это значит, что у нас есть прямой доступ к огромной базе проверенных специалистов:
                            художники, сценаристы, программисты, композиторы.
                        </p>
                    </div>
                </ScrollReveal>
                <ScrollReveal direction="right" className="header-image-content">
                    <div className="header-image-content">
                        <img src={gsaSvg} alt="GCA Network" className="header-network-img" />
                    </div>
                </ScrollReveal>
            </div>

            <div className="gca-grid">
                <ScrollReveal direction="up" delay={0.1} style={{ display: 'contents' }}>
                    <div className="gca-card style-card">
                        <h3 className="gca-card-title">Любой<br />визуальный<br />стиль</h3>
                        <div className="card-icons">
                            {Object.entries(styles).map(([key, value]) => (
                                <div
                                    key={key}
                                    className={`style-item ${activeStyle === key ? 'active' : ''}`}
                                    onMouseEnter={() => setActiveStyle(key)}
                                >
                                    <span className="style-icon">{value.icon}</span>
                                </div>
                            ))}
                        </div>
                        <div className="card-pill-wrapper">
                            <div className={`pill-pointer pointer-${activeStyle}`}></div>
                            <div className="card-pill">{styles[activeStyle].title}</div>
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.2} style={{ display: 'contents' }}>
                    <div className="gca-card specialists-card">
                        <h3 className="gca-card-title">Узкие<br />специалисты</h3>
                        <div className="retro-tv-monitor">
                            <div className="retro-tv-screen">
                                {specialists[currentSpecialistIndex]}
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.3} style={{ display: 'contents' }}>
                    <div className="gca-card management-card">
                        <div className="card-checkmark-bg">✔</div>
                        <h3 className="gca-card-title">SHU<br />управляет<br />всем<br />процессом</h3>
                        <div className="card-status">
                            Project status: 100% DONE
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}

export default GCA

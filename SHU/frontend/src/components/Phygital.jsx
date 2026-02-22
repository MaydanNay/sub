import '../styles/Phygital.css'
import ScrollReveal from './ui/ScrollReveal'

const Phygital = () => {
    return (
        <section className="phygital container">
            <ScrollReveal direction="up">
                <div className="section-header">
                    <h2 className="section-title">Дополнительные решения</h2>
                    <p className="section-subtitle">Больше, чем код: Физические продукты и креатив</p>
                </div>
            </ScrollReveal>

            <div className="phygital-grid">
                <ScrollReveal direction="left" delay={0.2} style={{ display: 'contents' }}>
                    <div className="phygital-item blind-box">
                        <h3 className="phygital-title">📦 Блайнд-боксы (Blind Boxes)</h3>
                        <p className="phygital-desc">
                            Коробочки с сюрпризом внутри. Никто не знает, что именно попадётся — и это вызывает азарт.
                        </p>
                        <ul className="phygital-list">
                            <li><strong>Корпоративный мерч:</strong> Брендированные игрушки, брелоки.</li>
                            <li><strong>Награды за игру:</strong> Купон на реальный блайнд-бокс.</li>
                            <li><strong>Эффект «unboxing»:</strong> Вирусный эффект в соцсетях.</li>
                        </ul>
                    </div>
                </ScrollReveal>

                <ScrollReveal direction="right" delay={0.2} style={{ display: 'contents' }}>
                    <div className="phygital-item animation">
                        <h3 className="phygital-title">🎬 Анимация и видеопродакшн</h3>
                        <p className="phygital-desc">
                            От сценария до финального монтажа.
                        </p>
                        <ul className="phygital-list">
                            <li>Рекламные ролики для соцсетей.</li>
                            <li>Эксплейнеры о продукте.</li>
                            <li>Трейлеры для игр и акций.</li>
                            <li>Короткие анимационные истории.</li>
                        </ul>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}

export default Phygital

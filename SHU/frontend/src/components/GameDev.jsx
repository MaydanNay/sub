import '../styles/GameDev.css'
import ScrollReveal from './ui/ScrollReveal'
import linesImg from '../image/lines.svg'
import crownImg from '../image/crown.svg'
import ufoImg from '../image/ufo.svg'
import sticker1 from '../image/sticker_1.svg'
import sticker2 from '../image/sticker_2.svg'

const GameDev = () => {

    return (
        <section className="gamedev container">
            {/* Background Decorations */}
            <img src={linesImg} alt="" className="decor-lines" />
            <img src={crownImg} alt="" className="decor-crown" />

            <ScrollReveal direction="up">
                <div className="gamedev-content">
                    <h2 className="section-title pixel-title">Больше чем<br />геймификация</h2>
                    {/* Replacing alien emoji with ufo.svg */}
                    <div className="mascot-container">
                        <img src={ufoImg} alt="UFO" className="ufo-mascot" />
                    </div>
                </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
                <div className="gamedev-note">
                    <img src={sticker1} alt="" className="note-tape-bottom" />
                    <img src={sticker2} alt="" className="note-tape-top" />
                    <p>
                        Хотите выпустить собственную мобильную игру, проект для Steam или браузерную игру для вашего сообщества? <br />
                        Мы реализуем проекты любой сложности благодаря <br />
                        экосистеме GCA.
                    </p>
                </div>
            </ScrollReveal>
        </section>
    )
}

export default GameDev

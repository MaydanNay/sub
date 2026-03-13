import { motion } from 'framer-motion'
import '../styles/Hero.css'
import GridDetails from './GridDetails'
import Typewriter from './Typewriter'

const Hero = ({ onOpenModal, onOpenSurvey }) => {
    return (
        <section className="hero">
            <GridDetails />
            <div className="hero-flare" />
            <div className="container hero-content">
                <h1 className="hero-title">
                    <Typewriter
                        text={"Геймификация и игры,\nкоторые работают\nна ваш бизнес"}
                        delay={0.5}
                    />
                </h1>
                <motion.p
                    className="hero-text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    Превращаем скучные процессы в увлекательную игру.<br />
                    Создаем механики, которые привлекают новых покупателей,<br />
                    возвращают старых и делают работу команды интереснее.
                </motion.p>
                <motion.div 
                    className="hero-buttons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <button
                        className="hero-btn start-game-btn"
                        onClick={onOpenSurvey}
                    >
                        Начать игру
                    </button>
                    <button
                        className="hero-btn"
                        onClick={onOpenModal}
                    >
                        Узнать стоимость
                    </button>
                </motion.div>
            </div>
        </section>
    )
}

export default Hero

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "../lib/utils";
import { ProcessStep } from "./ProcessStep";
import '../styles/Process.css';

const steps = [
    { id: 1, title: "БРИФИНГ И ПОГРУЖЕНИЕ", desc: "Узнаём аудиторию и цели. Что важнее: продажи или лояльность?" },
    { id: 2, title: "КОНЦЕПТ И КОМАНДА", desc: "Подбираем механику и специалистов из GCA под стиль проекта." },
    { id: 3, title: "РАЗРАБОТКА И ПРОДАКШН", desc: "Пишем код, рисуем, анимируем. Если нужно — делаем мерч." },
    { id: 4, title: "ЗАПУСК И АНАЛИТИКА", desc: "Интегрируем игру, анализируем метрики и масштабируем успех." },
];

const Process = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end end"],
    });

    const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <section
            id="process"
            ref={containerRef}
            className="process-section"
        >
            <div className="process-container">
                <div className="process-header">
                    <h2 className="process-title">
                        КАК МЫ РАБОТАЕМ
                    </h2>
                </div>

                <div className="process-timeline-wrapper">
                    {/* Static timeline line */}
                    <div className="timeline-line-static" />

                    {/* Active progress bar */}
                    <motion.div
                        style={{ scaleY, originY: 0 }}
                        className="timeline-line-active"
                    />

                    <div className="process-steps-container">
                        {steps.map((step, index) => (
                            <ProcessStep
                                key={step.id}
                                id={step.id}
                                title={step.title}
                                desc={step.desc}
                                isEven={index % 2 === 0}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Process;

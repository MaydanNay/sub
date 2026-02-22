import React from 'react';
import '../styles/Solutions.css';
import coffee from '../image/coffee.svg';
import makeup from '../image/makeup.webp';
import offece from '../image/offece.webp';
import safety from '../image/safety.webp';
import eye from '../image/eye.svg';
import emojisvg from '../image/emojisvg.svg';
import ScrollReveal from './ui/ScrollReveal';

const Solutions = () => {
    const solutions = [
        // ... (data remains the same)
        {
            id: 1,
            title: <>ПРИВЛЕЧЕНИЕ<br />НОВЫХ<br />КЛИЕНТОВ</>,
            tag: "ПРОМО",
            tagType: "promo",
            image: coffee,
            description: "Промо-игры с призами. Взрывной старт и сарафанное радио для нового продукта.",
            example: <><strong>Пример:</strong> Кофейня запускает игру 'Собери ингредиенты'. Клиенты играют, делятся результатами с друзьями, получают промокод и покупают не только кофе, но и десерты.</>,
            metrics: [
                { name: "ПРОДАЖИ", value: 80 },
                { name: "ТРАФИК", value: 90 },
                { name: "УБЫТКИ", value: 10 }
            ],
            colorClass: "card-blue"
        },
        {
            id: 2,
            title: <>УДЕРЖАНИЕ<br />И ВОЗВРАТ<br />КЛИЕНТОВ</>,
            tag: "ЛОЯЛЬНОСТЬ",
            tagType: "loyalty",
            image: makeup,
            description: "Программы лояльности в игровом формате. Сундучки, бонусы и дейлики.",
            example: <><strong>Пример:</strong> Каждый день покупатель открывает «Сундучок красоты» получает бонусы, скидки или шанс на крупный приз. Игра вызывает привычку, а раз зашёл - купил что-то по акции.</>,
            metrics: [
                { name: "ЛОЯЛЬНОСТЬ", value: 85 },
                { name: "ОТТОК", value: 20 },
                { name: "ЧЕК", value: 60 }
            ],
            colorClass: "card-lime"
        },
        {
            id: 3,
            title: "МОТИВАЦИЯ СОТРУДНИКОВ",
            tag: "HR-TECH",
            tagType: "hr",
            image: offece,
            description: "Внутренняя геймификация: рейтинги, ачивки и «Доска Героев».",
            example: <><strong>Пример:</strong> Отдел продаж в ритейле. Каждая закрытая сделка приносит очки. Рутинная работа превращается в азартное соревнование.</>,
            metrics: [
                { name: "ПРОДУКТИВНОСТЬ", value: 75 },
                { name: "КОМАНДА", value: 80 },
                { name: "ТЕКУЧКА КАДРОВ", value: 30 }
            ],
            colorClass: "card-pink"
        },
        {
            id: 4,
            title: <>ОБУЧЕНИЕ<br />И ТЕХНИКА<br />БЕЗОПАСНОСТИ</>,
            tag: "ED-TECH",
            tagType: "ed",
            image: safety,
            description: "Внутренняя геймификация: рейтинги, ачивки и «Доска Героев».",
            example: <><strong>Пример:</strong> Складской симулятор. Новички проходят виртуальный тур и сдают экзамен. Усвоение материала до 85%.</>,
            metrics: [
                { name: "ЗНАНИЯ", value: 85 },
                { name: "БЕЗОПАСНОСТЬ", value: 90 },
                { name: "ПРОБЛЕМЫ", value: 15 }
            ],
            colorClass: "card-dark"
        }
    ];

    return (
        <section id="solutions" className="solutions container" style={{ position: 'relative' }}>
            <ScrollReveal direction="up">
                <div className="solutions-header">
                    <h2 className="solutions-title">ЧТО<br />МЫ<br />РЕШАЕМ?</h2>
                    <div className="solutions-description">
                        <p>
                            Мы не просто разрабатываем игры ради игр. <br />
                            Каждый проект нацелен на <span className="highlight">измеримый результат:</span> <br />
                            больше продаж, лояльных клиентов или вовлечённых сотрудников.
                        </p>
                        <img
                            src={emojisvg}
                            alt="Cool Emoji"
                            className="emoji-face-img"
                            loading="lazy"
                        />
                    </div>
                </div>
            </ScrollReveal>

            {/* Decorative Eye */}
            <img
                src={eye}
                alt="Eye Decor"
                className="solutions-eye-decor"
                loading="lazy"
            />

            <div className="solutions-grid">
                {solutions.map((item, index) => (
                    <ScrollReveal
                        key={item.id}
                        direction="up"
                        delay={index * 0.15}
                    >
                        <div className={`solution-card ${item.colorClass}`}>
                            <div className="card-image-header">
                                <img src={item.image} alt={item.title} className="card-bg-image" loading="lazy" />
                                <div className="gradient-overlay"></div>
                                <h3 className="card-title-overlay">{item.title}</h3>
                                <div className={`card-tag-overlay tag-${item.tagType}`}>
                                    <span className="tag-label">ТИП:</span> <span className="tag-value">{item.tag}</span>
                                </div>
                            </div>

                            <div className="card-content">
                                <p className="card-description">{item.description}</p>

                                <div className="card-example">
                                    <p>{item.example}</p>
                                </div>

                                <div className="card-metrics">
                                    {item.metrics.map((metric, idx) => (
                                        <div key={idx} className="metric-row">
                                            <span className="metric-name">{metric.name}</span>
                                            <div className="metric-bar-container">
                                                <div
                                                    className="metric-bar-fill"
                                                    style={{ width: `${metric.value}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                ))}
            </div>
        </section>
    );
};

export default Solutions;

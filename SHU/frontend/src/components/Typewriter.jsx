import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import "../styles/Typewriter.css";

export const Typewriter = ({ text, className, delay = 0 }) => {
    // 1. Разбиваем текст на массив символов
    const characters = Array.from(text);

    // 2. Настройки анимации родителя (контейнера)
    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                // Самое важное: staggerChildren делает паузу между появлением букв
                staggerChildren: 0.05,
                delayChildren: delay,
            },
        },
    };

    // 3. Анимация каждой буквы
    const child = {
        hidden: { opacity: 0, display: "none" }, // Скрыто
        visible: {
            opacity: 1,
            display: "inline-block", // Появляется
        },
    };

    return (
        <motion.span
            className={className}
            variants={container}
            initial="hidden"     // Начальное состояние
            whileInView="visible" // Запуск когда элемент в поле зрения
            viewport={{ once: true }} // Проигрывать только 1 раз
        >
            {characters.map((char, index) => {
                // Если встречаем перенос строки \n
                if (char === "\n") {
                    return <br key={index} />;
                }
                return (
                    <motion.span key={index} variants={child}>
                        {/* Заменяем обычный пробел на неразрывный, чтобы верстка не скакала */}
                        {char === " " ? "\u00A0" : char}
                    </motion.span>
                );
            })}

            {/* 4. Мигающий курсор (квадратик) */}
            <motion.span
                animate={{ opacity: [0, 1, 0] }} // Мигание от 0 до 1 и обратно
                transition={{ duration: 0.8, repeat: Infinity }}
                className={cn(
                    "typewriter-cursor",
                    "align-middle"
                )}
            />
        </motion.span>
    );
};

export default Typewriter;

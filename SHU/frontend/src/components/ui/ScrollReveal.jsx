import React from 'react';
import { motion } from 'framer-motion';

const ScrollReveal = ({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.8,
    distance = 30,
    once = true,
    margin = "-100px"
}) => {
    const variants = {
        hidden: {
            opacity: 0,
            x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
            y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration: duration,
                delay: delay,
                ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for smooth feel
            },
        },
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin }}
        >
            {children}
        </motion.div>
    );
};

export default ScrollReveal;

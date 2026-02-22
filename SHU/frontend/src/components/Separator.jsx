import React from 'react';
import '../styles/Separator.css';
import ScrollReveal from './ui/ScrollReveal';

const Separator = () => {
    return (
        <ScrollReveal direction="up" distance={0}>
            <div className="section-separator container">
                <div className="separator-mask">
                    <div className="separator-track">
                        <span className="separator-text">SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU </span>
                        <span className="separator-text">SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU SHU </span>
                    </div>
                </div>
            </div>
        </ScrollReveal>
    );
};

export default Separator;

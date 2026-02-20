import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MainScene from './scenes/MainScene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450, // 16:9 ratio, suitable for mobile landscape or desktop
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false,
        },
    },
    scene: [BootScene, MainScene],
    backgroundColor: '#000000',
};

export default config;

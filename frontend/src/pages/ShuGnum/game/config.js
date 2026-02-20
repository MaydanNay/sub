import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MainScene from './scenes/MainScene';

const config = {
    type: Phaser.AUTO,
    width: 360,
    height: 640,
    parent: 'phaser-game',
    transparent: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: [BootScene, MainScene]
};

export default config;

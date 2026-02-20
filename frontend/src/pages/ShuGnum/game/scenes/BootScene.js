import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('logo', '/magnum_logo.svg');
    }

    create() {
        this.createAssets();
        this.scene.start('MainScene');
    }

    createAssets() {
        // --- Ingredients ---
        this.createEmojiTexture('potato', '🥔');
        this.createEmojiTexture('carrot', '🥕');
        this.createEmojiTexture('egg', '🥚');
        this.createEmojiTexture('sausage', '🌭');
        this.createEmojiTexture('cucumber', '🥒');
        this.createEmojiTexture('peas', '🟢');

        // Rare: Mayo / Kazy
        this.createEmojiTexture('mayo', '🍯');
        this.createEmojiTexture('kazy', '🥩');

        // --- Penalties ---
        this.createEmojiTexture('stone', '💣');
        this.createEmojiTexture('sock', '💣');
        this.createEmojiTexture('spoiled', '💣');

        // --- Power-ups ---
        this.createEmojiTexture('scooter', '🛵');
        this.createEmojiTexture('card', '💳');
        this.createEmojiTexture('magnet', '🧲');
        this.createEmojiTexture('knife', '🔪');

        // Slash Texture
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.lineStyle(4, 0xffffff, 1);
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(100, 0);
        g.strokePath();
        g.generateTexture('slash', 100, 4);
    }

    createEmojiTexture(key, emoji, size = 48) {
        // Create a temporary text object to render the emoji
        const txt = this.make.text({
            x: 0, y: 0,
            text: emoji,
            style: {
                fontSize: `${size}px`,
                fontFamily: 'Arial',
                color: '#ffffff'
            },
            add: false
        });

        // Use the texture manager to add the canvas from the text object as a texture
        // This is the correct way in Phaser 3 to turn text/canvas into a reusable texture key
        this.textures.addCanvas(key, txt.canvas);

        // Destroy the temporary text object
        txt.destroy();
    }
}

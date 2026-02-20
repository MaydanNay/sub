import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // No external assets
    }

    create() {
        this.createPlaceholderAssets();
        this.scene.start('MainScene');
    }

    createPlaceholderAssets() {
        // 1. Create a 4x4 white pixel for particles
        const pixel = this.make.graphics({ x: 0, y: 0, add: false });
        pixel.fillStyle(0xffffff, 1);
        pixel.fillRect(0, 0, 4, 4);
        pixel.generateTexture('particle', 4, 4);

        // 2. Player (Clean Circle)
        const radius = 32;
        const pSize = radius * 2;
        const pG = this.make.graphics({ x: 0, y: 0, add: false });

        // Shadow/Outer
        pG.fillStyle(0x00aa00, 1);
        pG.fillCircle(radius, radius, radius);
        // Inner Circle
        pG.fillStyle(0x00ff00, 1);
        pG.fillCircle(radius, radius, radius * 0.9);

        // Sunglasses
        pG.fillStyle(0x000000, 1);
        pG.fillRect(radius - 12, radius - 10, 24, 6);
        pG.fillStyle(0x333333, 1);
        pG.fillRect(radius - 10, radius - 9, 6, 2);

        pG.generateTexture('player', pSize, pSize);

        // 3. Ground (Asphalt with texture)
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x333333, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x444444, 1);
        for (let i = 0; i < 4; i++) {
            g.fillRect(Phaser.Math.Between(0, 28), Phaser.Math.Between(0, 28), 4, 4);
        }
        g.generateTexture('ground', 32, 32);

        // 4. Backgrounds
        this.createSolidTexture('bg-astana', 0x000022, 800, 450);
        this.createSolidTexture('bg-almaty', 0x221100, 800, 450);
        this.createSolidTexture('bg-shymkent', 0x442200, 800, 450);

        // 5. Collectibles (Juicy Orbs)
        this.createJuicyOrb('cola', 0xff0000); // Red for Salam Cola
        this.createJuicyOrb('booster-jump', 0x00ffff); // Cyan for Double Jump
        this.createJuicyOrb('ticket', 0x00ff00);
        this.createJuicyOrb('kurt', 0xeeeeee);
        this.createJuicyOrb('apple', 0xffcc00); // Yellow for Gold Apple (Heal)

        // 6. Projectiles (Bottle Caps)
        const cap = this.make.graphics({ x: 0, y: 0, add: false });
        cap.fillStyle(0x333333, 1); // Dark metal
        cap.fillCircle(8, 8, 8);
        cap.fillStyle(0xff0000, 1); // Salam Red center
        cap.fillCircle(8, 8, 5);
        cap.generateTexture('cap', 16, 16);

        // 7. Enemies (Shadowed Blocks)
        this.createPolishedEnemy('enemy', 0x444444, 32, 32);
        this.createPolishedEnemy('drone', 0x555555, 32, 20);
        this.createPolishedEnemy('bureaucrat', 0x222222, 32, 48);

        // Bosses (More detailed)
        this.createPolishedEnemy('boss-rent', 0xff00ff, 80, 80); // Pink for Rent Boss
        this.createBossWind('boss-wind');
        this.createJuicyOrb('boss-heat', 0xff4400, 60);
    }

    createBossWind(key) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xeeeeee, 0.5);
        g.fillCircle(40, 40, 40);
        g.lineStyle(4, 0x88ccff, 1);
        g.strokeCircle(40, 40, 30);
        g.generateTexture(key, 80, 80);
    }

    createSolidTexture(key, color, width, height) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.generateTexture(key, width, height);
    }

    createJuicyOrb(key, color, radius = 16) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(color, 0.3);
        g.fillCircle(radius, radius, radius);
        g.fillStyle(color, 1);
        g.fillCircle(radius, radius, radius * 0.8);
        g.fillStyle(0xffffff, 0.5);
        g.fillCircle(radius * 0.7, radius * 0.7, radius * 0.3);
        g.generateTexture(key, radius * 2, radius * 2);
    }

    createPolishedEnemy(key, color, width, height) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(color, 1);
        g.fillRect(0, 0, width, height);
        g.fillStyle(0x000000, 0.2);
        g.fillRect(width - 4, 0, 4, height);
        g.fillRect(0, height - 4, width, 4);

        g.fillStyle(0xffffff, 1);
        g.fillRect(4, 6, 8, 8);
        g.fillRect(width - 12, 6, 8, 8);
        g.fillStyle(0x000000, 1);
        g.fillRect(6, 8, 4, 4);
        g.fillRect(width - 10, 8, 4, 4);

        g.fillStyle(0x000000, 1);
        g.beginPath();
        g.moveTo(2, 4); g.lineTo(12, 8); g.lineTo(12, 10); g.lineTo(2, 6);
        g.fillPath();
        g.beginPath();
        g.moveTo(width - 2, 4); g.lineTo(width - 12, 8); g.lineTo(width - 12, 10); g.lineTo(width - 2, 6);
        g.fillPath();

        g.generateTexture(key, width, height);
    }
}

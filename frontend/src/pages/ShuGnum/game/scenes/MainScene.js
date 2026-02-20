import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.score = 0;
        this.scoreMultiplierValue = 1; // For Magnum Card
        this.combo = 0;
        this.comboResetTimer = null;
        this.totalCutCount = 0;
        this.saladWeight = 0; // grams
        this.isGameOver = false;
        this.timeLeft = 60;
        this.isPaused = false;
        this.slashRadius = 20; // Default radius for cuts
        this.isMagnetActive = false;
        this.sessionLog = []; // TЗ Section 4: Anti-cheat log
        this.slashPoints = [];
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 1);

        // Watermark Logo
        const logo = this.add.image(width / 2, height / 2, 'logo');
        logo.setAlpha(0.05);
        logo.setScale(4); // Increased scale for the new small SVG

        // Groups
        this.items = this.physics.add.group();

        // Slash Graphics
        this.slashGraphics = this.add.graphics();
        this.slashGraphics.setDepth(100);

        // Inputs
        this.input.on('pointermove', this.handlePointerMove, this);
        this.input.on('pointerup', () => { this.slashPoints = []; this.slashGraphics.clear(); }, this);

        // Spawn Timer
        this.spawnTimer = this.time.addEvent({
            delay: 1000,
            callback: this.spawnBatch,
            callbackScope: this,
            loop: true
        });

        // Game Timer
        this.time.addEvent({
            delay: 1000,
            callback: () => { if (this.timeLeft > 0) this.timeLeft--; else this.endGame(); },
            callbackScope: this,
            loop: true
        });
    }

    spawnBatch() {
        const count = Phaser.Math.Between(2, 5);
        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * 200, () => this.spawnItem());
        }
    }

    spawnItem() {
        const { width, height } = this.scale;
        const x = Phaser.Math.Between(50, width - 50);
        const y = height + 50;

        const types = ['potato', 'carrot', 'egg', 'sausage', 'cucumber', 'peas', 'stone', 'sock', 'spoiled', 'mayo', 'kazy', 'scooter', 'knife'];
        const weights = [15, 15, 15, 15, 15, 10, 5, 3, 2, 2, 1, 1, 1];
        const key = this.weightedRandom(types, weights);

        const item = this.items.create(x, y, key);
        item.setCircle(item.width / 2);

        const velocityX = (width / 2 - x) * 0.5 + Phaser.Math.Between(-50, 50);
        const velocityY = -Phaser.Math.Between(600, 800);

        item.setVelocity(velocityX, velocityY);
        item.setAngularVelocity(Phaser.Math.Between(-200, 200));
    }

    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((acc, w) => acc + w, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < items.length; i++) {
            if (random < weights[i]) return items[i];
            random -= weights[i];
        }
    }

    handlePointerMove(pointer) {
        if (!pointer.isDown) return;

        this.slashPoints.push({ x: pointer.x, y: pointer.y, t: this.time.now });
        if (this.slashPoints.length > 10) this.slashPoints.shift();

        this.drawSlash();
        this.checkCuts(pointer);

        // Combo Reset
        if (this.comboResetTimer) this.comboResetTimer.destroy();
        this.comboResetTimer = this.time.delayedCall(300, () => {
            if (this.combo > 1) this.trackEvent('combo_finished', { count: this.combo });
            this.combo = 0;
        });
    }

    drawSlash() {
        this.slashGraphics.clear();
        if (this.slashPoints.length < 2) return;

        this.slashGraphics.lineStyle(4, 0xEE1C25, 1);
        this.slashGraphics.beginPath();
        this.slashGraphics.moveTo(this.slashPoints[0].x, this.slashPoints[0].y);
        for (let i = 1; i < this.slashPoints.length; i++) {
            this.slashGraphics.lineTo(this.slashPoints[i].x, this.slashPoints[i].y);
        }
        this.slashGraphics.strokePath();
    }

    checkCuts(pointer) {
        this.items.getChildren().forEach(item => {
            const dist = Phaser.Math.Distance.Between(item.x, item.y, pointer.x, pointer.y);
            // TЗ: Chef Knife doubles the radius
            if (dist < this.slashRadius) {
                this.slashItem(item);
            }
        });
    }

    slashItem(item) {
        const key = item.texture.key;
        const distToCenter = Phaser.Math.Distance.Between(item.x, item.y, this.input.activePointer.x, this.input.activePointer.y);
        const isIdeal = distToCenter < 10;

        // Security Log entry
        this.sessionLog.push({
            t: this.time.now,
            item: key,
            x: item.x,
            y: item.y,
            ideal: isIdeal
        });

        if (['stone', 'sock', 'spoiled'].includes(key)) {
            this.handlePenalty(key);
        } else if (['scooter', 'knife', 'card', 'magnet'].includes(key)) {
            this.handlePowerup(key);
        } else {
            this.handleScore(key, item.x, item.y, isIdeal);
        }

        item.destroy();
    }

    handleScore(key, x, y, isIdeal) {
        this.combo++;
        this.totalCutCount++;

        let base = 10;
        if (key === 'mayo' || key === 'kazy') base = 50;

        // TЗ Section 2: Ideal cut bonus
        let bonus = isIdeal ? 5 : 0;

        // TЗ Section 2: Combo multiplier x2 if 3+ items
        let multiplier = this.combo >= 3 ? 2 : 1;

        // TЗ Section 2: Magnum Card x2 multiplier
        const finalScore = (base + bonus) * multiplier * this.scoreMultiplierValue;
        this.score += finalScore;
        this.saladWeight += 100; // 100g per item

        // Floating text with Combo info
        const displayTxt = multiplier > 1 ? `COMBO x${this.combo}! +${finalScore}` : (isIdeal ? `IDEAL! +${finalScore}` : `+${finalScore}`);
        const txt = this.add.text(x, y, displayTxt, {
            fontSize: isIdeal ? '24px' : '20px',
            fontStyle: 'black italic',
            fill: multiplier > 1 ? '#EE1C25' : '#EE1C25',
            stroke: '#fff',
            strokeThickness: 3
        });
        this.tweens.add({ targets: txt, y: y - 80, alpha: 0, duration: 800, onComplete: () => txt.destroy() });

        if (this.saladWeight >= 10000) this.events.emit('basin_filled');

        // Full-screen Combo Effects
        if (this.combo >= 5 && this.combo % 5 === 0) {
            this.showFullScreenEffect(
                this.combo >= 10 ? 'SUPER COMBO!' : 'GREAT COMBO!',
                0xffcc00,
                this.combo >= 10 ? '🔥' : '✨'
            );
        } else if (isIdeal) {
            this.showEmotion('😎');
        }
    }

    handlePenalty(key) {
        // TЗ Section 2: Exact values
        let penalty = 20;
        if (key === 'spoiled') penalty = 15;
        if (key === 'sock') penalty = 10;

        this.score = Math.max(0, this.score - penalty);

        if (key === 'stone' || key === 'sock' || key === 'spoiled') {
            this.showFullScreenEffect('БАБАХ!', 0xff0000, '💥');
        }

        if (key === 'stone') this.timeLeft = Math.max(0, this.timeLeft - 5);
        if (key === 'sock') this.applyBlur();

        this.cameras.main.shake(300, 0.04);
    }

    applyBlur() {
        // Mock blur visual
        const overlay = this.add.rectangle(180, 320, 360, 640, 0xffffff, 0.3);
        this.time.delayedCall(3000, () => overlay.destroy());
    }

    handlePowerup(key) {
        if (key === 'scooter') {
            this.physics.world.timeScale = 2; // slow mo (timeScale 2 means 1/2 speed)
            this.time.delayedCall(10000, () => this.physics.world.timeScale = 1);
        } else if (key === 'card') {
            this.scoreMultiplierValue = 2;
            this.time.delayedCall(10000, () => this.scoreMultiplierValue = 1);
        } else if (key === 'knife') {
            this.slashRadius = 40; // Double radius
            this.time.delayedCall(10000, () => this.slashRadius = 20);
        } else if (key === 'magnet') {
            this.isMagnetActive = true;
            this.time.delayedCall(8000, () => this.isMagnetActive = false);
        }
    }

    update() {
        this.items.getChildren().forEach(item => {
            if (item.y > this.scale.height + 100) item.destroy();

            // Magnet Logic
            if (this.isMagnetActive && item.active && !['stone', 'sock', 'spoiled'].includes(item.texture.key)) {
                this.physics.moveTo(item, this.scale.width / 2, this.scale.height / 2, 400);
            }
        });
    }

    endGame() {
        console.log('[SECURITY] Session Log for validation:', this.sessionLog);
        this.isGameOver = true;
        this.physics.pause();
        this.events.emit('game_over', { score: this.score, weight: this.saladWeight });
        this.trackEvent('round_finished', { score: this.score, weight: this.saladWeight });
    }

    showFullScreenEffect(message, color, emoji) {
        const { width, height } = this.scale;

        // Flash - Increased alpha for more intensity
        const flash = this.add.rectangle(width / 2, height / 2, width, height, color, 0.6);
        flash.setDepth(1000);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 800,
            onComplete: () => flash.destroy()
        });

        // Text
        const container = this.add.container(width / 2, height / 2).setDepth(1001);
        const emojiTxt = this.add.text(0, -50, emoji, {
            fontSize: '100px',
            padding: { top: 20, bottom: 20, left: 10, right: 10 }
        }).setOrigin(0.5);
        const bannerTxt = this.add.text(0, 50, message, {
            fontSize: '48px',
            fontStyle: 'black italic',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 8
        }).setOrigin(0.5);

        container.add([emojiTxt, bannerTxt]);
        container.setScale(0);

        this.tweens.add({
            targets: container,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(800, () => {
                    this.tweens.add({
                        targets: container,
                        alpha: 0,
                        scale: 1.5,
                        duration: 300,
                        onComplete: () => container.destroy()
                    });
                });
            }
        });
    }

    showEmotion(emoji) {
        const { width, height } = this.scale;
        const txt = this.add.text(width / 2, height / 2, emoji, {
            fontSize: '120px',
            padding: { top: 30, bottom: 30, left: 10, right: 10 }
        })
            .setOrigin(0.5)
            .setDepth(900)
            .setAlpha(0);

        this.tweens.add({
            targets: txt,
            alpha: 0.8,
            scale: { from: 0.5, to: 1.2 },
            duration: 400,
            yoyo: true,
            hold: 200,
            onComplete: () => txt.destroy()
        });
    }

    trackEvent(name, params = {}) {
        console.log(`[ANALYTICS] Tracking: ${name}`, params);
        if (window.gtag) window.gtag('event', name, params);
    }
}

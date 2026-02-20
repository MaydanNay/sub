import Phaser from 'phaser';
import Player from '../entities/Player';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        // Game State
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('shalam_highscore')) || 0;
        this.gameTime = 0;
        this.level = 1;
        this.maxTime = 90; // TЗ: 90 seconds per level
        this.isGameOver = false;
        this.isPlaying = false;
        this.isBossFight = false;
        this.bossHP = 100;
        this.bossMaxHP = 100;

        // Background Layer (Parallax)
        this.bg = this.add.tileSprite(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 'bg-astana').setScrollFactor(0);

        // Environment Details
        this.envGroup = this.add.group();
        this.createEnvironment();

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        this.ground = this.platforms.create(this.scale.width / 2, this.scale.height - 20, 'ground').setScale(this.scale.width / 32 * 2, 2).refreshBody();
        this.ground.setVisible(false);
        this.groundVisual = this.add.tileSprite(this.scale.width / 2, this.scale.height - 10, this.scale.width, 32, 'ground');

        // Player
        this.player = new Player(this, 100, this.scale.height - 150);
        this.player.body.enable = false;

        // Particle Systems
        this.dustEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 40, max: 100 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 500,
            frequency: 100,
            angle: { min: 140, max: 220 },
            emitting: false
        });

        this.hitEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 100, max: 200 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            gravityY: 300,
            emitting: false
        });

        // Inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.addPointer(1);

        this.input.on('pointerdown', () => {
            if (!this.isPlaying && !this.isGameOver) {
                this.startGame();
                return;
            }
            if (this.isGameOver) {
                this.scene.restart();
                return;
            }
            this.player.isHolding = true;
            this.player.jump();
        });

        this.input.on('pointerup', () => {
            this.player.isHolding = false;
        });

        // Groups
        this.enemies = this.physics.add.group();
        this.collectibles = this.physics.add.group();
        this.projectiles = this.physics.add.group();
        this.bossProjectiles = this.physics.add.group();

        // Colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.collectibles, this.platforms);

        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemyProjectile, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.collectibles, this.collectItem, null, this);
        this.physics.add.overlap(this.player, this.bossProjectiles, this.hitEnemy, null, this);

        // UI
        this.createUI();

        // Timers
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true,
            paused: true
        });

        this.spawnEvent = this.time.addEvent({
            delay: 1800,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true,
            paused: true
        });

        this.physics.world.setBounds(0, 0, 1000000, this.scale.height);
    }

    startGame() {
        this.isPlaying = true;
        this.player.body.enable = true;
        this.gameTimer.paused = false;
        this.spawnEvent.paused = false;
        this.startText.setVisible(false);
        this.controlsText.setVisible(false);
        this.dustEmitter.start();
        this.trackEvent('game_start');
    }

    createEnvironment() {
        for (let i = 0; i < 5; i++) {
            this.spawnEnvironmentDetail(Phaser.Math.Between(0, this.scale.width));
        }
    }

    spawnEnvironmentDetail(x = this.scale.width + 50) {
        const y = Phaser.Math.Between(50, 200);
        const detail = this.add.circle(x, y, Phaser.Math.Between(10, 30), 0xffffff, 0.3);
        this.envGroup.add(detail);
        this.tweens.add({
            targets: detail,
            x: -100,
            duration: Phaser.Math.Between(10000, 20000),
            onComplete: () => detail.destroy()
        });
    }

    update(time, delta) {
        if (!this.isPlaying || this.isGameOver) {
            this.dustEmitter.stop();
            return;
        }

        // Scroll
        const speed = this.isBossFight ? 0 : (2 + (this.level * 0.5));
        this.bg.tilePositionX += speed;
        this.groundVisual.tilePositionX += speed;

        this.player.update(this.cursors, time);

        if (this.player.body.blocked.down) {
            this.dustEmitter.emitParticleAt(this.player.x - 10, this.player.y + 20);
        }

        if (this.player.isHolding) {
            this.player.shoot();
        }

        // Cleanup
        this.enemies.getChildren().forEach(e => { if (e.x < -100) e.destroy() });
        this.projectiles.getChildren().forEach(p => { if (p.x > this.scale.width + 50) p.destroy() });

        // Level Logic
        if (this.gameTime >= this.maxTime && !this.isBossFight) {
            this.startBossFight();
        }

        if (this.isBossFight && this.boss) {
            this.updateBossAI();
        }
    }

    startBossFight() {
        this.isBossFight = true;
        this.spawnEvent.paused = true;
        this.trackEvent(`boss_fight_start_level_${this.level}`);

        const bossKey = this.level === 1 ? 'boss-wind' : this.level === 2 ? 'boss-rent' : 'boss-heat';
        this.boss = this.physics.add.sprite(this.scale.width + 100, 150, bossKey);
        this.boss.setImmovable(true);
        this.boss.body.allowGravity = false;

        this.tweens.add({
            targets: this.boss,
            x: this.scale.width - 150,
            duration: 2000,
            ease: 'Power2'
        });

        // Boss UI
        this.bossBarBackground = this.add.rectangle(this.scale.width / 2, 60, 400, 20, 0x333333).setScrollFactor(0);
        this.bossBar = this.add.rectangle(this.scale.width / 2 - 200, 60, 400, 20, 0xff0000).setOrigin(0, 0.5).setScrollFactor(0);
        this.bossNameText = this.add.text(this.scale.width / 2, 40, this.level === 1 ? 'МИСТЕР ВЕТЕР' : 'АРЕНДОДАТЕЛЬ', { fontSize: '14px', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);

        // Overlap for boss hits
        this.physics.add.overlap(this.projectiles, this.boss, this.hitBoss, null, this);
    }

    updateBossAI() {
        // Floating movement
        this.boss.y = 150 + Math.sin(this.time.now / 400) * 50;

        // Shooting / Vortices
        if (this.time.now % 1500 < 20) {
            const key = this.level === 1 ? 'particle' : 'cap'; // Particle for 'vortex' feel
            const p = this.bossProjectiles.create(this.boss.x, this.boss.y, key);

            if (this.level === 1) {
                // Vortices pattern (spiral)
                p.setTint(0x88ccff);
                p.setScale(2);
                this.physics.moveToObject(p, this.player, 250);
                this.tweens.add({
                    targets: p,
                    angle: 360,
                    duration: 500,
                    repeat: -1
                });
            } else {
                this.physics.moveToObject(p, this.player, 300);
                p.setTint(0xff00ff);
            }
        }
    }

    hitBoss(projectile, boss) {
        projectile.destroy();
        this.explode(projectile.x, projectile.y, 0xffffff);
        this.bossHP -= 2;
        this.updateBossBar();

        if (this.bossHP <= 0) {
            this.bossDefeated();
        }
    }

    updateBossBar() {
        const width = (this.bossHP / this.bossMaxHP) * 400;
        this.bossBar.width = Math.max(0, width);
    }

    bossDefeated() {
        this.explode(this.boss.x, this.boss.y, 0xffff00);
        this.boss.destroy();
        this.bossBar.destroy();
        this.bossBarBackground.destroy();
        this.bossNameText.destroy();

        this.score += 5000;
        this.updateScoreUI();

        if (this.level < 3) {
            this.trackEvent(`level_${this.level}_complete`);
            this.changeLevel(this.level + 1);
        } else {
            this.trackEvent(`level_3_complete`);
            this.victory();
        }
    }

    createUI() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#FFF', stroke: '#000', strokeThickness: 3 });
        this.highScoreText = this.add.text(16, 100, 'High: ' + this.highScore, { fontSize: '16px', fill: '#FFFF00', stroke: '#000', strokeThickness: 1 });
        this.timeText = this.add.text(width - 16, 16, 'Time: 90s', { fontSize: '24px', fill: '#FFF', stroke: '#000', strokeThickness: 3 }).setOrigin(1, 0);
        this.levelText = this.add.text(width / 2, 16, 'АСТАНА', { fontSize: '20px', fontStyle: 'black italic', fill: '#00FFFF', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5, 0);

        // Health Hearts
        this.healthText = this.add.text(16, 50, '❤❤❤', { fontSize: '30px', fill: '#FF0000' });

        this.startText = this.add.text(width / 2, height / 2, 'НАЧАТЬ МИССИЮ', { fontSize: '42px', fontStyle: 'black italic', fill: '#FF0000', stroke: '#FFF', strokeThickness: 3 }).setOrigin(0.5);
        this.controlsText = this.add.text(width / 2, height / 2 + 60, 'Прыжок: Тап | Стрельба: Зажатие', { fontSize: '18px', fill: '#FFF' }).setOrigin(0.5);
    }

    updateTimer() {
        if (this.isBossFight) return;
        this.gameTime++;
        this.timeText.setText('Time: ' + (this.maxTime - this.gameTime) + 's');
        this.score += 10;
        this.updateScoreUI();
    }

    spawnObstacle() {
        const width = this.scale.width;
        const height = this.scale.height;
        const spawnX = width + 50;
        const type = Phaser.Math.Between(0, 100);

        if (type < 70) {
            const enemyType = Phaser.Math.Between(0, 2);
            let key = 'enemy';
            if (enemyType === 1) key = 'drone';
            if (enemyType === 2) key = 'bureaucrat';

            const enemy = this.enemies.create(spawnX, height - 100, key);
            enemy.setVelocityX(-300 - (this.level * 50));
            enemy.allowGravity = true;
            if (key === 'drone') {
                enemy.y = height - Phaser.Math.Between(200, 300);
                enemy.allowGravity = false;
            }
        } else {
            const itemType = Phaser.Math.Between(0, 4);
            let key = 'cola';
            if (itemType === 1) key = 'booster-jump';
            if (itemType === 2) key = 'ticket';
            if (itemType === 3) key = 'kurt';
            if (itemType === 4) key = 'apple';

            const item = this.collectibles.create(spawnX, key === 'apple' ? height - 100 : height - 150, key);
            item.setVelocityX(-300);
            item.allowGravity = key === 'apple';
        }
    }

    hitEnemy(player, enemy) {
        if (this.player.invincible) return;
        this.explode(enemy.x, enemy.y, 0xff0000);
        enemy.destroy();
        player.takeDamage();
        this.updateHealthUI();
    }

    hitEnemyProjectile(projectile, enemy) {
        this.explode(enemy.x, enemy.y, 0xffffff);
        projectile.destroy();
        enemy.destroy();
        this.score += 50;
        this.updateScoreUI();
    }

    explode(x, y, color) {
        this.hitEmitter.setParticleTint(color);
        this.hitEmitter.explode(10, x, y);
    }

    collectItem(player, item) {
        const key = item.texture.key;
        this.explode(item.x, item.y, 0x00ff00);
        item.destroy();
        this.score += 100;
        this.updateScoreUI();

        if (key === 'cola') {
            player.invincible = true;
            player.setTint(0xFFA500);
            this.time.delayedCall(8000, () => {
                if (player.active) {
                    player.invincible = false;
                    player.clearTint();
                }
            });
        } else if (key === 'booster-jump') {
            player.canDoubleJump = true;
            player.setTint(0x00FFFF);
            this.time.delayedCall(15000, () => {
                if (player.active) {
                    player.canDoubleJump = false;
                    player.clearTint();
                }
            });
        }
        else if (key === 'ticket') player.activateJetpack();
        else if (key === 'kurt') player.activateShield();
        else if (key === 'apple') {
            player.heal();
            this.updateHealthUI();
        }
    }

    updateHealthUI() {
        let hearts = '';
        for (let i = 0; i < this.player.health; i++) hearts += '❤';
        this.healthText.setText(hearts);
    }

    updateScoreUI() {
        this.scoreText.setText('Score: ' + this.score);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreText.setText('High: ' + this.highScore);
            localStorage.setItem('shalam_highscore', this.highScore);
        }
    }

    changeLevel(newLevel) {
        this.isBossFight = false;
        this.level = newLevel;
        this.gameTime = 0;
        this.bossHP = 100 + (newLevel * 20);
        this.bossMaxHP = this.bossHP;
        this.spawnEvent.paused = false;

        this.cameras.main.flash(500, 255, 255, 255);
        if (newLevel === 2) {
            this.bg.setTexture('bg-almaty');
            this.levelText.setText('AЛMАТЫ: ПРОБКИ').setFill('#FF9900');
        } else if (newLevel === 3) {
            this.bg.setTexture('bg-shymkent');
            this.levelText.setText('ШЫMKЕНТ: +45°C').setFill('#FF4400');
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();
        this.gameTimer.paused = true;
        this.spawnEvent.paused = true;
        const width = this.scale.width;
        const height = this.scale.height;
        this.add.rectangle(width / 2, height / 2, width * 0.8, 200, 0x000000, 0.8);
        this.add.text(width / 2, height / 2 - 40, 'ОЙБАЙ! МИССИЯ ПРОВАЛЕНА', { fontSize: '32px', fontStyle: 'black italic', fill: '#FF0000' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 40, 'Тапните для рестарта', { fontSize: '20px', fill: '#FFF' }).setOrigin(0.5);
    }

    victory() {
        this.trackEvent('game_victory');
        this.isGameOver = true;
        this.physics.pause();
        this.gameTimer.paused = true;
        this.spawnEvent.paused = true;
        const width = this.scale.width;
        const height = this.scale.height;
        this.add.rectangle(width / 2, height / 2, width * 0.8, 200, 0x000000, 0.8);
        this.add.text(width / 2, height / 2 - 40, 'ПОБЕДА! КАЗАХСТАН СПАСЕН', { fontSize: '32px', fontStyle: 'black italic', fill: '#00FF00' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 20, 'ПРОМОКОД: SALAM007', { fontSize: '24px', fill: '#FFFF00' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 60, 'Тапните для рестарта', { fontSize: '16px', fill: '#FFF' }).setOrigin(0.5);
        this.trackEvent('promocode_claimed', { code: 'SALAM007' });
    }

    trackEvent(name, params = {}) {
        console.log(`[ANALYTICS] Tracking: ${name}`, params);
        // Integrate with Firebase/GA as per TЗ Section 5
        if (window.gtag) window.gtag('event', name, params);
    }
}

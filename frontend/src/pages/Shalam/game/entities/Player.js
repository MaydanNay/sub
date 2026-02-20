import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setGravityY(1200);
        this.setCircle(28, 4, 4);

        this.jumpCount = 0;
        this.canDoubleJump = false; // TЗ: opens only with booster
        this.isJumping = false;

        this.lastFired = 0;
        this.isHolding = false;

        this.isJetpackActive = false;
        this.hasShield = false;

        this.health = 3;
        this.invincible = false;

        this.bubbleWidth = 160;
        this.bubbleHeight = 80;
        this.bubblePadding = 10;

        this.bubbleGroup = scene.add.group();
        this.bubbleGraphics = scene.add.graphics();
        this.bubbleGroup.add(this.bubbleGraphics);

        this.bubbleText = scene.add.text(0, 0, 'Тут будет\nваше лого', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#000000',
            align: 'center',
            wordWrap: { width: this.bubbleWidth - (this.bubblePadding * 2) }
        });
        this.bubbleText.setOrigin(0.5);
        this.bubbleGroup.add(this.bubbleText);

        this.drawBubble();
        this.initAnimations();
    }

    drawBubble() {
        const pointSize = 15;
        const x = -this.bubbleWidth / 2;
        const y = -this.bubbleHeight - pointSize;

        this.bubbleGraphics.clear();
        this.bubbleGraphics.fillStyle(0xffffff, 0.95);
        this.bubbleGraphics.fillRoundedRect(x, y, this.bubbleWidth, this.bubbleHeight, 12);
        this.bubbleGraphics.lineStyle(3, 0x000000, 1);
        this.bubbleGraphics.strokeRoundedRect(x, y, this.bubbleWidth, this.bubbleHeight, 12);

        this.bubbleGraphics.beginPath();
        this.bubbleGraphics.moveTo(-pointSize / 2, -pointSize);
        this.bubbleGraphics.lineTo(pointSize / 2, -pointSize);
        this.bubbleGraphics.lineTo(0, 0);
        this.bubbleGraphics.closePath();
        this.bubbleGraphics.fillPath();
        this.bubbleGraphics.strokePath();
    }

    initAnimations() {
        this.cheatBuffer = '';
        this.scene.input.keyboard.on('keydown', (event) => {
            if (/^[a-zA-Z]$/.test(event.key)) {
                this.cheatBuffer += event.key.toUpperCase();
                if (this.cheatBuffer.length > 7) {
                    this.cheatBuffer = this.cheatBuffer.substr(this.cheatBuffer.length - 7);
                }
                if (this.cheatBuffer === 'AGASHKA') {
                    console.log('CHEAT ACTIVATED: AGASHKA MODE');
                    this.invincible = true;
                    this.setTint(0xFFD700);
                    this.scene.add.text(this.x, this.y - 180, 'AGASHKA MODE', { fontSize: '24px', fill: '#FFD700' }).setOrigin(0.5);
                }
            }
        });
    }

    update(cursors, time) {
        const bubbleY = this.y - 65;
        this.bubbleGraphics.setPosition(this.x, bubbleY);
        this.bubbleText.setPosition(this.x, bubbleY - (this.bubbleHeight / 2) - 15);
        this.bubbleGraphics.setDepth(2000);
        this.bubbleText.setDepth(2001);

        if (this.isJetpackActive) {
            this.setVelocityY(-250);
            if (cursors.down.isDown) this.setVelocityY(250);
            else if (!cursors.up.isDown && !cursors.space.isDown && !this.scene.input.activePointer.isDown) this.setVelocityY(0);
            return;
        }

        const onGround = this.body.blocked.down || this.body.touching.down;
        if (onGround) {
            if (this.isJumping) this.onLand();
            this.jumpCount = 0;
            this.isJumping = false;
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(cursors.space)) {
            this.jump();
        }
    }

    jump() {
        if (this.isJetpackActive) return;
        const onGround = this.body.blocked.down || this.body.touching.down;
        if (onGround) {
            this.setVelocityY(-550);
            this.jumpCount = 1;
            this.isJumping = true;
            this.squashAndStretch(0.8, 1.2);
        } else if (this.jumpCount < 2 && this.canDoubleJump) {
            this.setVelocityY(-450);
            this.jumpCount = 2;
            this.squashAndStretch(0.7, 1.3);
        }
    }

    onLand() {
        this.squashAndStretch(1.4, 0.6);
    }

    squashAndStretch(sx, sy) {
        this.scene.tweens.add({
            targets: this,
            scaleX: sx,
            scaleY: sy,
            duration: 100,
            yoyo: true,
            onComplete: () => { if (this.active) this.setScale(1); }
        });

        this.scene.tweens.add({
            targets: this.bubbleGraphics,
            scaleX: sx,
            scaleY: sy,
            duration: 100,
            yoyo: true
        });
    }

    shoot() {
        const now = this.scene.time.now;
        if (now - this.lastFired < 100) return;
        this.lastFired = now;

        const cap = this.scene.physics.add.image(this.x + 30, this.y, 'cap');
        cap.setVelocityX(1200); // Faster, more snappy
        cap.setAngularVelocity(1000); // Spinning cap
        cap.body.allowGravity = false;

        this.scene.projectiles.add(cap);

        // Recoil effect
        this.scene.tweens.add({
            targets: this,
            x: this.x - 10,
            duration: 50,
            yoyo: true
        });
    }

    takeDamage() {
        if (this.invincible) return;
        if (this.hasShield) {
            this.hasShield = false;
            this.clearTint();
            this.scene.cameras.main.flash(200, 255, 255, 255);
            return;
        }
        this.health--;
        this.invincible = true;
        this.scene.cameras.main.shake(100, 0.02);
        this.setTint(0xff0000);
        this.scene.time.delayedCall(1000, () => {
            if (!this.active) return;
            this.invincible = false;
            this.clearTint();
            if (this.isJetpackActive) this.setTint(0x00FFFF);
        });
        if (this.health <= 0) {
            this.bubbleGroup.setVisible(false);
            this.scene.gameOver();
        }
    }

    activateJetpack() {
        this.isJetpackActive = true;
        this.body.allowGravity = false;
        this.setVelocityY(0);
        this.setTint(0x00FFFF);
        this.scene.time.delayedCall(5000, () => {
            if (!this.active) return;
            this.isJetpackActive = false;
            this.body.allowGravity = true;
            this.clearTint();
        });
    }

    activateShield() {
        this.hasShield = true;
        this.setTint(0x888888);
    }

    heal() {
        this.health = Math.min(this.health + 1, 3);
    }
}

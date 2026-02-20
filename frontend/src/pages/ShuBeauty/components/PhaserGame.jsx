import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const ShuBeautyPhaser = ({ character, onGameOver, onScoreUpdate }) => {
    const gameContainerRef = useRef(null);
    const gameInstanceRef = useRef(null);

    useEffect(() => {
        if (!gameContainerRef.current) return;

        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth > 480 ? 400 : window.innerWidth,
            height: window.innerHeight > 800 ? 600 : window.innerHeight * 0.7,
            parent: gameContainerRef.current,
            backgroundColor: '#fdf2f8', // pink-50
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: {
                preload: preload,
                create: create,
                update: update
            }
        };

        const game = new Phaser.Game(config);
        gameInstanceRef.current = game;

        // Game State Variables
        let player;
        let cursors;
        let items;
        let obstacles;
        let score = 0;
        let timeLeft = 60;
        let timerEvent;
        let speed = 200;
        let isGameOver = false;

        // Effect flags
        let isSlowed = false;
        let isShielded = false;
        let speedBoost = false;

        function preload() {
            // Textures for Player
            if (!this.textures.exists('player')) {
                const graphics = this.make.graphics().fillStyle(0xff69b4).fillCircle(16, 16, 16);
                graphics.generateTexture('player', 32, 32);
            }
            // Texture for Wall
            if (!this.textures.exists('wall')) {
                const graphics = this.make.graphics().fillStyle(0xdb2777).fillRect(0, 0, 32, 32);
                graphics.generateTexture('wall', 32, 32);
            }

            // Collectibles
            const drawStar = (graphics, cx, cy, spikes, outerRadius, innerRadius) => {
                let rot = Math.PI / 2 * 3;
                let x = cx;
                let y = cy;
                let step = Math.PI / spikes;

                graphics.beginPath();
                graphics.moveTo(cx, cy - outerRadius);
                for (let i = 0; i < spikes; i++) {
                    x = cx + Math.cos(rot) * outerRadius;
                    y = cy + Math.sin(rot) * outerRadius;
                    graphics.lineTo(x, y);
                    rot += step;

                    x = cx + Math.cos(rot) * innerRadius;
                    y = cy + Math.sin(rot) * innerRadius;
                    graphics.lineTo(x, y);
                    rot += step;
                }
                graphics.lineTo(cx, cy - outerRadius);
                graphics.closePath();
                graphics.fillPath();
            };

            const createTexture = (key, color, shape) => {
                if (this.textures.exists(key)) return;
                const g = this.make.graphics().fillStyle(color);
                if (shape === 'circle') g.fillCircle(16, 16, 12);
                else if (shape === 'rect') g.fillRect(8, 8, 16, 16);
                else drawStar(g, 16, 16, 5, 12, 6);
                g.generateTexture(key, 32, 32);
            };

            createTexture('item_lipstick', 0xe11d48, 'rect'); // Red
            createTexture('item_perfume', 0xa855f7, 'circle'); // Purple
            createTexture('item_tulip', 0xf472b6, 'star'); // Pink (Speed)
            createTexture('item_diamond', 0x3b82f6, 'star'); // Blue (Rare)
            createTexture('item_polish', 0xf97316, 'rect'); // Orange
            createTexture('item_sakura', 0xfbcfe8, 'circle'); // Light Pink (Shield)

            // Obstacles
            createTexture('obs_cloud', 0x9ca3af, 'circle'); // Grey (Slow)
            createTexture('obs_alarm', 0xef4444, 'circle'); // Red (Time)
            createTexture('obs_cactus', 0x166534, 'rect'); // Green (Score)
            createTexture('obs_puddle', 0x3b82f6, 'circle'); // Blue (Fog)
            createTexture('obs_phone', 0x1f2937, 'rect'); // Black (Stun)
        }

        function create() {
            // Generate Maze
            const mapData = generateMaze(15, 20);
            const map = this.make.tilemap({ data: mapData, tileWidth: 32, tileHeight: 32 });
            const tiles = map.addTilesetImage('wall');
            const layer = map.createLayer(0, tiles, 0, 0);
            layer.setCollision([1]);

            // Player
            const startPos = findEmptySpot(mapData);
            player = this.physics.add.sprite(startPos.x * 32 + 16, startPos.y * 32 + 16, 'player');
            player.setCollideWorldBounds(true);
            this.physics.add.collider(player, layer);

            // Camera
            this.cameras.main.startFollow(player, true, 0.1, 0.1);
            this.cameras.main.setZoom(1.0);

            // Controls
            cursors = this.input.keyboard.createCursorKeys();
            setupTouchControls.call(this);

            // Items Group
            items = this.physics.add.group();
            spawnItems.call(this, mapData);
            this.physics.add.overlap(player, items, collectItem, null, this);

            // Obstacles Group
            obstacles = this.physics.add.group();
            spawnObstacles.call(this, mapData);
            this.physics.add.overlap(player, obstacles, hitObstacle, null, this);

            // Timer
            timerEvent = this.time.addEvent({
                delay: 1000,
                callback: onTimerTick,
                callbackScope: this,
                loop: true
            });
        }

        function spawnItems(mapData) {
            const itemTypes = [
                { key: 'item_lipstick', score: 100, count: 5 },
                { key: 'item_perfume', score: 200, count: 3 },
                { key: 'item_tulip', score: 50, count: 2 },   // Speed
                { key: 'item_diamond', score: 500, count: 1 }, // Rare
                { key: 'item_polish', score: 150, count: 2 },
                { key: 'item_sakura', score: 80, count: 1 }    // Shield
            ];

            itemTypes.forEach(type => {
                for (let i = 0; i < type.count; i++) {
                    const pos = findEmptySpot(mapData);
                    const item = items.create(pos.x * 32 + 16, pos.y * 32 + 16, type.key);
                    item.setData('score', type.score);
                    item.setData('type', type.key);
                }
            });
        }

        function spawnObstacles(mapData) {
            const obsTypes = [
                { key: 'obs_cloud', count: 3 }, // Slow
                { key: 'obs_alarm', count: 2 }, // Time -10
                { key: 'obs_cactus', count: 3 } // Score -50
            ];

            obsTypes.forEach(type => {
                for (let i = 0; i < type.count; i++) {
                    const pos = findEmptySpot(mapData);
                    const obs = obstacles.create(pos.x * 32 + 16, pos.y * 32 + 16, type.key);
                    obs.setData('type', type.key);

                    // Simple patrol
                    this.tweens.add({
                        targets: obs,
                        x: obs.x + (Math.random() > 0.5 ? 64 : -64),
                        duration: 2000 + Math.random() * 1000,
                        yoyo: true,
                        repeat: -1
                    });
                }
            });
        }

        function update() {
            if (isGameOver) return;

            let currentSpeed = speed;
            if (isSlowed) currentSpeed *= 0.5;
            if (speedBoost) currentSpeed *= 1.2;

            if (cursors.left.isDown) {
                player.setVelocityX(-currentSpeed);
                player.setVelocityY(0);
            } else if (cursors.right.isDown) {
                player.setVelocityX(currentSpeed);
                player.setVelocityY(0);
            } else if (cursors.up.isDown) {
                player.setVelocityY(-currentSpeed);
                player.setVelocityX(0);
            } else if (cursors.down.isDown) {
                player.setVelocityY(currentSpeed);
                player.setVelocityX(0);
            }
        }

        function collectItem(player, item) {
            const itemType = item.getData('type');
            const itemScore = item.getData('score');

            item.disableBody(true, true);
            score += itemScore;

            // Power-ups
            if (itemType === 'item_tulip') { // Speed
                speedBoost = true;
                this.time.delayedCall(5000, () => speedBoost = false);
                showFloatingText.call(this, player.x, player.y, 'Speed UP!', '#f472b6');
            } else if (itemType === 'item_sakura') { // Shield
                isShielded = true;
                player.setTint(0xffd700); // Gold tint
                showFloatingText.call(this, player.x, player.y, 'Shield!', '#fbcfe8');
            } else {
                showFloatingText.call(this, player.x, player.y, `+${itemScore}`, '#fbbf24');
            }

            onScoreUpdate(score);

            if (items.countActive(true) === 0) {
                endGame(true);
            }
        }

        function hitObstacle(player, obstacle) {
            if (isShielded) {
                isShielded = false;
                player.clearTint();
                obstacle.disableBody(true, true); // Remove obstacle if shielded
                showFloatingText.call(this, player.x, player.y, 'Shield Broken!', '#fff');
                return;
            }

            const type = obstacle.getData('type');
            obstacle.disableBody(true, true); // One-time hit mostly

            player.setTint(0xff0000);
            this.time.delayedCall(500, () => {
                if (!isShielded) player.clearTint();
                else player.setTint(0xffd700);
            });

            if (type === 'obs_cloud') { // Slow
                isSlowed = true;
                showFloatingText.call(this, player.x, player.y, 'Slowed!', '#9ca3af');
                this.time.delayedCall(3000, () => isSlowed = false);
            } else if (type === 'obs_alarm') { // Time penalty
                timeLeft = Math.max(0, timeLeft - 10);
                showFloatingText.call(this, player.x, player.y, '-10s', '#ef4444');
            } else if (type === 'obs_cactus') { // Score penalty
                score = Math.max(0, score - 50);
                showFloatingText.call(this, player.x, player.y, '-50 pts', '#166534');
                onScoreUpdate(score);
            }
        }

        function showFloatingText(x, y, message, color) {
            const text = this.add.text(x, y - 20, message, { fontSize: '14px', fill: color, stroke: '#000', strokeThickness: 2 });
            this.tweens.add({ targets: text, y: y - 50, alpha: 0, duration: 1000, onComplete: () => text.destroy() });
        }

        function setupTouchControls() {
            let touchStartX = 0;
            let touchStartY = 0;
            this.input.on('pointerdown', (pointer) => {
                touchStartX = pointer.x;
                touchStartY = pointer.y;
            });
            this.input.on('pointerup', (pointer) => {
                const dx = pointer.x - touchStartX;
                const dy = pointer.y - touchStartY;
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (Math.abs(dx) > 20) {
                        player.setVelocity(dx > 0 ? speed : -speed, 0);
                    }
                } else {
                    if (Math.abs(dy) > 20) {
                        player.setVelocity(0, dy > 0 ? speed : -speed);
                    }
                }
            });
        }

        function onTimerTick() {
            timeLeft--;
            if (timeLeft <= 0) {
                endGame(false);
            }
        }

        function endGame(victory) {
            isGameOver = true;
            timerEvent.remove();
            physicsPaused();
            onGameOver({ score, victory });
        }

        function physicsPaused() {
            if (gameInstanceRef.current?.scene?.scenes[0])
                gameInstanceRef.current.scene.scenes[0].physics.pause();
        }

        function findEmptySpot(mapData) {
            let x, y;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(1, mapData[0].length - 2);
                y = Phaser.Math.Between(1, mapData.length - 2);
                attempts++;
            } while (mapData[y][x] === 1 && attempts < 100);
            return { x, y };
        }

        function generateMaze(rows, cols) {
            // 1 = Wall, 0 = Path
            let maze = Array(rows).fill().map(() => Array(cols).fill(0));
            // Simple random walls for prototype
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
                        maze[y][x] = 1;
                    } else {
                        if (Math.random() > 0.8) maze[y][x] = 1;
                    }
                }
            }
            return maze;
        }

        return () => {
            game.destroy(true);
        };
    }, []);

    return <div ref={gameContainerRef} className="rounded-xl overflow-hidden shadow-inner border-4 border-pink-200" />;
};

export default ShuBeautyPhaser;

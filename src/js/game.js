/**
 * 1942 Game - Vanilla JavaScript Implementation
 * DOM-based rendering with CSS transforms for performance
 */

// Collision detection using AABB (Axis-Aligned Bounding Box)
function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Input Handler Class
class InputHandler {
    constructor() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    isPressed(key) {
        return this.keys[key] === true;
    }
}

// Projectile Class
class Projectile {
    constructor(game, x, y, vy = -8, isEnemy = false) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 12;
        this.vy = vy;
        this.isEnemy = isEnemy;
        this.isMarkedForDeletion = false;
        
        this.element = document.createElement('div');
        this.element.className = isEnemy ? 'enemy-projectile' : 'projectile';
        this.game.gameContainer.appendChild(this.element);
        this.updatePosition();
    }
    
    update() {
        this.y += this.vy;
        
        if (this.y < -20 || this.y > this.game.height + 20) {
            this.markForDeletion();
        }
        
        this.updatePosition();
    }
    
    updatePosition() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
    
    markForDeletion() {
        this.isMarkedForDeletion = true;
        this.element.remove();
    }
}

// Player Class
class Player {
    constructor(game) {
        this.game = game;
        this.width = 30;
        this.height = 30;
        this.x = (game.width - this.width) / 2;
        this.y = game.height - 80;
        this.speed = 4;
        this.projectiles = [];
        this.lastShot = 0;
        this.shootCooldown = 150;
        this.isLooping = false;
        this.loopDuration = 500;
        this.loopStartTime = 0;
        this.powerUpLevel = 0;
        this.options = [];
        
        this.element = document.createElement('div');
        this.element.className = 'player';
        this.game.gameContainer.appendChild(this.element);
        this.updatePosition();
    }
    
    handleInput(input, timestamp) {
        let vx = 0;
        let vy = 0;
        
        if (input.isPressed('ArrowLeft') || input.isPressed('a')) vx -= 1;
        if (input.isPressed('ArrowRight') || input.isPressed('d')) vx += 1;
        if (input.isPressed('ArrowUp') || input.isPressed('w')) vy -= 1;
        if (input.isPressed('ArrowDown') || input.isPressed('s')) vy += 1;
        
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }
        
        this.x += vx * this.speed;
        this.y += vy * this.speed;
        
        this.x = Math.max(0, Math.min(this.x, this.game.width - this.width));
        this.y = Math.max(0, Math.min(this.y, this.game.height - this.height));
        
        if ((input.isPressed(' ')) && !this.isLooping && timestamp - this.lastShot > this.shootCooldown) {
            this.shoot();
            this.lastShot = timestamp;
        }
        
        if (input.isPressed('l') && !this.isLooping && this.game.loopsRemaining > 0) {
            this.startLoop(timestamp);
        }
        
        if (this.isLooping && timestamp - this.loopStartTime > this.loopDuration) {
            this.endLoop();
        }
    }
    
    shoot() {
        if (this.powerUpLevel === 0) {
            this.projectiles.push(new Projectile(this.game, this.x + this.width / 2 - 2, this.y));
        } else {
            this.projectiles.push(new Projectile(this.game, this.x + 5, this.y));
            this.projectiles.push(new Projectile(this.game, this.x + this.width - 9, this.y));
        }
        
        this.options.forEach(option => {
            this.projectiles.push(new Projectile(this.game, option.x + 10, option.y));
        });
    }
    
    startLoop(timestamp) {
        this.isLooping = true;
        this.loopStartTime = timestamp;
        this.game.loopsRemaining--;
        this.game.updateUI();
        this.element.classList.add('looping');
    }
    
    endLoop() {
        this.isLooping = false;
        this.element.classList.remove('looping');
    }
    
    addPowerUp(type) {
        if (type === 'double') {
            this.powerUpLevel = 1;
        } else if (type === 'options') {
            if (this.options.length < 2) {
                const option = {
                    x: this.x - 40 + (this.options.length * 80),
                    y: this.y + 10,
                    element: document.createElement('div')
                };
                option.element.className = 'option';
                this.game.gameContainer.appendChild(option.element);
                this.options.push(option);
            }
        }
    }
    
    update(timestamp) {
        this.projectiles.forEach(p => p.update());
        this.projectiles = this.projectiles.filter(p => !p.isMarkedForDeletion);
        
        this.options.forEach(option => {
            option.x = this.x - 40 + (this.options.indexOf(option) * 80);
            option.y = this.y + 10;
            option.element.style.transform = `translate(${option.x}px, ${option.y}px)`;
        });
        
        this.updatePosition();
    }
    
    updatePosition() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
    
    hit() {
        if (!this.isLooping) {
            this.game.loseLife();
            this.createExplosion(this.x, this.y);
        }
    }
    
    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.transform = `translate(${x}px, ${y}px)`;
        this.game.gameContainer.appendChild(explosion);
        setTimeout(() => explosion.remove(), 300);
    }
    
    reset() {
        this.x = (this.game.width - this.width) / 2;
        this.y = this.game.height - 80;
        this.updatePosition();
    }
}

// Enemy Class
class Enemy {
    constructor(game, x, y, type = 'small', formationType = 'normal') {
        this.game = game;
        this.type = type;
        this.formationType = formationType;
        this.width = type === 'small' ? 25 : type === 'medium' ? 35 : 45;
        this.height = this.width;
        this.x = x;
        this.y = y;
        this.baseSpeed = type === 'small' ? 1.5 : type === 'medium' ? 1.2 : 1;
        this.health = type === 'small' ? 1 : type === 'medium' ? 2 : 3;
        this.score = type === 'small' ? 50 : type === 'medium' ? 100 : 200;
        this.isMarkedForDeletion = false;
        this.shootTimer = 0;
        this.shootInterval = 2000 + Math.random() * 2000;
        this.angle = 0;
        this.centerX = x;
        this.amplitude = 30;
        
        this.element = document.createElement('div');
        this.element.className = 'enemy';
        if (type === 'medium') this.element.classList.add('type-medium');
        if (type === 'large') this.element.classList.add('type-large');
        if (formationType === 'red') this.element.classList.add('red-formation');
        this.game.gameContainer.appendChild(this.element);
        this.updatePosition();
    }
    
    update(deltaTime) {
        this.angle += 0.03;
        this.x = this.centerX + Math.sin(this.angle) * this.amplitude;
        this.y += this.baseSpeed;
        
        this.shootTimer += deltaTime;
        if (this.shootTimer > this.shootInterval && this.y > 50 && this.y < this.game.height - 100) {
            this.shoot();
            this.shootTimer = 0;
        }
        
        if (this.y > this.game.height + 20) {
            this.markForDeletion();
        }
        
        this.updatePosition();
    }
    
    shoot() {
        this.game.enemyProjectiles.push(
            new Projectile(this.game, this.x + this.width / 2 - 2, this.y + this.height, 5, true)
        );
    }
    
    hit() {
        this.health--;
        if (this.health <= 0) {
            this.game.addScore(this.score);
            this.createExplosion();
            this.markForDeletion();
            return true;
        }
        return false;
    }
    
    createExplosion() {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.game.gameContainer.appendChild(explosion);
        setTimeout(() => explosion.remove(), 300);
    }
    
    updatePosition() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
    
    markForDeletion() {
        this.isMarkedForDeletion = true;
        this.element.remove();
    }
}

// PowerUp Class
class PowerUp {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.vy = 2;
        this.isMarkedForDeletion = false;
        
        this.element = document.createElement('div');
        this.element.className = 'power-up';
        this.element.textContent = 'P';
        this.game.gameContainer.appendChild(this.element);
        this.updatePosition();
    }
    
    update() {
        this.y += this.vy;
        
        if (this.y > this.game.height + 20) {
            this.markForDeletion();
        }
        
        this.updatePosition();
    }
    
    updatePosition() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
    
    markForDeletion() {
        this.isMarkedForDeletion = true;
        this.element.remove();
    }
}

// Game Class
class Game {
    constructor() {
        this.width = 400;
        this.height = 600;
        this.gameContainer = document.getElementById('game-container');
        this.input = new InputHandler();
        this.player = new Player(this);
        this.enemies = [];
        this.enemyProjectiles = [];
        this.powerUps = [];
        this.score = 0;
        this.lives = 3;
        this.loopsRemaining = 3;
        this.gameTime = 0;
        this.lastTime = 0;
        this.isRunning = false;
        this.waveIndex = 0;
        this.nextWaveTime = 2000;
        this.redFormationKills = 0;
        this.redFormationActive = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        
        startBtn.addEventListener('click', () => this.start());
        restartBtn.addEventListener('click', () => this.restart());
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (!this.isRunning && document.getElementById('start-screen').classList.contains('hidden')) {
                    this.restart();
                } else if (!this.isRunning) {
                    this.start();
                }
            }
        });
    }
    
    start() {
        document.getElementById('start-screen').classList.add('hidden');
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    restart() {
        this.cleanup();
        this.score = 0;
        this.lives = 3;
        this.loopsRemaining = 3;
        this.gameTime = 0;
        this.waveIndex = 0;
        this.nextWaveTime = 2000;
        this.redFormationKills = 0;
        this.redFormationActive = false;
        this.player = new Player(this);
        this.updateUI();
        document.getElementById('game-over-screen').classList.add('hidden');
        this.start();
    }
    
    cleanup() {
        this.enemies.forEach(e => e.element.remove());
        this.enemyProjectiles.forEach(p => p.element.remove());
        this.powerUps.forEach(p => p.element.remove());
        this.player.projectiles.forEach(p => p.element.remove());
        this.player.options.forEach(o => o.element.remove());
        this.player.element.remove();
        this.enemies = [];
        this.enemyProjectiles = [];
        this.powerUps = [];
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.gameTime += deltaTime;
        
        this.handleInput(timestamp);
        this.update(timestamp, deltaTime);
        
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    handleInput(timestamp) {
        this.player.handleInput(this.input, timestamp);
    }
    
    update(timestamp, deltaTime) {
        this.player.update(timestamp);
        
        this.spawnEnemies();
        
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        this.enemyProjectiles.forEach(proj => proj.update());
        this.powerUps.forEach(powerUp => powerUp.update());
        
        this.checkCollisions();
        
        this.enemies = this.enemies.filter(e => !e.isMarkedForDeletion);
        this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.isMarkedForDeletion);
        this.powerUps = this.powerUps.filter(p => !p.isMarkedForDeletion);
    }
    
    spawnEnemies() {
        if (this.gameTime > this.nextWaveTime) {
            this.spawnWave();
            this.nextWaveTime = this.gameTime + 3000 + Math.random() * 2000;
        }
    }
    
    spawnWave() {
        const patterns = [
            () => this.spawnVFormation(),
            () => this.spawnLineFormation(),
            () => this.spawnRedFormation(),
            () => this.spawnScatteredEnemies()
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        pattern();
    }
    
    spawnVFormation() {
        const centerX = this.width / 2;
        const startY = -50;
        const spacing = 40;
        const type = Math.random() > 0.5 ? 'small' : 'medium';
        
        for (let i = 0; i < 5; i++) {
            const offset = (i - 2) * spacing;
            const y = startY - Math.abs(i - 2) * 30;
            this.enemies.push(new Enemy(this, centerX + offset, y, type));
        }
    }
    
    spawnLineFormation() {
        const y = -50;
        const spacing = 60;
        const type = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
        
        for (let i = 0; i < 5; i++) {
            this.enemies.push(new Enemy(this, 50 + i * spacing, y, type));
        }
    }
    
    spawnRedFormation() {
        const centerX = this.width / 2;
        const startY = -50;
        const spacing = 35;
        this.redFormationActive = true;
        this.redFormationKills = 0;
        
        for (let i = 0; i < 6; i++) {
            const x = centerX - 90 + (i % 3) * spacing;
            const y = startY - Math.floor(i / 3) * spacing;
            this.enemies.push(new Enemy(this, x, y, 'small', 'red'));
        }
    }
    
    spawnScatteredEnemies() {
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const x = 30 + Math.random() * (this.width - 60);
            const y = -50 - i * 80;
            const type = ['small', 'medium'][Math.floor(Math.random() * 2)];
            this.enemies.push(new Enemy(this, x, y, type));
        }
    }
    
    checkCollisions() {
        this.player.projectiles.forEach(projectile => {
            this.enemies.forEach(enemy => {
                if (isColliding(projectile, enemy)) {
                    projectile.markForDeletion();
                    const destroyed = enemy.hit();
                    
                    if (destroyed && enemy.formationType === 'red') {
                        this.redFormationKills++;
                        if (this.redFormationKills >= 6) {
                            this.spawnPowerUp(enemy.x, enemy.y);
                            this.redFormationActive = false;
                        }
                    }
                }
            });
        });
        
        if (!this.player.isLooping) {
            this.enemies.forEach(enemy => {
                if (isColliding(this.player, enemy)) {
                    enemy.hit();
                    this.player.hit();
                }
            });
            
            this.enemyProjectiles.forEach(projectile => {
                if (isColliding(this.player, projectile)) {
                    projectile.markForDeletion();
                    this.player.hit();
                }
            });
        }
        
        this.powerUps.forEach(powerUp => {
            if (isColliding(this.player, powerUp)) {
                const type = Math.random() > 0.5 ? 'double' : 'options';
                this.player.addPowerUp(type);
                powerUp.markForDeletion();
                this.addScore(500);
            }
        });
    }
    
    spawnPowerUp(x, y) {
        this.powerUps.push(new PowerUp(this, x, y, 'random'));
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    loseLife() {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.player.reset();
        }
    }
    
    gameOver() {
        this.isRunning = false;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('loops').textContent = this.loopsRemaining;
    }
}

// Initialize the game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

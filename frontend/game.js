// Game Audio Engine (Web Audio API)
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    
    if (type === 'flip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'jump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'orb') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.05);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'death') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'win') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        osc.frequency.setValueAtTime(800, now + 0.2);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'crush') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

// Game Constants and Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

const GRAVITY = 0.5;
const MAX_FALL_SPEED = 10;
const PLAYER_SPEED = 5;

// Game State
let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER, WIN
let score = 0;
let level = 1;
let frames = 0;
let cameraX = 0;

// Input Handling
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    a: false,
    d: false,
    Space: false
};

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameState === 'MENU' || gameState === 'GAMEOVER' || gameState === 'WIN') {
            startGame();
        } else if (gameState === 'PLAYING' && !keys.Space) {
            player.flipGravity();
            keys.Space = true;
        }
    }
    if (keys.hasOwnProperty(e.key) && e.key !== 'Space') keys[e.key] = true;
    if (keys.hasOwnProperty(e.code) && e.code !== 'Space') keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

// Classes
class Player {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.reset();
    }
    
    reset() {
        this.x = 100;
        this.y = GAME_HEIGHT / 2;
        this.vx = 0;
        this.vy = 0;
        this.gravityMultiplier = 1; // 1 for normal, -1 for anti-gravity
        this.isGrounded = false;
        this.color = '#0ff';
        this.trails = [];
    }

    flipGravity() {
        if (this.isGrounded || this.vy === 0) {
            this.gravityMultiplier *= -1;
            this.vy = 0; // reset vertical momentum on flip
            playSound('flip');
            this.isGrounded = false;
        }
    }

    update() {
        // Horizontal movement
        if (keys.ArrowLeft || keys.a) {
            this.vx = -PLAYER_SPEED;
        } else if (keys.ArrowRight || keys.d) {
            this.vx = PLAYER_SPEED;
        } else {
            this.vx = 0;
        }

        // Apply Gravity
        this.vy += GRAVITY * this.gravityMultiplier;
        
        // Terminal velocity
        if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;
        if (this.vy < -MAX_FALL_SPEED) this.vy = -MAX_FALL_SPEED;

        this.x += this.vx;
        this.y += this.vy;

        // Screen bounds
        if (this.x < cameraX) this.x = cameraX;

        // Trails
        this.trails.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trails.length > 10) this.trails.shift();
        this.trails.forEach(t => t.alpha -= 0.1);
    }

    draw(ctx) {
        // Draw trails
        this.trails.forEach((t, index) => {
            if (t.alpha > 0) {
                ctx.fillStyle = `rgba(0, 255, 255, ${t.alpha * 0.5})`;
                const size = this.width * (index / this.trails.length);
                const offset = (this.width - size) / 2;
                ctx.fillRect(t.x - cameraX + offset, t.y + offset, size, size);
            }
        });

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
        
        // Draw gravity indicator
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        if (this.gravityMultiplier === 1) {
            ctx.fillRect(this.x - cameraX + 10, this.y + 20, 10, 5); // Down indicator
        } else {
            ctx.fillRect(this.x - cameraX + 10, this.y + 5, 10, 5); // Up indicator
        }
    }
}

class Platform {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    draw(ctx) {
        ctx.fillStyle = '#333';
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#0ff';
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
        ctx.strokeRect(this.x - cameraX, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Spike {
    constructor(x, y, w, h, isCeiling = false) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.isCeiling = isCeiling;
    }
    draw(ctx) {
        ctx.fillStyle = '#f00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f00';
        ctx.beginPath();
        if (this.isCeiling) {
            ctx.moveTo(this.x - cameraX, this.y);
            ctx.lineTo(this.x - cameraX + this.width, this.y);
            ctx.lineTo(this.x - cameraX + this.width/2, this.y + this.height);
        } else {
            ctx.moveTo(this.x - cameraX, this.y + this.height);
            ctx.lineTo(this.x - cameraX + this.width, this.y + this.height);
            ctx.lineTo(this.x - cameraX + this.width/2, this.y);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Orb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;
    }
    update() {
        this.bob = Math.sin(frames * 0.1 + this.bobOffset) * 5;
    }
    draw(ctx) {
        if (this.collected) return;
        ctx.fillStyle = '#ff0';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0';
        ctx.beginPath();
        ctx.arc(this.x - cameraX, this.y + this.bob, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Portal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
    }
    draw(ctx) {
        ctx.fillStyle = `hsl(${frames % 360}, 100%, 50%)`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - cameraX + 5, this.y + 5, this.width - 10, this.height - 10);
        ctx.shadowBlur = 0;
    }
}

class Enemy {
    constructor(x, y, w, h, isCeiling = false) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.isCeiling = isCeiling;
        this.speed = 2;
        this.direction = 1;
        this.startX = x;
        this.range = 100;
        this.dead = false;
    }
    update() {
        if (this.dead) return;
        this.x += this.speed * this.direction;
        if (this.x > this.startX + this.range || this.x < this.startX - this.range) {
            this.direction *= -1;
        }
    }
    draw(ctx) {
        if (this.dead) return;
        ctx.fillStyle = '#f0f';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f0f';
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        let eyeY = this.isCeiling ? this.y + this.height - 10 : this.y + 5;
        ctx.fillRect(this.x - cameraX + (this.direction > 0 ? 15 : 5), eyeY, 5, 5);
        ctx.fillRect(this.x - cameraX + (this.direction > 0 ? 25 : 15), eyeY, 5, 5);
    }
}

// Global Entities
let player = new Player();
let platforms = [];
let spikes = [];
let orbs = [];
let portals = [];
let enemies = [];

function generateLevel() {
    platforms = [];
    spikes = [];
    orbs = [];
    portals = [];
    enemies = [];
    cameraX = 0;

    let levelLength = 2000 + level * 1000;
    
    // Borders
    platforms.push(new Platform(-100, GAME_HEIGHT - 40, levelLength + 500, 40)); // Floor
    platforms.push(new Platform(-100, 0, levelLength + 500, 40)); // Ceiling
    platforms.push(new Platform(-100, 0, 40, GAME_HEIGHT)); // Left wall

    // Generate obstacles and platforms
    let currentX = 400;
    while (currentX < levelLength - 500) {
        let gap = Math.random() * 150 + 100;
        let pWidth = Math.random() * 200 + 100;
        let isCeiling = Math.random() > 0.5;
        
        let pY = isCeiling ? 150 + Math.random() * 100 : GAME_HEIGHT - 150 - Math.random() * 100;
        
        platforms.push(new Platform(currentX, pY, pWidth, 20));

        // Add spikes occasionally
        if (Math.random() > 0.6) {
            if (isCeiling) {
                spikes.push(new Spike(currentX + pWidth/2, 40, 30, 40, true)); // on ceiling
            } else {
                spikes.push(new Spike(currentX + pWidth/2, GAME_HEIGHT - 80, 30, 40, false)); // on floor
            }
        }

        // Add Orbs
        if (Math.random() > 0.5) {
            orbs.push(new Orb(currentX + pWidth/2, GAME_HEIGHT / 2));
        }

        // Add Enemies
        if (Math.random() > 0.7) {
            let enemyIsCeiling = Math.random() > 0.5;
            let enemyY = enemyIsCeiling ? 40 : GAME_HEIGHT - 70;
            enemies.push(new Enemy(currentX + 50, enemyY, 30, 30, enemyIsCeiling));
        }

        currentX += pWidth + gap;
    }

    portals.push(new Portal(levelLength, GAME_HEIGHT - 100));
}

function startGame() {
    player.reset();
    generateLevel();
    gameState = 'PLAYING';
    score = 0;
    level = 1;
    frames = 0;
    updateHUD();
    document.getElementById('leaderboard-overlay').classList.add('hidden');
}

function nextLevel() {
    level++;
    player.reset();
    generateLevel();
    playSound('win');
    updateHUD();
}

function gameOver() {
    gameState = 'GAMEOVER';
    playSound('death');
    showLeaderboard(true);
}

function rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.width || 
             r2.x + r2.width < r1.x || 
             r2.y > r1.y + r1.height ||
             r2.y + r2.height < r1.y);
}

function update() {
    if (gameState !== 'PLAYING') return;

    frames++;
    player.update();

    // Camera follow
    let targetCameraX = player.x - GAME_WIDTH / 3;
    if (targetCameraX > cameraX) cameraX = targetCameraX;

    player.isGrounded = false;
    let pRect = { x: player.x, y: player.y, width: player.width, height: player.height };

    // Platform collisions
    for (let p of platforms) {
        if (rectIntersect(pRect, p)) {
            // Very basic collision resolution
            if (player.vy > 0 && player.y + player.height - player.vy <= p.y) {
                // Falling down onto platform
                player.y = p.y - player.height;
                player.vy = 0;
                if (player.gravityMultiplier === 1) player.isGrounded = true;
            } else if (player.vy < 0 && player.y - player.vy >= p.y + p.height) {
                // Falling up onto platform
                player.y = p.y + p.height;
                player.vy = 0;
                if (player.gravityMultiplier === -1) player.isGrounded = true;
            } else {
                // Side collisions (simplified)
                if (player.vx > 0) player.x = p.x - player.width;
                else if (player.vx < 0) player.x = p.x + p.width;
            }
        }
    }

    // Spike collisions
    for (let s of spikes) {
        if (rectIntersect(pRect, s)) {
            gameOver();
        }
    }

    // Orb collisions
    for (let o of orbs) {
        if (!o.collected) {
            o.update();
            let dist = Math.hypot(player.x - o.x, player.y - o.y);
            if (dist < o.radius + player.width/2) {
                o.collected = true;
                score += 100;
                playSound('orb');
                updateHUD();
            }
        }
    }

    // Enemy collisions and logic
    for (let e of enemies) {
        if (!e.dead) {
            e.update();
            let eRect = { x: e.x, y: e.y, width: e.width, height: e.height };
            if (rectIntersect(pRect, eRect)) {
                // Gravity crush mechanic
                if ((player.gravityMultiplier === 1 && player.vy > 0 && player.y < e.y) || 
                    (player.gravityMultiplier === -1 && player.vy < 0 && player.y > e.y)) {
                    e.dead = true;
                    score += 200;
                    playSound('crush');
                    player.vy = -player.vy * 0.5; // bounce
                    updateHUD();
                } else {
                    gameOver();
                }
            }
        }
    }

    // Portal collision
    for (let portal of portals) {
        if (rectIntersect(pRect, portal)) {
            score += 1000;
            nextLevel();
        }
    }
    
    // Fall out of bounds check (shouldn't happen with borders but just in case)
    if (player.y > GAME_HEIGHT + 100 || player.y < -100) {
        gameOver();
    }
}

function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw Grid Background
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    let gridSize = 50;
    let offsetX = cameraX % gridSize;
    ctx.beginPath();
    for (let x = -offsetX; x < GAME_WIDTH; x += gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(GAME_WIDTH, y);
    }
    ctx.stroke();

    if (gameState === 'MENU') {
        ctx.fillStyle = '#0ff';
        ctx.font = '40px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('ANTI-GRAVITY', GAME_WIDTH/2, GAME_HEIGHT/2 - 20);
        ctx.fillStyle = '#f0f';
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText('Press SPACE to Start', GAME_WIDTH/2, GAME_HEIGHT/2 + 40);
        return;
    }

    portals.forEach(p => p.draw(ctx));
    platforms.forEach(p => p.draw(ctx));
    spikes.forEach(s => s.draw(ctx));
    enemies.forEach(e => e.draw(ctx));
    orbs.forEach(o => o.draw(ctx));
    player.draw(ctx);
}

function updateHUD() {
    document.getElementById('score').innerText = score;
    document.getElementById('level').innerText = level;
    let msg = document.getElementById('message');
    if (gameState === 'PLAYING') msg.innerText = '';
    else if (gameState === 'GAMEOVER') msg.innerText = 'GAME OVER';
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Leaderboard logic
function fetchScores() {
    fetch('/api/scores')
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('leaderboard-list');
            list.innerHTML = '';
            data.forEach((item, index) => {
                let li = document.createElement('li');
                li.innerHTML = `<span>${index + 1}. ${item.name}</span><span>${item.score}</span>`;
                list.appendChild(li);
            });
        })
        .catch(err => console.error('Error fetching scores:', err));
}

function submitScore() {
    const name = document.getElementById('player-name').value;
    if (name.length > 0) {
        fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, score: score })
        }).then(() => {
            document.getElementById('name-input-container').classList.add('hidden');
            fetchScores();
        });
    }
}

function showLeaderboard(allowSubmit) {
    const overlay = document.getElementById('leaderboard-overlay');
    overlay.classList.remove('hidden');
    
    if (allowSubmit && score > 0) {
        document.getElementById('name-input-container').classList.remove('hidden');
    } else {
        document.getElementById('name-input-container').classList.add('hidden');
    }
    fetchScores();
}

document.getElementById('submit-score-btn').addEventListener('click', submitScore);
document.getElementById('restart-btn').addEventListener('click', startGame);

// Start loop
gameLoop();

let player;
let obstacles = [];
let goodFood = [];
let enemies = [];
let particles = [];

let score = 0;
let gameActive = true;
let gameResult = null;

let playerAnimation = [];
let currentFrame = 0;
let frameDelay = 0;
let isMoving = false;
let lastDirection = 'down';

let isAttacking = false;
let attackFrame = 0;
let attackCooldown = 0;
const ATTACK_COOLDOWN_MAX = 15;
const ATTACK_RANGE = 70;

let keys = {
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    x: false
};

let scoreDisplay;

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        
        this.vx = random(-3, 3);
        this.vy = random(-3, 3);
        
        this.size = random(4, 10);
        
        this.r = random(200, 255);
        this.g = random(50, 150);
        this.b = random(50, 100);
        
        this.lifespan = 255;
        
        this.fadeSpeed = random(5, 12);
    }
    
    finished() {
        return this.lifespan <= 0;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        this.vy += 0.2;
        
        this.lifespan -= this.fadeSpeed;
    }
    
    show() {
        noStroke();
        fill(this.r, this.g, this.b, this.lifespan);
        ellipse(this.x, this.y, this.size);
    }
}

function preload() {
    console.log("PRELOAD: Creating animation frames");
    createAnimationFrames();
}

function createAnimationFrames() {
    for (let i = 0; i < 12; i++) {
        let frame = createGraphics(45, 55);
        let isWalking = (i >= 4 && i < 8);
        let isAttackingAnim = (i >= 8);
        let frameIndex = i % 4;
        
        let bounceY = 0;
        let legSwing = 0;
        let armSwing = 0;
        let attackOffset = 0;
        
        if (isWalking) {
            legSwing = sin(frameIndex * HALF_PI) * 6;
            armSwing = sin(frameIndex * HALF_PI) * 4;
            bounceY = abs(sin(frameIndex * HALF_PI)) * 2;
        } else if (isAttackingAnim) {
            attackOffset = sin(frameIndex * PI) * 8;
            bounceY = sin(frameIndex * PI) * 3;
        } else {
            bounceY = sin(frameIndex * HALF_PI) * 2;
        }
        
        drawCharacterFrame(frame, bounceY, legSwing, armSwing, attackOffset, isAttackingAnim);
        playerAnimation.push(frame);
    }
}

function drawCharacterFrame(g, bounceY, legSwing, armSwing, attackOffset, isAttacking) {
    g.push();
    g.translate(22.5, 27.5 + bounceY);
    
    g.fill(52, 157, 89);
    g.noStroke();
    g.rectMode(g.CENTER);
    g.rect(0, 0, 32, 40, 8);
    
    g.fill(255, 224, 189);
    g.ellipse(0, -18, 26, 26);
    
    g.fill(101, 67, 33);
    g.arc(0, -28, 28, 18, PI, TWO_PI, g.CHORD);
    
    g.fill(20);
    g.ellipse(-7, -22, 4, 5);
    g.ellipse(7, -22, 4, 5);
    g.fill(255);
    g.ellipse(-8, -23, 1.5, 2);
    g.ellipse(6, -23, 1.5, 2);
    
    g.stroke(80, 40, 20);
    g.strokeWeight(1.5);
    g.noFill();
    if (isAttacking) {
        g.arc(0, -12, 14, 8, PI, TWO_PI);
    } else {
        g.arc(0, -14, 14, 7, 0, PI);
    }
    
    g.stroke(52, 157, 89);
    g.strokeWeight(6);
    if (isAttacking) {
        g.line(-12, -4, -20, -2);
        g.line(12, -4, 28 + attackOffset, -2 - attackOffset);
    } else {
        g.line(-12, -4, -20, -2 + armSwing);
        g.line(12, -4, 20, -2 - armSwing);
    }
    
    g.stroke(42, 117, 69);
    g.strokeWeight(6);
    g.line(-8, 18, -15, 30 + legSwing);
    g.line(8, 18, 15, 30 - legSwing);
    
    g.fill(150, 90, 50);
    g.rect(16, 0, 10, 16, 3);
    
    g.pop();
}

function setup() {
    let canvas = createCanvas(900, 600);
    canvas.parent('gameCanvas');
    frameRate(60);
    
    scoreDisplay = select('#scoreValue');
    select('#restartBtn').mousePressed(() => restartGame());
    
    player = new Sprite();
    player.width = 38;
    player.height = 48;
    player.collider = 'dynamic';
    player.x = width/2;
    player.y = height - 80;
    player.friction = 0.95;
    player.rotationLock = true;
    
    for (let i = 0; i < 5; i++) {
        let obstacle = new Sprite(random(70, width - 70), random(80, height - 90), 48, 48);
        obstacle.collider = 'static';
        obstacle.color = color(101, 67, 33);
        obstacle.stroke = color(70, 45, 20);
        obstacle.strokeWeight = 2;
        obstacles.push(obstacle);
    }
    
    for (let i = 0; i < 8; i++) {
        createGoodFood();
    }
    
    for (let i = 0; i < 5; i++) {
        createEnemy();
    }
    
    updateUI();
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    console.log("SETUP: Complete! Press X to attack enemies!");
    console.log("Enemies count:", enemies.length);
}

function handleKeyDown(event) {
    let key = event.key;
    
    if (key === 'w' || key === 'W' || key === 'ArrowUp' ||
        key === 's' || key === 'S' || key === 'ArrowDown' ||
        key === 'a' || key === 'A' || key === 'ArrowLeft' ||
        key === 'd' || key === 'D' || key === 'ArrowRight' ||
        key === 'x' || key === 'X') {
        event.preventDefault();
    }
    
    if (key === 'w' || key === 'W') keys.w = true;
    if (key === 'a' || key === 'A') keys.a = true;
    if (key === 's' || key === 'S') keys.s = true;
    if (key === 'd' || key === 'D') keys.d = true;
    if (key === 'ArrowUp') keys.ArrowUp = true;
    if (key === 'ArrowDown') keys.ArrowDown = true;
    if (key === 'ArrowLeft') keys.ArrowLeft = true;
    if (key === 'ArrowRight') keys.ArrowRight = true;
    if (key === 'x' || key === 'X') keys.x = true;
}

function handleKeyUp(event) {
    let key = event.key;
    
    if (key === 'w' || key === 'W') keys.w = false;
    if (key === 'a' || key === 'A') keys.a = false;
    if (key === 's' || key === 'S') keys.s = false;
    if (key === 'd' || key === 'D') keys.d = false;
    if (key === 'ArrowUp') keys.ArrowUp = false;
    if (key === 'ArrowDown') keys.ArrowDown = false;
    if (key === 'ArrowLeft') keys.ArrowLeft = false;
    if (key === 'ArrowRight') keys.ArrowRight = false;
    if (key === 'x' || key === 'X') keys.x = false;
}

function createGoodFood() {
    let food = new Sprite(random(50, width - 50), random(60, height - 80), 28, 28);
    food.collider = 'static';
    food.color = color(255, 215, 0);
    food.type = 'good';
    goodFood.push(food);
}

function createEnemy() {
    let enemy = new Sprite(random(50, width - 50), random(60, height - 80), 32, 32);
    enemy.collider = 'static';
    enemy.color = color(128, 0, 128);
    enemy.type = 'enemy';
    enemy.health = 3;
    enemy.maxHealth = 3;
    enemies.push(enemy);
}

function draw() {
    setGradient(0, 0, width, height, color(135, 206, 235), color(70, 130, 200));
    
    fill(80, 140, 60);
    noStroke();
    rect(0, height - 60, width, 60);
    
    fill(100, 170, 70);
    for (let i = 0; i < 12; i++) {
        rect(i * 75, height - 65, 5, 15);
    }
    
    if (gameActive) {
        handleMovement();
        
        handleAttack();
        
        handleGoodFoodCollection();
        
        updateAnimation();
        
        updateAttackAnimation();
        
        checkWinCondition();
    } else {
        player.vel.x = 0;
        player.vel.y = 0;
    }
    
    drawObstacles();
    drawGoodFood();
    drawEnemies();
    
    drawAnimatedPlayer();
    
    updateAndDrawParticles();
    
    drawUI();
    
    if (!gameActive) {
        drawGameOverlay();
    }
    
    if (attackCooldown > 0) {
        drawAttackCooldown();
    }
}

function setGradient(x, y, w, h, c1, c2) {
    noFill();
    for (let i = y; i <= y + h; i++) {
        let inter = map(i, y, y + h, 0, 1);
        let c = lerpColor(c1, c2, inter);
        stroke(c);
        line(x, i, x + w, i);
    }
}

function drawObstacles() {
    for (let obs of obstacles) {
        push();
        translate(obs.x, obs.y);
        fill(101, 67, 33);
        stroke(70, 45, 20);
        strokeWeight(2);
        rectMode(CENTER);
        rect(0, 0, 45, 45, 8);
        fill(80, 50, 30);
        ellipse(-12, -8, 10, 10);
        ellipse(12, -8, 10, 10);
        pop();
    }
}

function drawGoodFood() {
    for (let food of goodFood) {
        push();
        translate(food.x, food.y);
        fill(255, 215, 0);
        noStroke();
        beginShape();
        for (let i = 0; i < 5; i++) {
            let angle = i * TWO_PI / 5 - HALF_PI;
            let x1 = cos(angle) * 12;
            let y1 = sin(angle) * 12;
            vertex(x1, y1);
            let innerAngle = angle + PI/5;
            let x2 = cos(innerAngle) * 5;
            let y2 = sin(innerAngle) * 5;
            vertex(x2, y2);
        }
        endShape(CLOSE);
        fill(255, 180, 0);
        circle(0, 0, 8);
        pop();
    }
}

function drawEnemies() {
    for (let enemy of enemies) {
        push();
        translate(enemy.x, enemy.y);
        
        let healthPercent = enemy.health / enemy.maxHealth;
        fill(100, 0, 0);
        rect(-16, -28, 32, 6);
        fill(0, 200, 0);
        rect(-16, -28, 32 * healthPercent, 6);
        
        fill(80, 50, 70);
        ellipse(0, 0, 26, 28);
        fill(40, 30, 35);
        ellipse(-7, -5, 6, 7);
        ellipse(7, -5, 6, 7);
        fill(150, 50, 50);
        rect(-4, 3, 8, 7, 2);
        fill(200);
        rect(-8, 8, 5, 6);
        rect(0, 8, 5, 6);
        rect(8, 8, 5, 6);
        
        fill(255);
        textSize(12);
        textAlign(CENTER);
        text(enemy.health, 0, -20);
        
        pop();
    }
}

function handleMovement() {
    if (!gameActive) return;
    
    let moveX = 0;
    let moveY = 0;
    
    if (keys.w || keys.ArrowUp) moveY -= 1;
    if (keys.s || keys.ArrowDown) moveY += 1;
    if (keys.a || keys.ArrowLeft) moveX -= 1;
    if (keys.d || keys.ArrowRight) moveX += 1;
    
    if (moveX !== 0 || moveY !== 0) {
        let len = Math.hypot(moveX, moveY);
        moveX /= len;
        moveY /= len;
        
        let speed = 5.5;
        player.vel.x = moveX * speed;
        player.vel.y = moveY * speed;
        isMoving = true;
        
        if (moveX !== 0) {
            lastDirection = moveX > 0 ? 'right' : 'left';
        } else if (moveY !== 0) {
            lastDirection = moveY > 0 ? 'down' : 'up';
        }
    } else {
        player.vel.x *= 0.95;
        player.vel.y *= 0.95;
        isMoving = false;
    }
    
    player.x = constrain(player.x, 35, width - 35);
    player.y = constrain(player.y, 45, height - 65);
}

function handleAttack() {
    if (!gameActive) return;
    
    if (attackCooldown > 0) {
        attackCooldown--;
    }
    
    if (keys.x && attackCooldown === 0 && !isAttacking) {
        isAttacking = true;
        attackFrame = 0;
        attackCooldown = ATTACK_COOLDOWN_MAX;
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            let enemy = enemies[i];
            let distance = dist(player.x, player.y, enemy.x, enemy.y);
            
            if (distance < ATTACK_RANGE) {
                enemy.health--;
                
                createDamageParticles(enemy.x, enemy.y);
                
                if (enemy.health <= 0) {
                    for (let j = 0; j < 12; j++) {
                        createDamageParticles(enemy.x, enemy.y);
                    }
                    enemy.remove();
                    enemies.splice(i, 1);
                    console.log("Enemy destroyed! Remaining:", enemies.length);
                }
            }
        }
    }
}

function createDamageParticles(x, y) {
    let particleCount = random(8, 15);
    for (let i = 0; i < particleCount; i++) {
        let p = new Particle(x, y);
        particles.push(p);
    }
}

function handleGoodFoodCollection() {
    for (let i = goodFood.length - 1; i >= 0; i--) {
        let food = goodFood[i];
        if (player.collides(food)) {
            score++;
            updateUI();
            food.remove();
            goodFood.splice(i, 1);
            createGoodFood();
            
            console.log("Good food collected! Score:", score);
        }
    }
}

function updateAnimation() {
    if (isAttacking) {
        currentFrame = 8 + attackFrame;
        frameDelay = 0;
    } else {
        frameDelay++;
        if (frameDelay >= 6) {
            frameDelay = 0;
            if (isMoving) {
                currentFrame = (currentFrame % 4) + 4;
            } else {
                currentFrame = (currentFrame + 1) % 4;
            }
        }
    }
}

function updateAttackAnimation() {
    if (isAttacking) {
        attackFrame++;
        if (attackFrame >= 4) {
            isAttacking = false;
            attackFrame = 0;
        }
    }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].show();
        if (particles[i].finished()) {
            particles.splice(i, 1);
        }
    }
}

function drawAttackCooldown() {
    let cooldownPercent = attackCooldown / ATTACK_COOLDOWN_MAX;
    push();
    fill(0, 0, 0, 180);
    rect(player.x - 20, player.y - 45, 40, 6);
    fill(255, 100, 100);
    rect(player.x - 20, player.y - 45, 40 * (1 - cooldownPercent), 6);
    pop();
}

function checkWinCondition() {
    if (enemies.length === 0 && gameActive) {
        gameActive = false;
        gameResult = "win";
        console.log("WIN! All enemies defeated!");
    }
}

function drawAnimatedPlayer() {
    push();
    translate(player.x, player.y);
    
    if (lastDirection === 'left') {
        scale(-1, 1);
    }
    
    let frame = playerAnimation[currentFrame];
    imageMode(CENTER);
    image(frame, 0, 0);
    
    if (attackCooldown === 0 && gameActive) {
        noFill();
        stroke(255, 100, 100, 80);
        strokeWeight(1);
        ellipse(0, 0, ATTACK_RANGE * 2, ATTACK_RANGE * 2);
    }
    
    pop();
}

function drawUI() {
    fill(255, 215, 0);
    textSize(32);
    textAlign(LEFT);
    text("⭐ SCORE: " + score, 20, 45);
    
    fill(255, 100, 100);
    textAlign(CENTER);
    textSize(24);
    text("👾 ENEMIES REMAINING: " + enemies.length, width/2, 40);
    
    fill(200, 200, 255);
    textSize(16);
    textAlign(CENTER);
    text("Press X to attack enemies!", width/2, height - 30);
    
    fill(255, 215, 0);
    textAlign(RIGHT);
    textSize(14);
    text("Good Food: " + goodFood.length, width - 20, 80);
}

function drawGameOverlay() {
    fill(0, 0, 0, 220);
    rect(0, 0, width, height);
    
    textAlign(CENTER, CENTER);
    
    if (gameResult === "win") {
        fill(255, 215, 0);
        textSize(56);
        text("🎉 YOU WIN! 🎉", width/2, height/2 - 60);
        fill(255);
        textSize(28);
        text("All enemies defeated!", width/2, height/2);
        textSize(20);
        text("Final Score: " + score, width/2, height/2 + 60);
        textSize(18);
        text("Click RESTART to play again", width/2, height/2 + 120);
    } else if (gameResult === "lose") {
        fill(255, 80, 80);
        textSize(56);
        text("💀 GAME OVER 💀", width/2, height/2 - 60);
        fill(255);
        textSize(28);
        text("You were defeated...", width/2, height/2);
        textSize(20);
        text("Score: " + score + " | Enemies Left: " + enemies.length, width/2, height/2 + 60);
        textSize(18);
        text("Click RESTART to try again", width/2, height/2 + 120);
    }
}

function updateUI() {
    if (scoreDisplay) scoreDisplay.html(score);
}

function restartGame() {
    console.log("RESTART: Restarting game");
    gameActive = true;
    gameResult = null;
    score = 0;
    updateUI();
    
    player.x = width/2;
    player.y = height - 80;
    player.vel.x = 0;
    player.vel.y = 0;
    
    for (let obs of obstacles) {
        obs.remove();
    }
    for (let food of goodFood) {
        food.remove();
    }
    for (let enemy of enemies) {
        enemy.remove();
    }
    particles = [];
    
    obstacles = [];
    goodFood = [];
    enemies = [];
    
    for (let i = 0; i < 5; i++) {
        let obstacle = new Sprite(random(70, width - 70), random(80, height - 90), 48, 48);
        obstacle.collider = 'static';
        obstacle.color = color(101, 67, 33);
        obstacles.push(obstacle);
    }
    
    for (let i = 0; i < 8; i++) {
        createGoodFood();
    }
    
    for (let i = 0; i < 5; i++) {
        createEnemy();
    }
    
    currentFrame = 0;
    frameDelay = 0;
    isMoving = false;
    isAttacking = false;
    attackCooldown = 0;
    
    console.log("RESTART: Game reset complete. Enemies:", enemies.length);
}

window.addEventListener('beforeunload', function() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
});

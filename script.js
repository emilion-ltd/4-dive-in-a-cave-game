const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');
const diver = document.getElementById('diver');
const scoreElement = document.querySelector('#score span');
const livesElement = document.querySelector('#lives span');
const goldElement = document.querySelector('#gold span');
const caveTop = document.getElementById('cave-top');
const caveBottom = document.getElementById('cave-bottom');
let cavePoints = [];

let score = 0;
let diverX = 50;
let diverY = 50;
let obstacles = [];
let gifts = [];
let isGameRunning = false;
let animationId;
let lives = 3;
let gold = 0;

let obstacleSpeed = 0.5;
let obstacleSpawnRate = 0.01;
let giftSpawnRate = 0.003;

startButton.addEventListener('click', startGame);

function startGame() {
    startScreen.style.display = 'none';
    resetGame();
    isGameRunning = true;
    createBubbles();
    initializeCave();
    updateDiverPosition();
    gameLoop();
    setInterval(moveCave, 2000);
}

function resetGame() {
    score = 0;
    lives = 3;
    gold = 0;
    diverX = 50;
    diverY = 50;
    obstacles = [];
    gifts = [];
    updateDiverPosition();
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    goldElement.textContent = gold;
}

function updateDiverPosition() {
    diver.style.left = `${diverX}%`;
    diver.style.top = `${100 - diverY}%`;
}

function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    obstacle.style.left = `${Math.random() * 100}%`;
    obstacle.style.bottom = `${Math.random() * 70 + 20}%`; // מיקום אקראי במערה
    
    gameContainer.appendChild(obstacle);
    obstacles.push({
        element: obstacle,
        y: 100,
        speed: obstacleSpeed * (1 + Math.random() * 0.5)
    });
}

function createGift() {
    const gift = document.createElement('div');
    gift.classList.add('gift');
    gift.style.left = `${Math.random() * 100}%`;
    gift.style.bottom = `${Math.random() * 70 + 20}%`; // מיקום אקראי במערה
    
    gameContainer.appendChild(gift);
    gifts.push({
        element: gift,
        y: 100,
        speed: obstacleSpeed * 0.8
    });
}

function gameLoop() {
    if (!isGameRunning) return;

    if (Math.random() < obstacleSpawnRate) {
        createObstacle();
    }

    if (Math.random() < giftSpawnRate) {
        createGift();
    }

    obstacles.forEach((obstacle, index) => {
        obstacle.y -= obstacle.speed;
        obstacle.element.style.bottom = `${obstacle.y}%`;

        if (obstacle.y < -10) {
            obstacle.element.remove();
            obstacles.splice(index, 1);
            score++;
            scoreElement.textContent = score;
        }

        if (checkCollision(obstacle)) {
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) {
                gameOver();
            }
        }
    });

    gifts.forEach((gift, index) => {
        gift.y -= gift.speed;
        gift.element.style.bottom = `${gift.y}%`;

        if (gift.y < -10) {
            gift.element.remove();
            gifts.splice(index, 1);
        }

        if (checkCollision(gift)) {
            gold += 10;
            goldElement.textContent = gold;
            gift.element.remove();
            gifts.splice(index, 1);
        }
    });

    moveCave();
    animationId = requestAnimationFrame(gameLoop);
}

function checkCollision(object) {
    const diverRect = diver.getBoundingClientRect();
    const objectRect = object.element.getBoundingClientRect();
    return !(diverRect.right < objectRect.left || 
             diverRect.left > objectRect.right || 
             diverRect.bottom < objectRect.top || 
             diverRect.top > objectRect.bottom);
}

function gameOver() {
    isGameRunning = false;
    cancelAnimationFrame(animationId);
    alert(`המשחק נגמר! הניקוד שלך: ${score}, זהב: ${gold}`);
    startScreen.style.display = 'flex';
    obstacles.forEach(obstacle => obstacle.element.remove());
    gifts.forEach(gift => gift.element.remove());
    obstacles = [];
    gifts = [];
}

function initializeCave() {
    cavePoints = [];
    for (let i = 0; i <= 100; i += 10) {
        cavePoints.push({
            x: i,
            topY: Math.random() * 10 + 10,  // 10% עד 20% מגובה המסך
            bottomY: Math.random() * 10 + 70  // 70% עד 80% מגובה המסך
        });
    }
    updateCaveShape();
}

function updateCaveShape() {
    let topPath = `0% 0%, 100% 0%, `;
    let bottomPath = `0% 100%, 100% 100%, `;

    cavePoints.forEach(point => {
        topPath += `${point.x}% ${point.topY}%, `;
        bottomPath += `${point.x}% ${point.bottomY}%, `;
    });

    topPath += '100% 100%, 0% 100%';
    bottomPath += '100% 0%, 0% 0%';

    caveTop.style.clipPath = `polygon(${topPath})`;
    caveBottom.style.clipPath = `polygon(${bottomPath})`;
}

function moveCave() {
    cavePoints.forEach(point => {
        point.topY += (Math.random() - 0.5) * 2;
        point.bottomY += (Math.random() - 0.5) * 2;

        point.topY = Math.max(10, Math.min(40, point.topY));
        point.bottomY = Math.max(70, Math.min(90, point.bottomY));
    });

    updateCaveShape();
}

function createBubbles() {
    setInterval(() => {
        if (!isGameRunning) return;
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.width = `${Math.random() * 20 + 10}px`;
        bubble.style.height = bubble.style.width;
        document.getElementById('bubbles').appendChild(bubble);
        
        setTimeout(() => {
            bubble.remove();
        }, 5000);
    }, 500);
}

function moveDiver(e) {
    const speed = 5; // מהירות התנועה
    switch(e.key) {
        case 'ArrowLeft':
            diverX = Math.max(0, diverX - speed);
            break;
        case 'ArrowRight':
            diverX = Math.min(100, diverX + speed);
            break;
        case 'ArrowUp':
            diverY = Math.min(90, diverY + speed); // תנועה למעלה
            break;
        case 'ArrowDown':
            diverY = Math.max(0, diverY - speed); // תנועה למטה
            break;
    }
    updateDiverPosition();
}

document.addEventListener('keydown', moveDiver);

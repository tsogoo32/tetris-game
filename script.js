// ================================
// MODERN TETRIS
// UPDATE 1
// HOME MENU
// ================================

// ================================
// CANVAS
// ================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");

// ================================
// UI ELEMENTS
// ================================

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const levelElement = document.getElementById("level");
const finalScoreElement = document.getElementById("finalScore");
const menuHighScore = document.getElementById("menuHighScore");

// ================================
// SCREENS
// ================================

const homeScreen = document.getElementById("homeScreen");
const scoresScreen = document.getElementById("scoresScreen");
const howToPlayScreen = document.getElementById("howToPlayScreen");
const settingsScreen = document.getElementById("settingsScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

// ================================
// BUTTONS
// ================================

const playButton = document.getElementById("playButton");
const scoresButton = document.getElementById("scoresButton");
const howToPlayButton = document.getElementById("howToPlayButton");
const settingsButton = document.getElementById("settingsButton");

const scoresBackButton = document.getElementById("scoresBackButton");
const howToPlayBackButton = document.getElementById("howToPlayBackButton");
const settingsBackButton = document.getElementById("settingsBackButton");

const restartButton = document.getElementById("restartButton");
const gameOverHomeButton = document.getElementById("gameOverHomeButton");
const pauseHomeButton = document.getElementById("pauseHomeButton");

// ================================
// BOARD SETTINGS
// ================================

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// ================================
// TETROMINOES
// ================================

const PIECES = {
    I: {
        shape: [[1, 1, 1, 1]],
        color: "#06b6d4"
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: "#facc15"
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: "#a855f7"
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: "#22c55e"
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: "#ef4444"
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: "#3b82f6"
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1]
        ],
        color: "#f97316"
    }
};

// ================================
// GAME VARIABLES
// ================================

let board;
let currentPiece;
let nextPiece;

let score = 0;
let level = 1;
let lines = 0;
let highScore = Number(localStorage.getItem("tetrisHighScore")) || 0;

let gameRunning = false;
let paused = false;

let dropTimer = 0;
let lastTime = 0;

let animationFrame;
let countdownTimeout = null;
let settingsReturnToPause = false;

// ================================
// SCREEN FUNCTIONS
// ================================

function hideAllScreens() {
    homeScreen.classList.add("hidden");
    scoresScreen.classList.add("hidden");
    howToPlayScreen.classList.add("hidden");
    settingsScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
}

function showHome() {
    if (countdownTimeout) {
        clearTimeout(countdownTimeout);
        countdownTimeout = null;
    }
    document.body.classList.remove("counting-down");
    const countdownOverlay = document.getElementById("countdownOverlay");
    if (countdownOverlay) {
        countdownOverlay.classList.add("hidden");
    }

    gameRunning = false;
    paused = false;

    cancelAnimationFrame(animationFrame);
    hideAllScreens();
    homeScreen.classList.remove("hidden");

    updateUI();
    menuHighScore.textContent = highScore;
}

function showScores() {
    hideAllScreens();
    menuHighScore.textContent = highScore;
    scoresScreen.classList.remove("hidden");
}

function showHowToPlay() {
    hideAllScreens();
    howToPlayScreen.classList.remove("hidden");
}

function showSettings(fromPause = false) {
    settingsReturnToPause = fromPause;
    hideAllScreens();
    settingsScreen.classList.remove("hidden");
}

// ================================
// CREATE BOARD
// ================================

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// ================================
// RANDOM PIECE
// ================================

function randomPiece() {
    const names = Object.keys(PIECES);
    const randomName = names[Math.floor(Math.random() * names.length)];
    const piece = PIECES[randomName];

    return {
        name: randomName,
        shape: piece.shape.map(row => [...row]),
        color: piece.color,
        x: Math.floor(COLS / 2 - piece.shape[0].length / 2),
        y: 0
    };
}

// ================================
// START GAME
// ================================

function startGame() {
    if (countdownTimeout) {
        clearTimeout(countdownTimeout);
        countdownTimeout = null;
    }

    board = createBoard();
    score = 0;
    level = 1;
    lines = 0;
    dropTimer = 0;
    paused = false;
    gameRunning = false;
    settingsReturnToPause = false;

    currentPiece = randomPiece();
    nextPiece = randomPiece();

    hideAllScreens();
    updateUI();
    draw();
    drawNextPiece();

    const overlay = document.getElementById("countdownOverlay");
    const text = document.getElementById("countdownText");

    if (!overlay || !text) {
        gameRunning = true;
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(gameLoop);
        return;
    }

    document.body.classList.add("counting-down");
    overlay.classList.remove("hidden");

    const sequence = ["3", "2", "1", "GO"];
    let step = 0;

    const tick = () => {
        text.textContent = sequence[step];
        text.classList.remove("count-pop");
        void text.offsetWidth;
        text.classList.add("count-pop");

        if (step < sequence.length - 1) {
            step++;
            countdownTimeout = window.setTimeout(tick, 850);
        } else {
            countdownTimeout = window.setTimeout(() => {
                countdownTimeout = null;
                overlay.classList.add("hidden");
                document.body.classList.remove("counting-down");

                gameRunning = true;
                lastTime = performance.now();
                dropTimer = 0;

                cancelAnimationFrame(animationFrame);
                animationFrame = requestAnimationFrame(gameLoop);
            }, 650);
        }
    };

    tick();
}

// ================================
// GAME LOOP
// ================================

function gameLoop(time) {
    if (!gameRunning) return;

    if (!paused) {
        const deltaTime = time - lastTime;
        dropTimer += deltaTime;

        if (dropTimer >= getDropSpeed()) {
            moveDown();
            dropTimer = 0;
        }

        draw();
    }

    lastTime = time;
    animationFrame = requestAnimationFrame(gameLoop);
}

// ================================
// DROP SPEED
// ================================

function getDropSpeed() {
    return Math.max(100, 800 - (level - 1) * 70);
}

// ================================
// CONTROLS LOGIC
// ================================

function moveLeft() {
    currentPiece.x--;
    if (checkCollision()) {
        currentPiece.x++;
    }
}

function moveRight() {
    currentPiece.x++;
    if (checkCollision()) {
        currentPiece.x--;
    }
}

function moveDown() {
    currentPiece.y++;
    if (checkCollision()) {
        currentPiece.y--;
        lockPiece();
        clearLines();
        spawnNextPiece();
    }
}

function hardDrop() {
    let distance = 0;
    while (!checkCollision()) {
        currentPiece.y++;
        distance++;
    }
    currentPiece.y--;

    score += distance * 2;
    lockPiece();
    clearLines();
    spawnNextPiece();

    updateUI();
}

function rotatePiece() {
    const oldShape = currentPiece.shape;
    const rows = oldShape.length;
    const cols = oldShape[0].length;
    const newShape = [];

    for (let x = 0; x < cols; x++) {
        const newRow = [];
        for (let y = rows - 1; y >= 0; y--) {
            newRow.push(oldShape[y][x]);
        }
        newShape.push(newRow);
    }

    currentPiece.shape = newShape;

    if (checkCollision()) {
        currentPiece.x--;
        if (checkCollision()) {
            currentPiece.x += 2;
            if (checkCollision()) {
                currentPiece.x--;
                currentPiece.shape = oldShape;
            }
        }
    }
}

// ================================
// COLLISION & LOCK
// ================================

function checkCollision() {
    const shape = currentPiece.shape;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (!shape[y][x]) continue;

            const boardX = currentPiece.x + x;
            const boardY = currentPiece.y + y;

            if (boardX < 0 || boardX >= COLS) return true;
            if (boardY >= ROWS) return true;
            if (boardY >= 0 && board[boardY][boardX]) return true;
        }
    }
    return false;
}

function lockPiece() {
    const shape = currentPiece.shape;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (!shape[y][x]) continue;

            const boardX = currentPiece.x + x;
            const boardY = currentPiece.y + y;

            if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                board[boardY][boardX] = currentPiece.color;
            }
        }
    }
}

function clearLines() {
    let cleared = 0;

    for (let y = ROWS - 1; y >= 0; y--) {
        const full = board[y].every(cell => cell !== 0);

        if (full) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            cleared++;
            y++;
        }
    }

    if (cleared > 0) {
        lines += cleared;

        const points = {
            1: 100,
            2: 300,
            3: 500,
            4: 800
        };

        score += (points[cleared] || 0) * level;
        level = Math.floor(lines / 10) + 1;
        updateUI();
    }
}

function spawnNextPiece() {
    currentPiece = nextPiece;
    nextPiece = randomPiece();

    currentPiece.x = Math.floor(COLS / 2 - currentPiece.shape[0].length / 2);
    currentPiece.y = 0;

    if (checkCollision()) {
        endGame();
    }
}

// ================================
// DRAW FUNCTIONS
// ================================

function draw() {
    clearCanvas();
    drawBoard();
    drawGhostPiece();
    drawCurrentPiece();
    drawNextPiece();
}

function clearCanvas() {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBoard() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(ctx, x, y, board[y][x], BLOCK_SIZE);
            }
        }
    }

    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
}

function drawBlock(context, x, y, color, size) {
    const px = x * size;
    const py = y * size;

    context.fillStyle = color;
    context.fillRect(px + 1, py + 1, size - 2, size - 2);

    context.fillStyle = "rgba(255, 255, 255, 0.25)";
    context.fillRect(px + 3, py + 3, size - 6, 4);

    context.strokeStyle = "rgba(255, 255, 255, 0.2)";
    context.strokeRect(px + 1, py + 1, size - 2, size - 2);
}

function drawCurrentPiece() {
    const shape = currentPiece.shape;

    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (!shape[y][x]) continue;

            const drawY = currentPiece.y + y;
            if (drawY < 0) continue;

            drawBlock(ctx, currentPiece.x + x, drawY, currentPiece.color, BLOCK_SIZE);
        }
    }
}

function drawGhostPiece() {
    const originalY = currentPiece.y;
    let ghostY = currentPiece.y;

    while (true) {
        currentPiece.y = ghostY + 1;
        if (checkCollision()) {
            break;
        }
        ghostY++;
    }

    currentPiece.y = originalY;

    ctx.globalAlpha = 0.2;

    const shape = currentPiece.shape;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (!shape[y][x]) continue;

            const drawY = ghostY + y;
            if (drawY >= 0) {
                drawBlock(ctx, currentPiece.x + x, drawY, currentPiece.color, BLOCK_SIZE);
            }
        }
    }

    ctx.globalAlpha = 1;
}

function drawNextPiece() {
    nextCtx.fillStyle = "#020617";
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    const shape = nextPiece.shape;
    const size = 25;
    const width = shape[0].length * size;
    const height = shape.length * size;
    const offsetX = (nextCanvas.width - width) / 2;
    const offsetY = (nextCanvas.height - height) / 2;

    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (!shape[y][x]) continue;

            const px = offsetX / size + x;
            const py = offsetY / size + y;
            drawBlock(nextCtx, px, py, nextPiece.color, size);
        }
    }
}

// ================================
// UPDATE UI & GAME OVER
// ================================

function updateUI() {
    scoreElement.textContent = score;
    levelElement.textContent = level;

    const linesElement = document.getElementById("lines");
    if (linesElement) {
        linesElement.textContent = lines;
    }

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("tetrisHighScore", highScore);
    }

    highScoreElement.textContent = highScore;
    menuHighScore.textContent = highScore;
}

function endGame() {
    gameRunning = false;
    paused = false;

    cancelAnimationFrame(animationFrame);

    finalScoreElement.textContent = score;
    saveGameResult();
    updateHistoryUI();

    gameOverScreen.classList.remove("hidden");
}

function togglePause() {
    if (!gameRunning) return;

    paused = !paused;

    if (paused) {
        pauseScreen.classList.remove("hidden");
    } else {
        pauseScreen.classList.add("hidden");
        lastTime = performance.now();
    }
}

// ================================
// KEYBOARD CONTROLS (PC)
// ================================

document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (["arrowleft", "arrowright", "arrowdown", "arrowup", " "].includes(key)) {
        event.preventDefault();
    }

    if (key === "escape") {
        if (gameRunning) {
            showHome();
        }
        return;
    }

    if (key === "p") {
        togglePause();
        return;
    }

    if (!gameRunning || paused) return;

    if (key === "arrowleft" || key === "a") {
        moveLeft();
    } else if (key === "arrowright" || key === "d") {
        moveRight();
    } else if (key === "arrowdown" || key === "s") {
        moveDown();
        score++;
        updateUI();
    } else if (key === "arrowup" || key === "w") {
        rotatePiece();
    } else if (key === " ") {
        hardDrop();
    }
});

// ================================
// BUTTON EVENTS
// ================================

playButton.addEventListener("click", startGame);
scoresButton.addEventListener("click", showScores);
howToPlayButton.addEventListener("click", showHowToPlay);
settingsButton.addEventListener("click", showSettings);

scoresBackButton.addEventListener("click", showHome);
howToPlayBackButton.addEventListener("click", showHome);
settingsBackButton.addEventListener("click", () => {
    if (settingsReturnToPause && gameRunning) {
        settingsScreen.classList.add("hidden");
        pauseScreen.classList.remove("hidden");
        settingsReturnToPause = false;
    } else {
        showHome();
    }
});

restartButton.addEventListener("click", startGame);
gameOverHomeButton.addEventListener("click", showHome);
pauseHomeButton.addEventListener("click", showHome);

const resumeButton = document.getElementById("resumeButton");
if (resumeButton) {
    resumeButton.addEventListener("click", togglePause);
}

const pauseSettingsButton = document.getElementById("pauseSettingsButton");
if (pauseSettingsButton) {
    pauseSettingsButton.addEventListener("click", () => {
        showSettings(true);
    });
}

// ================================
// MODERN UI ENHANCEMENTS
// HISTORY & BACKGROUND ANIMATION
// ================================

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem("tetrisHistory") || "[]");
    } catch {
        return [];
    }
}

function saveGameResult() {
    const history = getHistory();
    const entry = {
        score,
        level,
        lines,
        date: new Date().toLocaleDateString()
    };

    history.unshift(entry);
    localStorage.setItem("tetrisHistory", JSON.stringify(history.slice(0, 10)));

    const gamesPlayed = Number(localStorage.getItem("tetrisGamesPlayed") || 0) + 1;
    localStorage.setItem("tetrisGamesPlayed", String(gamesPlayed));

    const bestLevel = Math.max(Number(localStorage.getItem("tetrisBestLevel") || 1), level);
    localStorage.setItem("tetrisBestLevel", String(bestLevel));

    const totalLines = Number(localStorage.getItem("tetrisTotalLines") || 0) + lines;
    localStorage.setItem("tetrisTotalLines", String(totalLines));
}

function historyMarkup(limit = 5) {
    const history = getHistory().slice(0, limit);
    if (!history.length) {
        return '<div class="history-empty">NO GAMES YET</div>';
    }

    return history.map((item, index) => `
        <div class="history-item">
            <span>#${index + 1}</span>
            <strong>${item.score}</strong>
            <small>L${item.level}</small>
        </div>
    `).join("");
}

function updateHistoryUI() {
    const html = historyMarkup(5);
    const homeList = document.getElementById("homeHistoryList");
    const rightList = document.getElementById("historyList");
    const fullList = document.getElementById("fullHistoryList");

    if (homeList) homeList.innerHTML = html;
    if (rightList) rightList.innerHTML = html;
    if (fullList) fullList.innerHTML = historyMarkup(10);

    const bestScore = Number(localStorage.getItem("tetrisHighScore") || highScore || 0);

    const homeBestScore = document.getElementById("homeBestScore");
    if (homeBestScore) homeBestScore.textContent = bestScore;

    const menuScoreValue = document.getElementById("menuScoreValue");
    if (menuScoreValue) menuScoreValue.textContent = bestScore;

    const statsBestScore = document.getElementById("statsBestScore");
    if (statsBestScore) statsBestScore.textContent = bestScore;

    const statsBestLevel = document.getElementById("statsBestLevel");
    if (statsBestLevel) {
        statsBestLevel.textContent = localStorage.getItem("tetrisBestLevel") || "1";
    }

    const statsLines = document.getElementById("statsLines");
    if (statsLines) {
        statsLines.textContent = localStorage.getItem("tetrisTotalLines") || "0";
    }

    const statsGames = document.getElementById("statsGames");
    if (statsGames) {
        statsGames.textContent = localStorage.getItem("tetrisGamesPlayed") || "0";
    }
}

function createBackgroundPieces() {
    const bg = document.getElementById("floatingBg");
    if (!bg || bg.children.length > 0) return;

    const colors = ["cyan", "purple", "blue", "yellow", "green", "red", "orange"];
    const shapes = [
        [[1, 1, 1, 1]],
        [[1, 1], [1, 1]],
        [[0, 1, 0], [1, 1, 1]],
        [[0, 1, 1], [1, 1, 0]],
        [[1, 1, 0], [0, 1, 1]],
        [[1, 0, 0], [1, 1, 1]],
        [[0, 0, 1], [1, 1, 1]]
    ];

    const isMobile = window.innerWidth < 700;
    const count = isMobile ? 22 : 38;

    for (let i = 0; i < count; i++) {
        const pieceEl = document.createElement("div");
        const colorClass = colors[i % colors.length];
        const shape = shapes[i % shapes.length];

        pieceEl.className = `bg-tetromino ${colorClass}`;
        pieceEl.style.setProperty("--cols", shape[0].length);
        pieceEl.style.setProperty("--rows", shape.length);

        const leftPos = Math.random() * 100;
        const topPos = -12 - Math.random() * 100;
        const scale = (0.45 + Math.random() * 1.35).toFixed(2);
        const duration = (10 + Math.random() * 14).toFixed(1);
        const delay = (-Math.random() * 20).toFixed(1);
        const drift = (-70 + Math.random() * 140).toFixed(0);

        pieceEl.style.left = `${leftPos}%`;
        pieceEl.style.top = `${topPos}px`;
        pieceEl.style.setProperty("--scale", scale);
        pieceEl.style.setProperty("--duration", `${duration}s`);
        pieceEl.style.setProperty("--delay", `${delay}s`);
        pieceEl.style.setProperty("--drift", `${drift}px`);

        let blocksHtml = "";
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    blocksHtml += `<i style="--x:${c};--y:${r}"></i>`;
                }
            }
        }
        pieceEl.innerHTML = blocksHtml;
        bg.appendChild(pieceEl);
    }
}

function setupSettings() {
    const toggles = document.querySelectorAll(".settings-toggle");
    toggles.forEach(btn => {
        btn.addEventListener("click", () => {
            const active = btn.classList.toggle("active");
            btn.textContent = active ? "ON" : "OFF";
            const settingName = btn.dataset.setting;
            if (settingName) {
                localStorage.setItem(`tetrisSetting_${settingName}`, active ? "1" : "0");
            }
        });
    });

    const volumeSlider = document.getElementById("volumeSlider");
    if (volumeSlider) {
        const savedVolume = localStorage.getItem("tetrisVolume") || "70";
        volumeSlider.value = savedVolume;
        volumeSlider.addEventListener("input", () => {
            localStorage.setItem("tetrisVolume", volumeSlider.value);
        });
    }

    const mobileToggle = document.getElementById("mobileToggle");
    if (mobileToggle) {
        mobileToggle.addEventListener("click", () => {
            const isActive = mobileToggle.classList.contains("active");
            const mobileControls = document.getElementById("mobileControls");
            if (mobileControls) {
                if (isActive) {
                    mobileControls.classList.remove("mobile-controls-disabled");
                } else {
                    mobileControls.classList.add("mobile-controls-disabled");
                }
            }
        });
    }
}

// ================================
// MOBILE TOUCH CONTROLS (SMART PHONE)
// ================================

function setupMobileControls() {
    const root = document.getElementById("mobileControls");
    if (!root) return;

    root.innerHTML = `
        <div class="mobile-top">
            <button class="control-button" data-action="rotate">↻</button>
            <button class="control-button" data-action="pause">Ⅱ</button>
        </div>
        <div class="mobile-direction-controls">
            <button class="control-button" data-action="left">◄</button>
            <button class="control-button" data-action="down">▼</button>
            <button class="control-button" data-action="right">►</button>
        </div>
        <button class="drop-button" data-action="drop">HARD DROP</button>
    `;

    let repeatTimer = null;
    let activeAction = null;

    const executeAction = (action) => {
        if (!gameRunning && action !== "pause") return;
        if (action === "pause") {
            togglePause();
            return;
        }
        if (paused) return;

        switch (action) {
            case "left":
                moveLeft();
                break;
            case "right":
                moveRight();
                break;
            case "down":
                moveDown();
                score++;
                updateUI();
                break;
            case "rotate":
                rotatePiece();
                break;
            case "drop":
                hardDrop();
                break;
        }
    };

    const stopRepeat = () => {
        if (repeatTimer) {
            clearInterval(repeatTimer);
            repeatTimer = null;
        }
        activeAction = null;
    };

    const startRepeat = (action) => {
        stopRepeat();
        executeAction(action);
        activeAction = action;

        // Зөвхөн чиглэлийн товчнууд (зүүн, баруун, доош) дараад байхад тасралтгүй хөдөлнө
        if (["left", "right", "down"].includes(action)) {
            repeatTimer = setInterval(() => {
                if (activeAction === action) {
                    executeAction(action);
                } else {
                    stopRepeat();
                }
            }, 100);
        }
    };

    // Pointer event ашиглан touch & mouse хоёуланг нь тохируулж дэлгэц скроллдохоос сэргийлэв
    root.addEventListener("pointerdown", e => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        e.preventDefault();
        btn.setPointerCapture(e.pointerId);
        startRepeat(btn.dataset.action);
    });

    root.addEventListener("pointerup", e => {
        const btn = e.target.closest("button[data-action]");
        if (btn) e.preventDefault();
        stopRepeat();
    });

    root.addEventListener("pointercancel", stopRepeat);
}

// INIT FUNCTIONS
createBackgroundPieces();
setupMobileControls();
setupSettings();
updateHistoryUI();

// ================================
// INITIALIZE
// ================================

board = createBoard();
highScoreElement.textContent = highScore;
menuHighScore.textContent = highScore;
nextPiece = randomPiece();

draw();
drawNextPiece();

// Show HOME on startup
showHome();
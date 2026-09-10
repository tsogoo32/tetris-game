// ================================
// MODERN TETRIS
// UPDATE 1
// HOME MENU
// ================================


// ================================
// CANVAS
// ================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

const nextCanvas =
    document.getElementById("nextCanvas");

const nextCtx =
    nextCanvas.getContext("2d");


// ================================
// UI ELEMENTS
// ================================

const scoreElement =
    document.getElementById("score");

const highScoreElement =
    document.getElementById("highScore");

const levelElement =
    document.getElementById("level");

const finalScoreElement =
    document.getElementById("finalScore");

const menuHighScore =
    document.getElementById("menuHighScore");


// ================================
// SCREENS
// ================================

const homeScreen =
    document.getElementById("homeScreen");

const scoresScreen =
    document.getElementById("scoresScreen");

const howToPlayScreen =
    document.getElementById("howToPlayScreen");

const settingsScreen =
    document.getElementById("settingsScreen");

const pauseScreen =
    document.getElementById("pauseScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");


// ================================
// BUTTONS
// ================================

const playButton =
    document.getElementById("playButton");

const scoresButton =
    document.getElementById("scoresButton");

const howToPlayButton =
    document.getElementById("howToPlayButton");

const settingsButton =
    document.getElementById("settingsButton");

const scoresBackButton =
    document.getElementById("scoresBackButton");

const howToPlayBackButton =
    document.getElementById("howToPlayBackButton");

const settingsBackButton =
    document.getElementById("settingsBackButton");

const restartButton =
    document.getElementById("restartButton");

const gameOverHomeButton =
    document.getElementById("gameOverHomeButton");

const pauseHomeButton =
    document.getElementById("pauseHomeButton");


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
        shape: [
            [1, 1, 1, 1]
        ],
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

let highScore =
    Number(
        localStorage.getItem(
            "tetrisHighScore"
        )
    ) || 0;

let gameRunning = false;

let paused = false;

let dropTimer = 0;

let lastTime = 0;

let animationFrame;


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

    gameRunning = false;

    paused = false;

    cancelAnimationFrame(
        animationFrame
    );

    hideAllScreens();

    homeScreen.classList.remove(
        "hidden"
    );

    updateUI();

    menuHighScore.textContent =
        highScore;
}


function showScores() {

    hideAllScreens();

    menuHighScore.textContent =
        highScore;

    scoresScreen.classList.remove(
        "hidden"
    );
}


function showHowToPlay() {

    hideAllScreens();

    howToPlayScreen.classList.remove(
        "hidden"
    );
}


function showSettings() {

    hideAllScreens();

    settingsScreen.classList.remove(
        "hidden"
    );
}


// ================================
// CREATE BOARD
// ================================

function createBoard() {

    return Array.from(
        {
            length: ROWS
        },

        () =>
            Array(COLS).fill(0)
    );
}


// ================================
// RANDOM PIECE
// ================================

function randomPiece() {

    const names =
        Object.keys(PIECES);

    const randomName =
        names[
            Math.floor(
                Math.random() *
                names.length
            )
        ];

    const piece =
        PIECES[randomName];

    return {

        name: randomName,

        shape:
            piece.shape.map(
                row => [...row]
            ),

        color:
            piece.color,

        x:
            Math.floor(
                COLS / 2 -
                piece.shape[0].length / 2
            ),

        y: 0

    };
}


// ================================
// START GAME
// ================================

function startGame() {

    board =
        createBoard();

    score = 0;

    level = 1;

    lines = 0;

    dropTimer = 0;

    paused = false;

    gameRunning = true;

    currentPiece =
        randomPiece();

    nextPiece =
        randomPiece();


    hideAllScreens();


    updateUI();

    draw();


    lastTime =
        performance.now();

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );
}


// ================================
// GAME LOOP
// ================================

function gameLoop(time) {

    if (!gameRunning) {
        return;
    }


    if (!paused) {

        const deltaTime =
            time - lastTime;

        dropTimer +=
            deltaTime;


        if (
            dropTimer >=
            getDropSpeed()
        ) {

            moveDown();

            dropTimer = 0;
        }


        draw();
    }


    lastTime = time;


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );
}


// ================================
// DROP SPEED
// ================================

function getDropSpeed() {

    return Math.max(
        100,
        800 -
        (level - 1) * 70
    );
}


// ================================
// MOVE LEFT
// ================================

function moveLeft() {

    currentPiece.x--;

    if (checkCollision()) {

        currentPiece.x++;
    }
}


// ================================
// MOVE RIGHT
// ================================

function moveRight() {

    currentPiece.x++;

    if (checkCollision()) {

        currentPiece.x--;
    }
}


// ================================
// MOVE DOWN
// ================================

function moveDown() {

    currentPiece.y++;


    if (checkCollision()) {

        currentPiece.y--;

        lockPiece();

        clearLines();

        spawnNextPiece();
    }
}


// ================================
// HARD DROP
// ================================

function hardDrop() {

    let distance = 0;


    while (!checkCollision()) {

        currentPiece.y++;

        distance++;
    }


    currentPiece.y--;


    score +=
        distance * 2;


    lockPiece();

    clearLines();

    spawnNextPiece();


    updateUI();
}


// ================================
// ROTATE
// ================================

function rotatePiece() {

    const oldShape =
        currentPiece.shape;


    const rows =
        oldShape.length;

    const cols =
        oldShape[0].length;


    const newShape = [];


    for (
        let x = 0;
        x < cols;
        x++
    ) {

        const newRow = [];


        for (
            let y = rows - 1;
            y >= 0;
            y--
        ) {

            newRow.push(
                oldShape[y][x]
            );
        }


        newShape.push(
            newRow
        );
    }


    currentPiece.shape =
        newShape;


    if (checkCollision()) {

        currentPiece.x--;


        if (checkCollision()) {

            currentPiece.x += 2;


            if (checkCollision()) {

                currentPiece.x--;

                currentPiece.shape =
                    oldShape;
            }
        }
    }
}


// ================================
// COLLISION
// ================================

function checkCollision() {

    const shape =
        currentPiece.shape;


    for (
        let y = 0;
        y < shape.length;
        y++
    ) {

        for (
            let x = 0;
            x < shape[y].length;
            x++
        ) {

            if (!shape[y][x]) {
                continue;
            }


            const boardX =
                currentPiece.x + x;

            const boardY =
                currentPiece.y + y;


            if (
                boardX < 0 ||
                boardX >= COLS
            ) {

                return true;
            }


            if (
                boardY >= ROWS
            ) {

                return true;
            }


            if (
                boardY >= 0 &&
                board[boardY][boardX]
            ) {

                return true;
            }
        }
    }


    return false;
}


// ================================
// LOCK PIECE
// ================================

function lockPiece() {

    const shape =
        currentPiece.shape;


    for (
        let y = 0;
        y < shape.length;
        y++
    ) {

        for (
            let x = 0;
            x < shape[y].length;
            x++
        ) {

            if (!shape[y][x]) {
                continue;
            }


            const boardX =
                currentPiece.x + x;

            const boardY =
                currentPiece.y + y;


            if (
                boardY >= 0 &&
                boardY < ROWS &&
                boardX >= 0 &&
                boardX < COLS
            ) {

                board[boardY][boardX] =
                    currentPiece.color;
            }
        }
    }
}


// ================================
// CLEAR LINES
// ================================

function clearLines() {

    let cleared = 0;


    for (
        let y = ROWS - 1;
        y >= 0;
        y--
    ) {

        const full =
            board[y].every(
                cell => cell !== 0
            );


        if (full) {

            board.splice(
                y,
                1
            );

            board.unshift(
                Array(COLS).fill(0)
            );

            cleared++;

            y++;
        }
    }


    if (cleared > 0) {

        lines +=
            cleared;


        const points = {

            1: 100,

            2: 300,

            3: 500,

            4: 800

        };


        score +=
            (points[cleared] || 0) *
            level;


        level =
            Math.floor(
                lines / 10
            ) + 1;


        updateUI();
    }
}


// ================================
// SPAWN NEXT
// ================================

function spawnNextPiece() {

    currentPiece =
        nextPiece;

    nextPiece =
        randomPiece();


    currentPiece.x =
        Math.floor(
            COLS / 2 -
            currentPiece.shape[0].length / 2
        );


    currentPiece.y = 0;


    if (checkCollision()) {

        endGame();
    }
}


// ================================
// DRAW
// ================================

function draw() {

    clearCanvas();

    drawBoard();

    drawGhostPiece();

    drawCurrentPiece();

    drawNextPiece();
}


// ================================
// CLEAR CANVAS
// ================================

function clearCanvas() {

    ctx.fillStyle =
        "#020617";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


// ================================
// DRAW BOARD
// ================================

function drawBoard() {

    for (
        let y = 0;
        y < ROWS;
        y++
    ) {

        for (
            let x = 0;
            x < COLS;
            x++
        ) {

            if (board[y][x]) {

                drawBlock(
                    ctx,
                    x,
                    y,
                    board[y][x],
                    BLOCK_SIZE
                );
            }
        }
    }


    ctx.strokeStyle =
        "rgba(148, 163, 184, 0.08)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x <= COLS;
        x++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x * BLOCK_SIZE,
            0
        );

        ctx.lineTo(
            x * BLOCK_SIZE,
            canvas.height
        );

        ctx.stroke();
    }


    for (
        let y = 0;
        y <= ROWS;
        y++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y * BLOCK_SIZE
        );

        ctx.lineTo(
            canvas.width,
            y * BLOCK_SIZE
        );

        ctx.stroke();
    }
}


// ================================
// DRAW BLOCK
// ================================

function drawBlock(
    context,
    x,
    y,
    color,
    size
) {

    const px =
        x * size;

    const py =
        y * size;


    context.fillStyle =
        color;


    context.fillRect(
        px + 1,
        py + 1,
        size - 2,
        size - 2
    );


    context.fillStyle =
        "rgba(255,255,255,0.25)";


    context.fillRect(
        px + 3,
        py + 3,
        size - 6,
        4
    );


    context.strokeStyle =
        "rgba(255,255,255,0.2)";


    context.strokeRect(
        px + 1,
        py + 1,
        size - 2,
        size - 2
    );
}


// ================================
// CURRENT PIECE
// ================================

function drawCurrentPiece() {

    const shape =
        currentPiece.shape;


    for (
        let y = 0;
        y < shape.length;
        y++
    ) {

        for (
            let x = 0;
            x < shape[y].length;
            x++
        ) {

            if (!shape[y][x]) {
                continue;
            }


            const drawY =
                currentPiece.y + y;


            if (drawY < 0) {
                continue;
            }


            drawBlock(
                ctx,
                currentPiece.x + x,
                drawY,
                currentPiece.color,
                BLOCK_SIZE
            );
        }
    }
}


// ================================
// GHOST PIECE
// ================================

function drawGhostPiece() {

    const originalY =
        currentPiece.y;

    let ghostY =
        currentPiece.y;


    while (true) {

        currentPiece.y =
            ghostY + 1;


        if (checkCollision()) {

            break;
        }


        ghostY++;
    }


    currentPiece.y =
        originalY;


    ctx.globalAlpha =
        0.2;


    const shape =
        currentPiece.shape;


    for (
        let y = 0;
        y < shape.length;
        y++
    ) {

        for (
            let x = 0;
            x < shape[y].length;
            x++
        ) {

            if (!shape[y][x]) {
                continue;
            }


            const drawY =
                ghostY + y;


            if (drawY >= 0) {

                drawBlock(
                    ctx,
                    currentPiece.x + x,
                    drawY,
                    currentPiece.color,
                    BLOCK_SIZE
                );
            }
        }
    }


    ctx.globalAlpha = 1;
}


// ================================
// NEXT PIECE
// ================================

function drawNextPiece() {

    nextCtx.fillStyle =
        "#020617";


    nextCtx.fillRect(
        0,
        0,
        nextCanvas.width,
        nextCanvas.height
    );


    const shape =
        nextPiece.shape;

    const size = 25;


    const width =
        shape[0].length *
        size;

    const height =
        shape.length *
        size;


    const offsetX =
        (nextCanvas.width -
            width) / 2;

    const offsetY =
        (nextCanvas.height -
            height) / 2;


    for (
        let y = 0;
        y < shape.length;
        y++
    ) {

        for (
            let x = 0;
            x < shape[y].length;
            x++
        ) {

            if (!shape[y][x]) {
                continue;
            }


            const px =
                offsetX / size + x;

            const py =
                offsetY / size + y;


            drawBlock(
                nextCtx,
                px,
                py,
                nextPiece.color,
                size
            );
        }
    }
}


// ================================
// UPDATE UI
// ================================

function updateUI() {

    scoreElement.textContent =
        score;

    levelElement.textContent =
        level;


    if (score > highScore) {

        highScore =
            score;


        localStorage.setItem(
            "tetrisHighScore",
            highScore
        );
    }


    highScoreElement.textContent =
        highScore;


    menuHighScore.textContent =
        highScore;
}


// ================================
// GAME OVER
// ================================

function endGame() {

    gameRunning = false;


    cancelAnimationFrame(
        animationFrame
    );


    finalScoreElement.textContent =
        score;


    gameOverScreen.classList.remove(
        "hidden"
    );
}


// ================================
// PAUSE
// ================================

function togglePause() {

    if (!gameRunning) {
        return;
    }


    paused =
        !paused;


    if (paused) {

        pauseScreen.classList.remove(
            "hidden"
        );

    } else {

        pauseScreen.classList.add(
            "hidden"
        );

        lastTime =
            performance.now();
    }
}


// ================================
// KEYBOARD
// ================================

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        // Prevent scrolling
        if (
            [
                "arrowleft",
                "arrowright",
                "arrowdown",
                "arrowup",
                " "
            ].includes(key)
        ) {

            event.preventDefault();
        }


        // ESC → HOME
        if (key === "escape") {

            if (gameRunning) {

                showHome();
            }

            return;
        }


        // P → PAUSE
        if (key === "p") {

            togglePause();

            return;
        }


        if (!gameRunning) {
            return;
        }


        if (paused) {
            return;
        }


        // LEFT
        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            moveLeft();
        }


        // RIGHT
        else if (
            key === "arrowright" ||
            key === "d"
        ) {

            moveRight();
        }


        // DOWN
        else if (
            key === "arrowdown" ||
            key === "s"
        ) {

            moveDown();

            score++;

            updateUI();
        }


        // ROTATE
        else if (
            key === "arrowup" ||
            key === "w"
        ) {

            rotatePiece();
        }


        // HARD DROP
        else if (key === " ") {

            hardDrop();
        }

    }
);


// ================================
// HOME BUTTONS
// ================================

playButton.addEventListener(
    "click",
    startGame
);


scoresButton.addEventListener(
    "click",
    showScores
);


howToPlayButton.addEventListener(
    "click",
    showHowToPlay
);


settingsButton.addEventListener(
    "click",
    showSettings
);


// ================================
// BACK BUTTONS
// ================================

scoresBackButton.addEventListener(
    "click",
    showHome
);


howToPlayBackButton.addEventListener(
    "click",
    showHome
);


settingsBackButton.addEventListener(
    "click",
    showHome
);


// ================================
// GAME OVER BUTTONS
// ================================

restartButton.addEventListener(
    "click",
    startGame
);


gameOverHomeButton.addEventListener(
    "click",
    showHome
);


pauseHomeButton.addEventListener(
    "click",
    showHome
);


// ================================
// INITIALIZE
// ================================

board =
    createBoard();


highScoreElement.textContent =
    highScore;


menuHighScore.textContent =
    highScore;


nextPiece =
    randomPiece();


draw();

drawNextPiece();


// Show HOME on startup
showHome();
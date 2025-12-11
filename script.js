// --- VARIABLES PRINCIPALES ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");

const scoreElem = document.getElementById("score");
const levelMessage = document.getElementById("levelMessage");

const rows = 20;
const cols = 10;
const blockSize = 20;

canvas.width = cols * blockSize;
canvas.height = rows * blockSize;

let board = Array.from({ length: rows }, () => Array(cols).fill(0));

const colors = [
    null,
    'cyan','blue','orange','yellow','green','purple','red'
];

const pieces = [
    [],
    [[1,1,1,1]],
    [[2,0,0],[2,2,2]],
    [[0,0,3],[3,3,3]],
    [[4,4],[4,4]],
    [[0,5,5],[5,5,0]],
    [[0,6,0],[6,6,6]],
    [[7,7,0],[0,7,7]]
];

function randomPiece() {
    const id = Math.floor(Math.random() * 7) + 1;
    return {
        shape: pieces[id],
        x: Math.floor(cols/2) - 1,
        y: 0,
        color: id
    };
}

let currentPiece = randomPiece();
let nextPiece = randomPiece();
let score = 0;
let gameOver = false;

// --- DIBUJO ---
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(let r=0; r<rows; r++){
        for(let c=0; c<cols; c++){
            if(board[r][c]){
                ctx.fillStyle = colors[board[r][c]];
                ctx.fillRect(c*blockSize, r*blockSize, blockSize, blockSize);
                ctx.strokeStyle = "#000";
                ctx.strokeRect(c*blockSize, r*blockSize, blockSize, blockSize);
            }
        }
    }

    for(let r=0; r<currentPiece.shape.length; r++){
        for(let c=0; c<currentPiece.shape[r].length; c++){
            if(currentPiece.shape[r][c]){
                ctx.fillStyle = colors[currentPiece.color];
                ctx.fillRect((currentPiece.x+c)*blockSize,(currentPiece.y+r)*blockSize,blockSize,blockSize);
                ctx.strokeStyle = "#000";
                ctx.strokeRect((currentPiece.x+c)*blockSize,(currentPiece.y+r)*blockSize,blockSize,blockSize);
            }
        }
    }

    if(gameOver){
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2 - 10);

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Pulsa cualquier tecla", canvas.width/2, canvas.height/2 + 20);
    }
}

function drawNextPiece() {
    nextCtx.clearRect(0,0,nextCanvas.width,nextCanvas.height);
    const shape = nextPiece.shape;
    const bw = shape[0].length * blockSize;
    const bh = shape.length * blockSize;
    const offsetX = (nextCanvas.width - bw) / 2;
    const offsetY = (nextCanvas.height - bh) / 2;

    for(let r=0; r<shape.length; r++){
        for(let c=0; c<shape[r].length; c++){
            if(shape[r][c]){
                nextCtx.fillStyle = colors[nextPiece.color];
                nextCtx.fillRect(offsetX + c*blockSize, offsetY + r*blockSize, blockSize, blockSize);
                nextCtx.strokeStyle = "#000";
                nextCtx.strokeRect(offsetX + c*blockSize, offsetY + r*blockSize, blockSize, blockSize);
            }
        }
    }
}

// --- LÓGICA ---
function collide(board, piece) {
    for(let r=0; r<piece.shape.length; r++){
        for(let c=0; c<piece.shape[r].length; c++){
            if(piece.shape[r][c]){
                let x = piece.x + c;
                let y = piece.y + r;
                if(y >= rows || x < 0 || x >= cols || board[y][x]) return true;
            }
        }
    }
    return false;
}

function merge(board, piece) {
    for(let r=0; r<piece.shape.length; r++){
        for(let c=0; c<piece.shape[r].length; c++){
            if(piece.shape[r][c]){
                board[piece.y + r][piece.x + c] = piece.color;
            }
        }
    }
}

function clearLines() {
    let lines = 0;
    outer: for(let r = rows - 1; r >= 0; r--) {
        for(let c = 0; c < cols; c++) {
            if(board[r][c] === 0) continue outer;
        }
        board.splice(r, 1);
        board.unshift(Array(cols).fill(0));
        lines++;
        r++;
    }
levelMessage.style.fontFamily = "Arial"; // Siempre Arial

if(score >= 500) {
    levelMessage.style.fontStyle = "normal";
    levelMessage.textContent = "Pulp Fiction";
}
else if(score >= 1000) {
    levelMessage.style.fontStyle = "normal";
    levelMessage.textContent = "Ahora es antes, ayer es mañana, luego es pronto, después es tarde, mañana es pasado y ahora es futuro.";
}
else if(score >= 1500) {
    levelMessage.style.fontStyle = "italic"; // Cursiva en 1500
    levelMessage.textContent = "Praeteritum, praesens, futurum";
}
else if(score >= 2500) {
    levelMessage.style.fontStyle = "normal";
    levelMessage.textContent = "Ya no hay más, no sigas";
}
else if(score >= 3000) {
    levelMessage.style.fontStyle = "normal";
    levelMessage.textContent = "En serio, no hay más";
}
else if(score >= 4000) {
    levelMessage.style.fontStyle = "normal";
    levelMessage.textContent = "...";
}
else if(score >= 5000) {
    levelMessage.style.fontStyle = "normal";
    levelMessage.textContent = "enhorabuena";
}   
}

function rotate(piece) {
    const shape = piece.shape;
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;

    let newShape = [];
    for(let c = 0; c < shapeCols; c++) {
        newShape[c] = [];
        for(let r = shapeRows - 1; r >= 0; r--) {
            newShape[c][shapeRows - 1 - r] = shape[r][c];
        }
    }

    const oldShape = piece.shape;
    const oldX = piece.x;
    piece.shape = newShape;

    const kicks = [0, -1, 1];
    let valid = false;
    for(let k of kicks) {
        piece.x = oldX + k;
        if(!collide(board, piece)) {
            valid = true;
            break;
        }
    }

    if(!valid) {
        piece.shape = oldShape;
        piece.x = oldX;
    }
}

function move(dir) {
    if(gameOver) return;
    currentPiece.x += dir;
    if(collide(board, currentPiece)) currentPiece.x -= dir;
}

function hardDrop() {
    if(gameOver) return;
    while(!collide(board, currentPiece)) {
        currentPiece.y++;
    }
    currentPiece.y--;
    merge(board, currentPiece);
    clearLines();
    currentPiece = nextPiece;
    nextPiece = randomPiece();
    drawNextPiece();
    if(collide(board, currentPiece)) gameOver = true;
}

function restartGame() {
    board = Array.from({ length: rows }, () => Array(cols).fill(0));
    score = 0;
    scoreElem.textContent = "0";
    levelMessage.textContent = "";
    currentPiece = randomPiece();
    nextPiece = randomPiece();
    drawNextPiece();
    gameOver = false;
}

// --- ANIMACIÓN ---
let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;

function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;
    if(!gameOver && dropCounter > dropInterval) {
        currentPiece.y++;
        if(collide(board, currentPiece)) {
            currentPiece.y--;
            merge(board, currentPiece);
            clearLines();
            currentPiece = nextPiece;
            nextPiece = randomPiece();
            drawNextPiece();
            if(collide(board, currentPiece)) gameOver = true;
        }
        dropCounter = 0;
    }
    draw();
    requestAnimationFrame(update);
}

// --- CONTROLES TECLADO ---
document.addEventListener("keydown", e => {
    if(gameOver) {
        restartGame();
        return;
    }
    if(e.key === "ArrowLeft") move(-1);
    if(e.key === "ArrowRight") move(1);
    if(e.key === "ArrowDown") {
        currentPiece.y++;
        if(collide(board, currentPiece)) currentPiece.y--;
    }
    if(e.key === "ArrowUp") rotate(currentPiece);
    if(e.key === " ") hardDrop();
});

// --- CONTROLES MÓVILES (touch only) ---
document.querySelectorAll(".btn-touch").forEach(btn => {
    btn.addEventListener("touchstart", e => {
        e.preventDefault();
        if(gameOver) {
            restartGame();
            return;
        }
        const action = btn.dataset.action;
        if(action === "left") move(-1);
        else if(action === "right") move(1);
        else if(action === "down") {
            currentPiece.y++;
            if(collide(board, currentPiece)) currentPiece.y--;
        }
        else if(action === "rotate") rotate(currentPiece);
        else if(action === "drop") hardDrop();
    });
});

// --- INICIO ---
drawNextPiece();
update();
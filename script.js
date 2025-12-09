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

let board = Array.from({length: rows}, () => Array(cols).fill(0));

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

function collide(board, piece) {
    for(let r=0; r<piece.shape.length; r++){
        for(let c=0; c<piece.shape[r].length; c++){
            if(piece.shape[r][c]){
                let x = piece.x + c;
                let y = piece.y + r;
                if(y >= rows || x < 0 || x >= cols || board[y][x]) 
                    return true;
            }
        }
    }
    return false;
}

function merge(board, piece){
    for(let r=0; r<piece.shape.length; r++){
        for(let c=0; c<piece.shape[r].length; c++){
            if(piece.shape[r][c]){
                board[piece.y + r][piece.x + c] = piece.color;
            }
        }
    }
}

function clearLines(){
    let lines = 0;

    outer: for(let r = rows-1; r>=0; r--){
        for(let c=0; c<cols; c++){
            if(board[r][c] === 0) continue outer;
        }
        board.splice(r,1);
        board.unshift(Array(cols).fill(0));
        lines++;
        r++;
    }

    if(lines > 0){
        score += lines * 100;
        scoreElem.textContent = score;

        if(score >= 1000) levelMessage.textContent = "Br1 es el mejor";
        if(score >= 2000) levelMessage.textContent = "Bruno sigue siendo el mejor";
        if(score >= 3000) levelMessage.textContent = "¡3.000 puntos!";
        if(score >= 4000) levelMessage.textContent = "¡4.000 puntos!";
        if(score >= 5000) levelMessage.textContent = "Ya no hay más, no sigsas";
    }
}

function rotate(piece){
    const shape = piece.shape;
    const rows = shape.length;
    const cols = shape[0].length;

    let newShape = [];
    for(let c=0; c<cols; c++){
        newShape[c] = [];
        for(let r=rows-1; r>=0; r--){
            newShape[c][rows-1-r] = shape[r][c];
        }
    }

    const oldShape = piece.shape;
    const oldX = piece.x;

    piece.shape = newShape;

    const kicks = [0, -1, 1];
    let valid = false;
    for(let k of kicks){
        piece.x = oldX + k;
        if(!collide(board, piece)){
            valid = true;
            break;
        }
    }

    if(!valid){
        piece.shape = oldShape;
        piece.x = oldX;
    }
}

function move(dir){
    if(gameOver) return;
    currentPiece.x += dir;
    if(collide(board,currentPiece)) currentPiece.x -= dir;
}

function hardDrop(){
    if(gameOver) return;

    while(!collide(board,currentPiece)){
        currentPiece.y++;
    }
    currentPiece.y--;
    merge(board,currentPiece);
    clearLines();

    currentPiece = nextPiece;
    nextPiece = randomPiece();
    drawNextPiece();

    if(collide(board,currentPiece)){
        gameOver = true;
    }
}

let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;

function update(time=0){
    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;

    if(!gameOver && dropCounter > dropInterval){
        currentPiece.y++;
        if(collide(board,currentPiece)){
            currentPiece.y--;
            merge(board,currentPiece);
            clearLines();

            currentPiece = nextPiece;
            nextPiece = randomPiece();
            drawNextPiece();

            if(collide(board,currentPiece)){
                gameOver = true;
            }
        }
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

document.addEventListener("keydown", e => {
    if(gameOver){
        board = Array.from({length: rows}, () => Array(cols).fill(0));
        score = 0;
        scoreElem.textContent = "0";
        levelMessage.textContent = "";
        currentPiece = randomPiece();
        nextPiece = randomPiece();
        drawNextPiece();
        gameOver = false;
        return;
    }

    if(e.key === "ArrowLeft") move(-1);
    if(e.key === "ArrowRight") move(1);
    if(e.key === "ArrowDown"){
        currentPiece.y++;
        if(collide(board,currentPiece)) currentPiece.y--;
    }
    if(e.key === "ArrowUp") rotate(currentPiece);
    if(e.key === " ") hardDrop();
});

// --- Controles táctiles ---
document.querySelectorAll(".btn-touch").forEach(btn => {
    btn.addEventListener("touchstart", () => {
        const action = btn.dataset.action;
        
        if(action === "left") move(-1);
        if(action === "right") move(1);
        if(action === "down") {
            currentPiece.y++;
            if(collide(board,currentPiece)) currentPiece.y--;
        }
        if(action === "rotate") rotate(currentPiece);
        if(action === "drop") hardDrop();
    });
});

drawNextPiece();
update();
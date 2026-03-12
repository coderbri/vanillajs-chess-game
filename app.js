const playerDisplay = document.querySelector("#player");
const infoDisplay  = document.querySelector("#info-display");
const width = 8;

let playerGo = 'black';
playerDisplay.textContent = 'black';

// ─── Initial board layout ──────────────────────────────────────────────────
const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook,
];

// ─── Screen transitions ────────────────────────────────────────────────────
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    const gameScreen = document.getElementById('game-screen');
    gameScreen.classList.remove('hidden');

    // Build board and labels fresh on first start
    buildRankLabels();
    createBoard();
    attachListeners();

    // Reset state
    playerGo = 'black';
    playerDisplay.textContent = 'black';
    infoDisplay.textContent = '';
}

function newGame() {
    // Clear the board and rebuild everything
    const gameboard = document.querySelector("#gameboard");
    gameboard.innerHTML = '';
    document.getElementById('rank-labels').innerHTML = '';

    playerGo = 'black';
    playerDisplay.textContent = 'black';
    infoDisplay.textContent = '';

    buildRankLabels();
    createBoard();
    attachListeners();
}

// ─── Rank labels (8 → 1) ──────────────────────────────────────────────────
function buildRankLabels() {
    const container = document.getElementById('rank-labels');
    for (let r = 8; r >= 1; r--) {
        const span = document.createElement('span');
        span.textContent = r;
        container.appendChild(span);
    }
}

// ─── Board creation ────────────────────────────────────────────────────────
function createBoard() {
    const gameboard = document.querySelector("#gameboard");

    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div');
        square.classList.add('square');
        square.innerHTML = startPiece;

        square.firstChild?.setAttribute('draggable', true);
        square.setAttribute('square-id', i);

        const row = Math.floor((63 - i) / 8) + 1;
        if (row % 2 === 0) {
            square.classList.add(i % 2 === 0 ? 'beige' : 'brown');
        } else {
            square.classList.add(i % 2 === 0 ? 'brown' : 'beige');
        }

        // FIX #1: optional chaining prevents crash on empty squares
        if (i <= 15) square.firstChild?.classList.add('black');
        if (i >= 48) square.firstChild?.classList.add('white');

        gameboard.append(square);
    });
}

// ─── Drag-and-drop listeners ───────────────────────────────────────────────
function attachListeners() {
    const allSquares = document.querySelectorAll(".square");
    allSquares.forEach(square => {
        square.addEventListener('dragstart', dragStart);
        square.addEventListener('dragover',  dragOver);
        square.addEventListener('drop',      dragDrop);
    });
}

let startPositionId;
let draggedElement;

function dragStart(e) {
    const pieceElement = e.target.closest('.piece');
    if (!pieceElement) return;
    startPositionId = pieceElement.parentNode.getAttribute('square-id');
    draggedElement  = pieceElement;
}

function dragOver(e) {
    e.preventDefault();
}

function dragDrop(e) {
    e.stopPropagation();

    const square = e.target.closest('.square');
    if (!square) return;

    const targetPiece      = square.querySelector('.piece');
    const correctGo        = draggedElement.classList.contains(playerGo);
    const taken            = Boolean(targetPiece);
    const valid            = checkIfValid(square);
    const opponentGo       = playerGo === 'white' ? 'black' : 'white';
    const takenByOpponent  = targetPiece?.classList.contains(opponentGo);

    if (correctGo) {
        // ⚔️ Capture
        if (takenByOpponent && valid) {
            targetPiece.remove();
            square.appendChild(draggedElement);
            checkForWin();
            changePlayer();
            return;
        }
        // 🚫 Own piece
        if (taken && !takenByOpponent) {
            showInfo("Illegal move! You cannot go here.");
            return;
        }
        // ✅ Move to empty square
        if (!taken && valid) {
            square.appendChild(draggedElement);
            checkForWin();
            changePlayer();
            return;
        }
        // FIX #2: Invalid move feedback
        showInfo("Invalid move!");
    }
}

function showInfo(msg, duration = 2000) {
    infoDisplay.textContent = msg;
    if (duration) setTimeout(() => { if (infoDisplay.textContent === msg) infoDisplay.textContent = ''; }, duration);
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function pieceAt(id) {
    return document.querySelector(`[square-id="${id}"]`)?.firstChild || null;
}

function slidingRay(startId, targetId, stepFn, colCheckFn, maxSteps = 7) {
    for (let n = 1; n <= maxSteps; n++) {
        const sq = stepFn(startId, n);
        if (!colCheckFn(startId, n)) break;
        if (sq < 0 || sq > 63) break;
        const intermediates = [];
        for (let m = 1; m < n; m++) intermediates.push(stepFn(startId, m));
        if (!intermediates.every(id => !pieceAt(id))) break;
        if (sq === targetId) return true;
    }
    return false;
}

// ─── Move validation ──────────────────────────────────────────────────────
function checkIfValid(target) {
    const targetId  = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'));
    const startId   = Number(startPositionId);
    const piece     = draggedElement.id;
    const startCol  = startId % width;
    const targetCol = targetId % width;

    switch (piece) {

        case 'pawn': {
            const opponentColor  = playerGo === 'white' ? 'black' : 'white';
            const starterRow     = [8,9,10,11,12,13,14,15];
            if (
                // FIX #3a: 2-square advance — destination must be empty
                starterRow.includes(startId) && startId + width * 2 === targetId &&
                    !pieceAt(startId + width) && !pieceAt(startId + width * 2) ||
                // FIX #3b: 1-square advance — must be empty
                startId + width === targetId && !pieceAt(startId + width) ||
                // FIX #4: Diagonal capture — opponent's piece only, column-guarded
                startId + width - 1 === targetId && targetCol === startCol - 1 &&
                    document.querySelector(`[square-id="${startId + width - 1}"]`)?.querySelector(`.${opponentColor}`) ||
                startId + width + 1 === targetId && targetCol === startCol + 1 &&
                    document.querySelector(`[square-id="${startId + width + 1}"]`)?.querySelector(`.${opponentColor}`)
            ) return true;
            break;
        }

        case 'knight':
            // FIX #6: column guards prevent edge-wrapping
            if (
                startId + width * 2 + 1 === targetId && targetCol === startCol + 1 ||
                startId + width * 2 - 1 === targetId && targetCol === startCol - 1 ||
                startId + width - 2     === targetId && targetCol === startCol - 2 ||
                startId + width + 2     === targetId && targetCol === startCol + 2 ||
                startId - width * 2 + 1 === targetId && targetCol === startCol + 1 ||
                startId - width * 2 - 1 === targetId && targetCol === startCol - 1 ||
                startId - width - 2     === targetId && targetCol === startCol - 2 ||
                startId - width + 2     === targetId && targetCol === startCol + 2
            ) return true;
            break;

        case 'bishop':
            // FIX #5: column-aware sliding rays
            if (slidingRay(startId, targetId, (s,n) => s + width*n + n, (s,n) => (s%width)+n < width)) return true;
            if (slidingRay(startId, targetId, (s,n) => s + width*n - n, (s,n) => (s%width)-n >= 0))    return true;
            if (slidingRay(startId, targetId, (s,n) => s - width*n + n, (s,n) => (s%width)+n < width)) return true;
            if (slidingRay(startId, targetId, (s,n) => s - width*n - n, (s,n) => (s%width)-n >= 0))    return true;
            break;

        case 'rook':
            if (slidingRay(startId, targetId, (s,n) => s + width*n, () => true))                        return true;
            if (slidingRay(startId, targetId, (s,n) => s - width*n, () => true))                        return true;
            if (slidingRay(startId, targetId, (s,n) => s + n, (s,n) => (s%width)+n < width))           return true;
            if (slidingRay(startId, targetId, (s,n) => s - n, (s,n) => (s%width)-n >= 0))              return true;
            break;

        case 'queen':
            if (slidingRay(startId, targetId, (s,n) => s + width*n + n, (s,n) => (s%width)+n < width)) return true;
            if (slidingRay(startId, targetId, (s,n) => s + width*n - n, (s,n) => (s%width)-n >= 0))    return true;
            if (slidingRay(startId, targetId, (s,n) => s - width*n + n, (s,n) => (s%width)+n < width)) return true;
            if (slidingRay(startId, targetId, (s,n) => s - width*n - n, (s,n) => (s%width)-n >= 0))    return true;
            if (slidingRay(startId, targetId, (s,n) => s + width*n, () => true))                        return true;
            if (slidingRay(startId, targetId, (s,n) => s - width*n, () => true))                        return true;
            if (slidingRay(startId, targetId, (s,n) => s + n, (s,n) => (s%width)+n < width))           return true;
            if (slidingRay(startId, targetId, (s,n) => s - n, (s,n) => (s%width)-n >= 0))              return true;
            break;

        case 'king':
            // FIX #5: column guards on horizontal/diagonal moves
            if (
                startId + 1       === targetId && targetCol === startCol + 1 ||
                startId - 1       === targetId && targetCol === startCol - 1 ||
                startId + width   === targetId ||
                startId - width   === targetId ||
                startId + width - 1 === targetId && targetCol === startCol - 1 ||
                startId + width + 1 === targetId && targetCol === startCol + 1 ||
                startId - width + 1 === targetId && targetCol === startCol + 1 ||
                startId - width - 1 === targetId && targetCol === startCol - 1
            ) return true;
            break;
    }
    return false;
}

// ─── Turn management ───────────────────────────────────────────────────────
function changePlayer() {
    if (playerGo === "black") {
        reverseIds();
        playerGo = "white";
        playerDisplay.textContent = "white";
    } else {
        revertIds();
        playerGo = "black";
        playerDisplay.textContent = "black";
    }
    infoDisplay.textContent = '';
}

function reverseIds() {
    document.querySelectorAll(".square").forEach((sq, i) =>
        sq.setAttribute("square-id", (width * width - 1) - i));
}

function revertIds() {
    document.querySelectorAll(".square").forEach((sq, i) =>
        sq.setAttribute('square-id', i));
}

// ─── Win detection ─────────────────────────────────────────────────────────
function checkForWin() {
    const kings = Array.from(document.querySelectorAll("#king"));

    if (!kings.some(k => k.classList.contains('white'))) {
        showInfo("Checkmate! Black player wins!", 0);
        disableAllPieces();
    }
    if (!kings.some(k => k.classList.contains('black'))) {
        showInfo("Checkmate! White player wins!", 0);
        disableAllPieces();
    }
}

function disableAllPieces() {
    document.querySelectorAll('.square').forEach(sq =>
        sq.firstChild?.setAttribute('draggable', false));
}
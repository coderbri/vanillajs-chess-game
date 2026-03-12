const gameboard = document.querySelector("#gameboard"); // Main gameboard container
const playerDisplay = document.querySelector("#player"); // Displays current player's turn
const infoDisplay = document.querySelector("#info-display"); // Info messages (check, captures, invalid moves)
const width = 8; // Chessboard width (8x8)

// Start state: Black goes first
let playerGo = 'black';
playerDisplay.textContent = 'black'; 

// Initial layout of the chessboard (top row -> bottom row)
const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,    // row 0
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,             // row 1
    '', '', '', '', '', '', '', '',                             // row 2
    '', '', '', '', '', '', '', '',                             // row 3
    '', '', '', '', '', '', '', '',                             // row 4
    '', '', '', '', '', '', '', '',                             // row 5
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,             // row 6
    rook, knight, bishop, queen, king, bishop, knight, rook,    // row 7
]

function createBoard() {
    /* Dynamically generates 64 squares and places starting pieces. */
    startPieces.forEach((startPiece, i) => {
        // Create each square
        const square = document.createElement('div');
        square.classList.add('square'); // Create square
        square.innerHTML = startPiece;  // Insert piece (if any)
        
        // Make pieces draggable (if exists).
        square.firstChild?.setAttribute('draggable', true);
        
        // Assign unique square ID (0-63)
        square.setAttribute('square-id', i);
        
        // Calculate row number (1-8) from index i for alternating colors
        const row =  Math.floor( (63 - i) / 8) + 1;
        if ( row % 2 === 0 ) {
            square.classList.add(i % 2 === 0 ? 'beige' : 'brown');
        } else {
            square.classList.add(i % 2 === 0 ? 'brown' : 'beige');
        }
        
        // FIX #1: Use optional chaining to avoid TypeError on empty squares (rows 2-5 have no firstChild)
        if (i <= 15) square.firstChild?.classList.add('black'); // Black pieces - first 16 squares
        if (i >= 48) square.firstChild?.classList.add('white'); // White pieces - last 16 squares
        
        gameboard.append(square); // Add square on board
    });
}

createBoard(); // Initialize board


// Grab all squares after board is built
const allSquares = document.querySelectorAll(".square");

// Attach drag-and-drop listeners for each square
allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart);
    square.addEventListener('dragover', dragOver);
    square.addEventListener('drop', dragDrop);
});

// Global variables to tracking drag state
let startPositionId;
let draggedElement;

function dragStart(e) {
    /**
     * Handles the start of a drag operation when user begins dragging a chess piece.
     * Records the starting position and piece for later validation.
    */
    const pieceElement = e.target.closest('.piece');
    if (!pieceElement) return;
    startPositionId = pieceElement.parentNode.getAttribute('square-id');
    draggedElement = pieceElement;
}

function dragOver(e) {
    /**
     * Allows dropping on squares during drag operation.
     * Required by HTML5 drag-and-drop API to enable drop events.
    */
    e.preventDefault();
}

function dragDrop(e) {
    // Prevents event bubbling (avoids triggering multiple listeners)
    e.stopPropagation();

    const square = e.target.closest('.square');
    if (!square) return;

    const targetPiece = square.querySelector('.piece'); // Opponent piece (if exists)

    const correctGo = draggedElement.classList.contains(playerGo);        // True if player moves their own piece
    const taken = Boolean(targetPiece);                                   // True if square is already occupied
    const valid = checkIfValid(square);                                   // Checks if move follows piece-specific rules
    const opponentGo = playerGo === 'white' ? 'black' : 'white';          // Assigns opposite color for capture logic
    const takenByOpponent = targetPiece?.classList.contains(opponentGo);  // True if target square has enemy piece
    
    // Ensure player moves their own piece only
    if (correctGo) {
        // ⚔️ CASE 1: Capturing opponent's pieces
        if (takenByOpponent && valid) {
            targetPiece.remove();               // Removes opponent piece (capture)
            square.appendChild(draggedElement); // Move current player's piece into opponent's parent square
            checkForWin();                      // Checks if a king has been captured
            changePlayer();                     // Switches turns
            return;
        }
        // 🚫 CASE 2: Square is occupied by its own piece -> Illegal move
        if (taken && !takenByOpponent) {
            infoDisplay.textContent = "Illegal move! You cannot go here.";
            setTimeout(() => infoDisplay.textContent = "", 2000);
            return;
        }
        // ✅ CASE 3: Free square -> Move normally
        if (!taken && valid) {
            square.appendChild(draggedElement);
            checkForWin();
            changePlayer();
            return;
        }
        // FIX #2: Invalid move on empty square — show feedback instead of silently doing nothing
        infoDisplay.textContent = "Invalid move!";
        setTimeout(() => infoDisplay.textContent = "", 2000);
    }
}

// ─── Helper: get the piece on a given square ID (or null) ───────────────────
function pieceAt(id) {
    return document.querySelector(`[square-id="${id}"]`)?.firstChild || null;
}

// ─── Helper: check if a straight/diagonal ray is clear up to (not including) targetId ──
// steps: array of intermediate square IDs to check for blocking pieces
function pathClear(...steps) {
    return steps.every(id => !pieceAt(id));
}

// ─── Helper: build a sliding ray and return true if targetId is reachable ───
// FIX #5/#6: All sliding moves now use column-aware helpers to prevent board-edge wrapping.
// colCheck is called for each step to ensure the move stays on the same row segment.
function slidingRay(startId, targetId, stepFn, colCheckFn, maxSteps = 7) {
    for (let n = 1; n <= maxSteps; n++) {
        const sq = stepFn(startId, n);
        if (!colCheckFn(startId, n)) break; // would wrap off the board edge — stop
        if (sq < 0 || sq > 63) break;       // out of board bounds — stop
        // Check all intermediate squares are empty
        const intermediates = [];
        for (let m = 1; m < n; m++) intermediates.push(stepFn(startId, m));
        if (!pathClear(...intermediates)) break; // path blocked — stop
        if (sq === targetId) return true;
    }
    return false;
}

function checkIfValid(target) {
    /*
        Checks whether the dragged piece's move is valid.
    */
    const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'));
    const startId = Number(startPositionId);
    const piece = draggedElement.id;
    const startCol = startId % width;   // column (0-7) of the piece being moved
    const targetCol = targetId % width; // column (0-7) of the destination

    switch(piece) {

        case 'pawn':
            /* PAWN MOVEMENT RULES:
                - Can move forward 1 square (if not blocked)
                - From starting row, can move forward 2 squares (if both squares are clear)
                - Can capture diagonally forward only if an *opponent's* piece is there
            */
            const opponentColor = playerGo === 'white' ? 'black' : 'white';
            const starterRow = [8,9,10,11,12,13,14,15]; // pawns' starting row (black's perspective / post-flip for white)

            if (
                // FIX #3a: 2-square advance — destination must also be empty (not just intermediate)
                starterRow.includes(startId) && startId + width * 2 === targetId &&
                    !pieceAt(startId + width) && !pieceAt(startId + width * 2) ||
                // FIX #3b: 1-square advance — destination must be empty (pawns can't capture forward)
                startId + width === targetId && !pieceAt(startId + width) ||
                // FIX #4: Diagonal capture — must be an *opponent's* piece (not just any piece)
                startId + width - 1 === targetId && targetCol === startCol - 1 &&
                    document.querySelector(`[square-id="${startId + width - 1}"]`)?.querySelector(`.${opponentColor}`) ||
                startId + width + 1 === targetId && targetCol === startCol + 1 &&
                    document.querySelector(`[square-id="${startId + width + 1}"]`)?.querySelector(`.${opponentColor}`)
            ) {
                return true;
            }
            break;
        
        case 'knight':
            /* KNIGHT MOVEMENT RULES:
                - Moves in an "L" shape: 2 steps in one direction, then 1 step perpendicular
                - FIX #6: Column checks prevent wrapping around board edges
            */
            if (
                // Forward 2, Right 1
                startId + width * 2 + 1 === targetId && targetCol === startCol + 1 ||
                // Forward 2, Left 1
                startId + width * 2 - 1 === targetId && targetCol === startCol - 1 ||
                // Forward 1, Left 2  (note: comment in original was swapped — corrected here)
                startId + width - 2 === targetId && targetCol === startCol - 2 ||
                // Forward 1, Right 2
                startId + width + 2 === targetId && targetCol === startCol + 2 ||
                // Backward 2, Right 1
                startId - width * 2 + 1 === targetId && targetCol === startCol + 1 ||
                // Backward 2, Left 1
                startId - width * 2 - 1 === targetId && targetCol === startCol - 1 ||
                // Backward 1, Left 2
                startId - width - 2 === targetId && targetCol === startCol - 2 ||
                // Backward 1, Right 2
                startId - width + 2 === targetId && targetCol === startCol + 2
            ) {
                return true;
            }
            break;
        
        case 'bishop':
            /* BISHOP MOVEMENT RULES:
                - Moves diagonally in any direction unless blocked
                - FIX #5: Column guards ensure diagonal steps don't wrap across row boundaries
            */
            // Diagonal forward-right: col increases by 1 each step
            if (slidingRay(startId, targetId, (s,n) => s + width*n + n, (s,n) => (s%width)+n < width)) return true;
            // Diagonal forward-left: col decreases by 1 each step
            if (slidingRay(startId, targetId, (s,n) => s + width*n - n, (s,n) => (s%width)-n >= 0)) return true;
            // Diagonal backward-right: col increases by 1 each step
            if (slidingRay(startId, targetId, (s,n) => s - width*n + n, (s,n) => (s%width)+n < width)) return true;
            // Diagonal backward-left: col decreases by 1 each step
            if (slidingRay(startId, targetId, (s,n) => s - width*n - n, (s,n) => (s%width)-n >= 0)) return true;
            break;
        
        case 'rook':
            /* ROOK MOVEMENT RULES:
                - Moves vertically (up/down) or horizontally (left/right)
                - Cannot jump over other pieces; path must be clear
                - FIX #5: Horizontal moves guarded by column checks to prevent row-wrapping
            */
            // Vertical forward (no column change needed)
            if (slidingRay(startId, targetId, (s,n) => s + width*n, () => true)) return true;
            // Vertical backward
            if (slidingRay(startId, targetId, (s,n) => s - width*n, () => true)) return true;
            // Horizontal right: col must stay < 8
            if (slidingRay(startId, targetId, (s,n) => s + n, (s,n) => (s%width)+n < width)) return true;
            // Horizontal left: col must stay >= 0
            if (slidingRay(startId, targetId, (s,n) => s - n, (s,n) => (s%width)-n >= 0)) return true;
            break;
        
        case 'queen':
            /* QUEEN MOVEMENT RULES:
                - Combines rook + bishop moves
                - Moves any number of squares vertically, horizontally, or diagonally
                - Cannot jump over other pieces
            */
            // Diagonal forward-right
            if (slidingRay(startId, targetId, (s,n) => s + width*n + n, (s,n) => (s%width)+n < width)) return true;
            // Diagonal forward-left
            if (slidingRay(startId, targetId, (s,n) => s + width*n - n, (s,n) => (s%width)-n >= 0)) return true;
            // Diagonal backward-right
            if (slidingRay(startId, targetId, (s,n) => s - width*n + n, (s,n) => (s%width)+n < width)) return true;
            // Diagonal backward-left
            if (slidingRay(startId, targetId, (s,n) => s - width*n - n, (s,n) => (s%width)-n >= 0)) return true;
            // Vertical forward
            if (slidingRay(startId, targetId, (s,n) => s + width*n, () => true)) return true;
            // Vertical backward
            if (slidingRay(startId, targetId, (s,n) => s - width*n, () => true)) return true;
            // Horizontal right
            if (slidingRay(startId, targetId, (s,n) => s + n, (s,n) => (s%width)+n < width)) return true;
            // Horizontal left
            if (slidingRay(startId, targetId, (s,n) => s - n, (s,n) => (s%width)-n >= 0)) return true;
            break;
        
        case 'king':
            /* KING MOVEMENT RULES:
                - Moves one square in any direction (vertically, horizontally, or diagonally)
                - FIX #5: Left/right moves guarded so the king can't wrap to the adjacent row
                TODO (coming soon): Cannot move into a square that is attacked (check detection)
                TODO (coming soon): Castling
            */
            if (
                startId + 1 === targetId && targetCol === startCol + 1 ||   // Move Right
                startId - 1 === targetId && targetCol === startCol - 1 ||   // Move Left
                startId + width === targetId ||                              // Move Forward
                startId - width === targetId ||                              // Move Backward
                startId + width - 1 === targetId && targetCol === startCol - 1 || // Diagonal Forward-Left
                startId + width + 1 === targetId && targetCol === startCol + 1 || // Diagonal Forward-Right
                startId - width + 1 === targetId && targetCol === startCol + 1 || // Diagonal Backward-Right
                startId - width - 1 === targetId && targetCol === startCol - 1    // Diagonal Backward-Left
            ) {
                return true;
            }
            break;
    }
    return false; // No valid move matched
}

function changePlayer() {
    // Alternate turn and update board perspective
    if (playerGo === "black") {
        reverseIds(); // Flip board for white
        playerGo = "white";
        playerDisplay.textContent = "white";
    } else {
        revertIds(); // Flip board for black
        playerGo = "black";
        playerDisplay.textContent = "black";
    }
}

function reverseIds() {
    // Flip square IDs so white sees board from their perspective
    const allSquares = document.querySelectorAll(".square");
    allSquares.forEach((square, i) => { // reverse with 63 ((8 x 8 - 1) - i)
        square.setAttribute("square-id", (width * width - 1) - i);
    });
}

function revertIds() {
    // Reset square IDs to original order (black's perspective)
    const allSquares = document.querySelectorAll(".square");
    allSquares.forEach((square, i) => square.setAttribute('square-id', i))
}

function checkForWin() {
    /* -- Check if either king is missing (game over) -- */
    const kings = Array.from(document.querySelectorAll("#king")); // Collect all "king" elements
    
    // Case: White king missing -> Black wins
    if (!kings.some(king => king.classList.contains('white'))) {
        infoDisplay.innerHTML = "Checkmate! Black player wins!";
        disableAllPieces(); // Disable all pieces to prevent further moves
    }
    // Case: Black king is missing -> White wins!
    if (!kings.some(king => king.classList.contains('black'))) {
        infoDisplay.innerHTML = "Checkmate! White player wins!";
        disableAllPieces(); // Disable all pieces to prevent further moves
    }
}

function disableAllPieces() {
    /**
     * Disables all chess pieces from being draggable when the game ends.
     * This prevents players from continuing to move pieces after checkmate.
     * Called automatically when either king is captured (game over).
    */
    const allSquares = document.querySelectorAll('.square');
    allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false));
}
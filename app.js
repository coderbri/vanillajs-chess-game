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
        
        // Assign piece colors
        if ( i <= 15) square.firstChild.firstChild.classList.add('black'); // Black pieces - first 16 squares
        if ( i >= 48) square.firstChild.firstChild.classList.add('white'); // White pieces - last 16 squares
        
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
    // Record starting square and piece
    startPositionId = e.target.parentNode.getAttribute('square-id');
    draggedElement = e.target;
}

function dragOver(e) {
    // Allow dropping on a square
    e.preventDefault();
}

function dragDrop(e) {
    // Attempt to drop piece into a new square
    e.stopPropagation();
    
    // ? Log current state for debugging
    // console.log('playerGo', playerGo);      // playerGo: "black"
    // console.log('e.target', e.target);      // e.target: <div class="square brown" square-id="46"></div>
    
    // -- Move Validation Variables --
    const correctGo = draggedElement.firstChild.classList.contains(playerGo);   // Is the piece mine?
    const taken = e.target.classList.contains('piece');                         // Is square occupied?
    const valid = checkIfValid(e.target);                                       //  Placeholder validity check
    const opponentGo = playerGo === 'white' ? 'black' : 'white';                // Opponent's color
    console.log('opponentGo', opponentGo);  // opponentGo: "white"
    
    const takenByOpponent = e.target.firstChild?.classList.contains(opponentGo); // Square occupied by opponent?
    
    // -- Decision Flow --
    if (correctGo) {
        // Case 1: Capturing opponent
        if (takenByOpponent && valid) {
            e.target.parentNode.append(draggedElement); // Place dragged piece into opponent's square
            e.target.remove();                          // Removes opponent piece
            changePlayer();
            return;
        }
        
        // Case 2: Square occupied by own piece -> Illegal
        if (taken && !takenByOpponent) {
            infoDisplay.textContent = "Illegal move! You cannot go here.";
            setTimeout(() => infoDisplay.textContent = "", 2000);
            return;
        }
        
        // Case 3: Free square -> Move normally
        if (valid) {
            e.target.append(draggedElement);
            changePlayer();
            return;
        }
    }
}

function checkIfValid(target) {
    /* Basic framework for move validation (no rules enforced yet). */
    // console.log(target); // Debug log: <div class="square brown" square-id="19"></div>
    
    // Determine square IDs
    const targetId = Number(target.getAttribute('square-id')) 
                    || Number(target.parentNode.getAttribute('square-id'));
    const startId = Number(startPositionId);
    const piece = draggedElement.id;
    
    // Debug logs
    console.log('targetId', targetId);  // 19
    console.log('startId', startId);    // 11
    console.log('piece', piece);        // pawn
    
    // TODO: Implement piece-specific movement rules
}

function changePlayer() {
    // Alternate turn and update board persepective
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

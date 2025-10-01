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
    
    // Check if target square is occupied
    console.log(e.target);
    const taken = e.target.classList.contains('piece');
    // this is the landing square the piece will be dropped
    // moves to a square with an existing piece (functionality not working yet)
    
    // TODO: Capture logic
    // e.target.parentNode.append(draggedElement);
    // e.target.remove(); // removes existing piece element
    
    // moves to an unoccupied square freely
    // e.target.append(draggedElement);
    // ! bugged: moving piece goes out of frame if it moves to the opponent's piece
    
    // TEMP: if successful drop, switch player turn after any move attempt
    changePlayer();
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

const gameboard = document.querySelector("#gameboard"); // Main gameboard container
const playerDisplay = document.querySelector("#player"); // Displays current player's turn
const infoDisplay = document.querySelector("#info-display"); // Info messages (check, captures, invalid moves)
const width = 8; // Chessboard width (8x8)

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
    /* Generates board dynamically. */
    startPieces.forEach((startPiece, i) => {
        // Create each square
        const square = document.createElement('div');
        square.classList.add('square');
        square.innerHTML = startPiece; // Insert piece (if any)
        
        // 1. Make pieces draggable (if exists).
        square.firstChild?.setAttribute('draggable', true);
        
        // Unique ID for each square (0-63)
        square.setAttribute('square-id', i);
        
        // Calculate row number (1-8) from index i
        const row =  Math.floor( (63 - i) / 8) + 1;
        
        // Alternate square colors by row + column
        if ( row % 2 === 0 ) {
            square.classList.add(i % 2 === 0 ? 'beige' : 'brown');
        } else {
            square.classList.add(i % 2 === 0 ? 'brown' : 'beige');
        }
        
        // Assign piece colors
        if ( i <= 15) { // black pieces - first 16 squares
            square.firstChild.firstChild.classList.add('black'); // Black pieces
        }
        if ( i >= 48) { // white pieces - last 16 squares
            square.firstChild.firstChild.classList.add('white'); // White pieces
        }
        
        gameboard.append(square); // Place square on board
    });
}

createBoard(); // Build the board on page load


// 2. Selects all squares after creation
const allSquares = document.querySelectorAll("#gameboard .square");
// console.log(allSquares); // Correct selector: div.square.[beige/brown]

// 3. Attach drag-and-drop events to each square via event listeners
allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart);
    square.addEventListener('dragover', dragOver);
    square.addEventListener('drop', dragDrop);
});

// 4. Global variables to track dragged pieces
let startPositionId;
let draggedElement;

// 5. Record starting square and piece being dragged
function dragStart(e) {
    startPositionId = e.target.parentNode.getAttribute('square-id');
    draggedElement = e.target;
}

// 6. Allow dropping by preventing default browser behaviour
function dragOver(e) {
    e.preventDefault();
}

// 7. Move piece to target square
function dragDrop(e) {
    // ! BASIC, NO CAPTURE LOGIC YET
    e.stopPropagation();
    
    // this is the landing square the piece will be dropped
    // moves to a square with an existing piece (functionality not working yet)
    // e.target.parentNode.append(draggedElement);
    // e.target.remove(); // removes existing piece element
    
    // moves to an unoccupied square freely
    e.target.append(draggedElement); // ! bugged: moving piece goes out of frame if it moves to the opponent's piece
}
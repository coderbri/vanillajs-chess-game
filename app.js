const gameboard = document.querySelector("#gameboard"); // Main gameboard container
const playerDisplay = document.querySelector("#player"); // Displays current player's turn
const infoDisplay = document.querySelector("#info-display"); // Shows info messages (check, captures, invalid moves)
const width = 8; // Chessboard width (standard 8x8 grid)

// 1. Initial layout of the chessboard (top row -> bottom row)
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

// 2. Function to generate the board dynamically
function createBoard() {
    startPieces.forEach((startPiece, i) => {
        // 3. Create each square
        const square = document.createElement('div');
        square.classList.add('square');
        square.innerHTML = startPiece;          // insert piece (if any)
        square.setAttribute('square-id', i);    // unique identifier
        
        // 4. Calculate row number (1-8) from index i
        const row =  Math.floor( (63 - i) / 8) + 1;
        
        // 5. Alternate colors depending on row and column index
        if ( row % 2 === 0 ) {
            square.classList.add(i % 2 === 0 ? 'beige' : 'brown');
        } else {
            square.classList.add(i % 2 === 0 ? 'brown' : 'beige');
        }
        
        // 6. Add color class to pieces (first 2 rows = black, last 2 rows = white)
        if ( i <= 15) { // black pieces - first 16 squares
            square.firstChild.firstChild.classList.add('black');  // black pieces
        }
        if ( i >= 48) { // white pieces - last 16 squares
            square.firstChild.firstChild.classList.add('white');  // white pieces
        }
        
        // 7. Append square to the board
        gameboard.append(square);
    })
}

// 8. Build the board on page load
createBoard();

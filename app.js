// Selects the main gameboard container from index.html
const gameboard = document.querySelector("#gameboard");

// Selects the span inside <p> that displays the current player's turn
const playerDisplay = document.querySelector("#player");

// Selects the <p> element that shows info messages (check, captures, invalid moves)
const infoDisplay = document.querySelector("#info-display");

// Chessboard width (standard 8x8 grid)
const width = 8;

/*
    At this stage, these constants are setup only – actual rendering
    logic will later use piece constants defined in pieces.js
*/


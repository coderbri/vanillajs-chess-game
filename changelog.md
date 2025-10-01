# Chess Game - Changelog

## v0.1.0 - Initial Setup (Step 1)
- Created project structure with four files: 
  - `index.html` (markup and script linking)
  - `styles.css` (styling for board and pieces, currently empty)
  - `app.js` (game logic, currently empty)
  - `pieces.js` (piece definitions, currently empty)
- Added HTML skeleton for:
  - Gameboard container (`#gameboard`)
  - Player turn display (`#player`)
  - Info display for messages (`#info-display`)
- Linked `styles.css` and JavaScript files (`pieces.js`, `app.js`).

---

## v0.2.0 - Piece Constants and Selectors (Step 2)
- Defined constants in `pieces.js` for all chess pieces (king, queen, rook, bishop, knight, pawn).
  - Each constant stores SVG markup for rendering.
  - Keeps pieces modular and reusable across the board.
- Added DOM selectors in `app.js`:
  - `#gameboard` → chessboard container.
  - `#player` → current player display.
  - `#info-display` → game info messages.
- Defined `width = 8` to represent the chessboard dimensions.
- Established data flow:  
  - `pieces.js` provides piece data.  
  - `app.js` reads these constants (via `<script>` order in `index.html`).  
  - Document selectors give `app.js` control over HTML elements for rendering and game updates.

---

## v0.3.0 - Chessboard Creation (Step 3)
- Implemented `createBoard()` in `app.js`:
  - Dynamically generates 64 `<div>` squares.
  - Inserts chess pieces based on `startPieces` array.
  - Assigns `square-id` attribute for future move tracking.
- Added alternating board colors:
  - `.beige` and `.brown` applied via row and index calculation.
- Implemented piece coloring:
  - Black pieces (indices 0–15) get `.black`.
  - White pieces (indices 48–63) get `.white`.
- Updated `styles.css`:
  - Styled chessboard as an 8×8 flex grid.
  - Defined square sizes and SVG scaling.
  - Applied background colors and piece colors.
  
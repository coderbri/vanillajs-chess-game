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

---

## v0.4.0 - Adding Drag-and-Drop Functionality (Step 4)

- Fixed bug in `pieces.js` where piece `<div>`s were missing `class="piece"` and unique `id`.
- Added drag-and-drop functionality:
  - Pieces set as draggable in `createBoard()`.
  - Squares now listen for `dragstart`, `dragover`, and `drop` events.
  - Pieces can move freely to empty squares.
- Updated CSS:
  - Applied `position: relative` and `z-index` layers to `.piece`, `svg`, and `path`.
  - Ensures proper stacking order of squares and pieces.
- Added styling improvements for smooth piece movement.

---

## v0.5.0 - Turn Switching and Board Flipping (Step 5)
- Added `changePlayer()` to alternate turns after each move.
- Implemented board flipping:
  - `reverseIds()` mirrors square IDs for white’s perspective.
  - `revertIds()` restores IDs for black’s perspective.
- Began groundwork for move validation:
  - Added check for whether a square is already occupied with a piece (`taken`).
- Current state:
  - Pieces can move.
  - Turns alternate properly.
  - Capture/removal logic not yet implemented.

---

## v0.6.0 - Enforcing Correct Turns and Captures (Step 6)
- Implemented **turn enforcement**:
  - Only the current player can move their own pieces (`correctGo` check).
- Added **opponent detection**:
  - Determined opponent’s color dynamically (`opponentGo`).
  - Checked if the target square contains an opponent’s piece (`takenByOpponent`).
- Added capture logic:
  - Replaced opponent’s piece if the square contained the opponent.
  - Blocked illegal moves when trying to move into a square occupied by the same color.
- Introduced **info display feedback**:
  - Illegal moves show an error message for 2 seconds.
- Enhanced **console logging**:
  - Logs current player, opponent, start square, target square, and dragged piece.
  - Critical for debugging and understanding decision flow.

---

## v0.7.0 - Pawn Move Validation (Step 7)
- Introduced **piece-specific move validation** via `switch(piece)`.
- Implemented **pawn rules**:
  - **Single-step forward**: Pawn moves one square ahead.
  - **Double-step forward**: Allowed only on pawn’s first move from its starting row.
  - **Diagonal capture**: Pawn captures opponent piece diagonally one square forward (left or right).
- Enforced **conditional diagonal movement**:
  - Diagonal moves are only legal if a piece occupies the target square.
- Established the mathematical model:
  - Forward movement = `+8`
  - Diagonal captures = `+7` (left) or `+9` (right)
  - Double-step = `+16`
- Laid groundwork for other pieces by using `switch` for modular validation.

---

_v0.8.0 - Coming Soon_

---

<section align="center">
  <code>coderBri © 2025</code>
</section>

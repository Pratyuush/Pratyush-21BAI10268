const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    boardElement.innerHTML = "";

    for (let rowindex = 0; rowindex < 5; rowindex++) {
        for (let squareindex = 0; squareindex < 5; squareindex++) {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square",
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            // Place pieces in the topmost and bottom-most rows
            if (rowindex === 0) { // Topmost row (black pieces)
                if (squareindex < 3) {
                    addPieceToSquare(squareElement, 'pawn', 'b');
                } else if (squareindex === 3) {
                    addPieceToSquare(squareElement, 'queen', 'b');
                } else if (squareindex === 4) {
                    addPieceToSquare(squareElement, 'king', 'b');
                }
            } else if (rowindex === 4) { // Bottom-most row (white pieces)
                if (squareindex < 3) {
                    addPieceToSquare(squareElement, 'pawn', 'w');
                } else if (squareindex === 3) {
                    addPieceToSquare(squareElement, 'queen', 'w');
                } else if (squareindex === 4) {
                    addPieceToSquare(squareElement, 'king', 'w');
                }
            }

            squareElement.addEventListener("dragover", function (e) {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", function (e) {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };

                    handleMove(sourceSquare, targetSquare);
                }
            });

            boardElement.appendChild(squareElement);
        }
    }
};

const addPieceToSquare = (squareElement, type, color) => {
    const pieceElement = document.createElement("div");
    pieceElement.classList.add("piece", color === 'w' ? "white" : "black");
    pieceElement.innerText = getPieceUnicode(type, color);
    pieceElement.draggable = playerRole === color;

    pieceElement.addEventListener("dragstart", (e) => {
        if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: parseInt(squareElement.dataset.row), col: parseInt(squareElement.dataset.col) };
            e.dataTransfer.setData("text", "");
        }
    });

    pieceElement.addEventListener("dragend", (e) => {
        draggedPiece = null;
        sourceSquare = null;
    });

    squareElement.appendChild(pieceElement);
};

const handleMove = (source, target) => {
    // Check for custom moves first
  const customMove = getCustomMove(source, target);
  if (customMove) {
    const result = handleCustomMove(customMove);
    if (result) {
      // Update board state and emit events if successful
      io.emit("move", customMove.notation);
      io.emit("boardState", chess.fen());
      return;
    } else {
      // Emit invalid move event if custom move fails
      socket.emit("invalidMove", customMove.notation);
      return;
    }
  }

  // If no custom move, use original chess.move
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${5 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${5 - target.row}`,
  };
  socket.emit("move", move); // Inform other players about the move
  const result = chess.move(move);
  if (result) {
    currentPlayer = chess.turn();
    io.emit("boardState", chess.fen()); // Update board state for all players
  } else {
    console.log("Invalid move: ", move);
    socket.emit("invalidMove", move); // Inform user about invalid move
  }
};

const getCustomMove = (source, target) => {
  const piece = chess.get(source);
  if (!piece) return null;

  // Extract information from move notation
  const parts = piece.type.toUpperCase() + piece.color + ":" + target.notation;

  const type = parts.slice(0, 2); // P1, H1, H2
  const direction = parts.slice(3); // L, R, F, B, FL, FR, BL, BR

  return {
    piece: piece,
    source: source,
    target: target,
    notation: parts,
    type: type,
    direction: direction,
  };
};

const handleCustomMove = (customMove) => {
  // Validate custom move based on piece type and direction
  if (!validateCustomMove(customMove)) {
    return false;
  }

  // Simulate move on a temporary board to check for captures
  const simulatedBoard = new Chess(chess.fen()); // Create a copy of the board
  const simulatedResult = simulatedBoard.move({
    from: customMove.source,
    to: customMove.target,
  });

  if (!simulatedResult) {
    return false; // Invalid move (e.g., blocked path)
  }

  // Capture logic
  const captureSquares = getCaptureSquares(customMove.piece.type, customMove.direction);
  for (const captureSquare of captureSquares) {
    const capturedPiece = simulatedBoard.get(captureSquare);
    if (capturedPiece && capturedPiece.color !== customMove.piece.color) {
      simulatedBoard.remove(captureSquare); // Capture piece on simulated board
      break; // Only capture one piece per move
    }
  }

  // If valid move, update the actual chess board state
  const result = chess.move({
    from: customMove.source,
    to: customMove.target,
  });

  return result;
};

const getPieceUnicode = (type, color) => {
    const pieces = {
        'pawn': { 'w': '\u2659', 'b': '\u265F' },
        'queen': { 'w': '\u265B', 'b': '\u2655' },  
        'king': { 'w': '\u265A', 'b': '\u2654' },
    };
    return pieces[type][color];
};

renderBoard();

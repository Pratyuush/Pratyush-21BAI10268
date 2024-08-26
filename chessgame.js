const socket = io();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;

const characterMoves = {
    pawn: ['L', 'R', 'F', 'B'],
    hero1: ['L', 'R', 'F', 'B'],
    hero2: ['FL', 'FR', 'BL', 'BR']
};

// Initial setup for the 5x5 board with custom characters
const initialBoardSetup = [
    ['b-pawn', 'b-pawn', 'b-pawn', 'b-hero1', 'b-hero2'],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    ['w-pawn', 'w-pawn', 'w-pawn', 'w-hero1', 'w-hero2']
];

let boardState = [...initialBoardSetup];

// Renders the board and pieces
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

            const piece = boardState[rowindex][squareindex];
            if (piece) {
                addPieceToSquare(squareElement, piece.split('-')[1], piece.split('-')[0]);
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

// Adds a piece to the specified square
const addPieceToSquare = (squareElement, type, color) => {
    const pieceElement = document.createElement("div");
    pieceElement.classList.add("piece", color === 'w' ? "white" : "black");
    pieceElement.innerText = getPieceUnicode(type, color);
    pieceElement.draggable = true;

    pieceElement.addEventListener("dragstart", (e) => {
        draggedPiece = pieceElement;
        sourceSquare = { row: parseInt(squareElement.dataset.row), col: parseInt(squareElement.dataset.col) };
        e.dataTransfer.setData("text", "");
    });

    pieceElement.addEventListener("dragend", (e) => {
        draggedPiece = null;
        sourceSquare = null;
    });

    squareElement.appendChild(pieceElement);
};

// Handles move validation and updating the board state
const handleMove = (source, target) => {
    const piece = boardState[source.row][source.col];
    if (!piece) return;

    const [color, type] = piece.split('-');
    const moveDirection = getMoveDirection(source, target);

    if (isValidMove(type, moveDirection)) {
        if (!isOutOfBounds(target.row, target.col) && isPathClear(source, target, type)) {
            boardState[source.row][source.col] = null;

            // Handle combat
            const targetPiece = boardState[target.row][target.col];
            if (targetPiece) {
                const [targetColor, targetType] = targetPiece.split('-');
                if (targetColor !== color) {
                    boardState[target.row][target.col] = null;  // Remove the opponent's piece
                } else {
                    console.log("Invalid move: Friendly fire");
                    return;
                }
            }

            // Move the piece to the target position
            boardState[target.row][target.col] = piece;
            renderBoard();
            socket.emit("move", { source, target, piece });
        } else {
            console.log("Invalid move: Path is blocked or out of bounds");
        }
    } else {
        console.log("Invalid move: Not allowed for this piece");
    }
};

// Determine if the move is valid based on the piece type and direction
const isValidMove = (type, direction) => {
    return characterMoves[type].includes(direction);
};

// Determine the move direction based on source and target coordinates
const getMoveDirection = (source, target) => {
    const rowDiff = target.row - source.row;
    const colDiff = target.col - source.col;

    if (rowDiff === 0 && colDiff === -1) return 'L';
    if (rowDiff === 0 && colDiff === 1) return 'R';
    if (rowDiff === -1 && colDiff === 0) return 'F';
    if (rowDiff === 1 && colDiff === 0) return 'B';
    if (Math.abs(rowDiff) === 2 && colDiff === 0) return 'F';  // Hero1 double move forward
    if (rowDiff === 0 && Math.abs(colDiff) === 2) return 'L';  // Hero1 double move left or right
    if (rowDiff === -2 && colDiff === -2) return 'FL';
    if (rowDiff === -2 && colDiff === 2) return 'FR';
    if (rowDiff === 2 && colDiff === -2) return 'BL';
    if (rowDiff === 2 && colDiff === 2) return 'BR';
    return null;
};

// Check if the target square is out of bounds
const isOutOfBounds = (row, col) => {
    return row < 0 || row > 4 || col < 0 || col > 4;
};

// Check if the path is clear for the move
const isPathClear = (source, target, type) => {
    if (type === 'pawn') {
        return !boardState[target.row][target.col];
    }

    if (type === 'hero1' || type === 'hero2') {
        const rowDiff = target.row - source.row;
        const colDiff = target.col - source.col;

        const rowStep = rowDiff ? rowDiff / Math.abs(rowDiff) : 0;
        const colStep = colDiff ? colDiff / Math.abs(colDiff) : 0;

        let currentRow = source.row + rowStep;
        let currentCol = source.col + colStep;

        while (currentRow !== target.row || currentCol !== target.col) {
            if (boardState[currentRow][currentCol]) {
                return false;  // Path is blocked
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
    }

    return true;
};

// Get the Unicode character for the piece
const getPieceUnicode = (type, color) => {
    const pieces = {
        'pawn': { 'w': '\u2659', 'b': '\u265F' },
        'hero1': { 'w': '\u2654', 'b': '\u265A' },
        'hero2': { 'w': '\u2655', 'b': '\u265B' },
    };
    return pieces[type][color];
};

renderBoard();
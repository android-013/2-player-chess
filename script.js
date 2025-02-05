document.addEventListener("DOMContentLoaded", () => {
    const board = document.querySelector(".board");
    let selectedPiece = null;
    let selectedSquare = null;

    const initialSetup = {
        a8: "♜", b8: "♞", c8: "♝", d8: "♛", e8: "♚", f8: "♝", g8: "♞", h8: "♜",
        a7: "♟", b7: "♟", c7: "♟", d7: "♟", e7: "♟", f7: "♟", g7: "♟", h7: "♟",
        a2: "♙", b2: "♙", c2: "♙", d2: "♙", e2: "♙", f2: "♙", g2: "♙", h2: "♙",
        a1: "♖", b1: "♘", c1: "♗", d1: "♕", e1: "♔", f1: "♗", g1: "♘", h1: "♖"
    };

    const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

    // Generate Chessboard
    ranks.forEach(rank => {
        files.forEach(file => {
            const square = document.createElement("div");
            square.classList.add("square");
            square.classList.add((rank + files.indexOf(file)) % 2 === 0 ? "light" : "dark");
            square.id = file + rank;

            if (initialSetup[square.id]) {
                square.innerText = initialSetup[square.id];
            }

            square.addEventListener("click", () => handleMove(square));

            board.appendChild(square);
        });
    });

    function handleMove(square) {
        if (!selectedPiece) {
            if (square.innerText !== "") {
                selectedPiece = square.innerText;
                selectedSquare = square;
                square.style.backgroundColor = "#ffcc00"; // Highlight selected piece
            }
        } else {
            // Prevent capturing own pieces
            if (isSameColor(selectedPiece, square.innerText)) {
                selectedSquare.style.backgroundColor = ""; // Reset previous square
                selectedPiece = null;
                selectedSquare = null;
                return;
            }

            square.innerText = selectedPiece;
            selectedSquare.innerText = "";
            selectedSquare.style.backgroundColor = ""; // Reset previous square
            selectedPiece = null;
            selectedSquare = null;
        }
    }

    function isSameColor(piece1, piece2) {
        if (piece1 === "" || piece2 === "") return false;
        const whitePieces = "♙♘♗♖♕♔";
        const blackPieces = "♟♞♝♜♛♚";
        return (whitePieces.includes(piece1) && whitePieces.includes(piece2)) ||
               (blackPieces.includes(piece1) && blackPieces.includes(piece2));
    }
});

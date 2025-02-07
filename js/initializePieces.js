document.addEventListener("DOMContentLoaded", function () {
    const piecePositions = {
        "white": {
            "Rook": ["A1", "H1"],
            "Knight": ["B1", "G1"],
            "Bishop": ["C1", "F1"],
            "Queen": ["D1"],
            "King": ["E1"],
            "Pawn": ["A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2"]
        },
        "black": {
            "Rook": ["A8", "H8"],
            "Knight": ["B8", "G8"],
            "Bishop": ["C8", "F8"],
            "Queen": ["D8"],
            "King": ["E8"],
            "Pawn": ["A7", "B7", "C7", "D7", "E7", "F7", "G7", "H7"]
        }
    };

    function createPieceElement(type, color) {
        const piece = document.createElement("div");
        piece.classList.add("piece", `${color}-${type.toLowerCase()}`);
        piece.innerText = getPieceSymbol(type, color);
        return piece;
    }

    function getPieceSymbol(type, color) {
        const symbols = {
            "Pawn": "♙",
            "Rook": "♖",
            "Knight": "♘",
            "Bishop": "♗",
            "Queen": "♕",
            "King": "♔"
        };
        return color === "black" ? symbols[type].replace("♙", "♟").replace("♖", "♜").replace("♘", "♞").replace("♗", "♝").replace("♕", "♛").replace("♔", "♚") : symbols[type];
    }

    function placePieces() {
        Object.keys(piecePositions).forEach(color => {
            Object.keys(piecePositions[color]).forEach(type => {
                piecePositions[color][type].forEach(position => {
                    const column = position.charCodeAt(0) - 65; // Convert 'A' to 0, 'B' to 1, etc.
                    const row = 8 - parseInt(position[1]); // Convert '1' to 7, '8' to 0, etc.

                    const index = row * 8 + column;
                    const squares = document.querySelectorAll(".square");

                    if (squares[index]) {
                        const pieceElement = createPieceElement(type, color);
                        squares[index].appendChild(pieceElement);
                    }
                });
            });
        });
    }

    placePieces();
});

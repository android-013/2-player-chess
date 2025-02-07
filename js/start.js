document.addEventListener("DOMContentLoaded", () => {
    const chessboard = document.getElementById("chessboard");
    const initialSetup = {
        a8: "♜", b8: "♞", c8: "♝", d8: "♛", e8: "♚", f8: "♝", g8: "♞", h8: "♜",
        a7: "♟", b7: "♟", c7: "♟", d7: "♟", e7: "♟", f7: "♟", g7: "♟", h7: "♟",
        a2: "♙", b2: "♙", c2: "♙", d2: "♙", e2: "♙", f2: "♙", g2: "♙", h2: "♙",
        a1: "♖", b1: "♘", c1: "♗", d1: "♕", e1: "♔", f1: "♗", g1: "♘", h1: "♖"
    };

    function placePieces() {
        const squares = chessboard.children;
        const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const index = row * 8 + col;
                const position = files[col] + (8 - row);
                squares[index].textContent = initialSetup[position] || "";
            }
        }
    }
    
    placePieces();
});

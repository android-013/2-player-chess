const initialBoardSetup = {
    "a1": "♖", "b1": "♘", "c1": "♗", "d1": "♕", "e1": "♔", "f1": "♗", "g1": "♘", "h1": "♖",
    "a2": "♙", "b2": "♙", "c2": "♙", "d2": "♙", "e2": "♙", "f2": "♙", "g2": "♙", "h2": "♙",
    "a8": "♜", "b8": "♞", "c8": "♝", "d8": "♛", "e8": "♚", "f8": "♝", "g8": "♞", "h8": "♜",
    "a7": "♟", "b7": "♟", "c7": "♟", "d7": "♟", "e7": "♟", "f7": "♟", "g7": "♟", "h7": "♟"
};

function createChessBoard() {
    const board = document.getElementById("chess-board");
    const files = "abcdefgh";

    for (let r = 8; r >= 1; r--) {
        for (let c = 0; c < 8; c++) {
            let square = document.createElement("div");
            square.classList.add("square");
            square.id = files[c] + r;

            if ((r + c) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            if (initialBoardSetup[square.id]) {
                square.innerText = initialBoardSetup[square.id];
            }

            square.addEventListener("click", () => handleMove(square));
            board.appendChild(square);
        }
    }
}

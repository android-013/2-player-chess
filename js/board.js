//board creation

// function createChessBoard() {
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
            square.addEventListener("click", () => handleMove(square));
            board.appendChild(square);
        }
    }
}

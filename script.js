document.addEventListener("DOMContentLoaded", () => {
    const board = document.querySelector(".board");
    const initialSetup = {
        a8: "♜", b8: "♞", c8: "♝", d8: "♛", e8: "♚", f8: "♝", g8: "♞", h8: "♜",
        a7: "♟", b7: "♟", c7: "♟", d7: "♟", e7: "♟", f7: "♟", g7: "♟", h7: "♟",
        a2: "♙", b2: "♙", c2: "♙", d2: "♙", e2: "♙", f2: "♙", g2: "♙", h2: "♙",
        a1: "♖", b1: "♘", c1: "♗", d1: "♕", e1: "♔", f1: "♗", g1: "♘", h1: "♖"
    };

    const ranks = [8, 7, 6, 5, 4, 3, 2, 1]; // Rows
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"]; // Columns

    ranks.forEach(rank => {
        files.forEach(file => {
            const square = document.createElement("div");
            square.classList.add("square");
            square.classList.add((rank + files.indexOf(file)) % 2 === 0 ? "light" : "dark");
            square.id = file + rank; // Example: a8, b8, etc.

            if (initialSetup[square.id]) {
                square.innerText = initialSetup[square.id];
            }

            board.appendChild(square);
        });
    });
});

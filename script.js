const boardSize = 10; // 10x10 grid
const numBombs = 20; // Number of bombs
let board = [];
let gameOver = false;
let timerInterval;
let seconds = 0;
let timerStarted = false; // Flag to check if timer has started

// Initialize the board
function initializeBoard() {
    console.log("Initializing board...");
    board = [];
    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            board[i][j] = { isBomb: false, isRevealed: false, neighborBombs: 0 };
        }
    }
    placeBombs(); // Place bombs on the board
    calculateNeighbors(); // Calculate neighboring bombs
    renderBoard(); // Render the board after initialization
}

// Place bombs randomly on the board
function placeBombs() {
    let bombsPlaced = 0;
    while (bombsPlaced < numBombs) {
        let row = Math.floor(Math.random() * boardSize);
        let col = Math.floor(Math.random() * boardSize);
        if (!board[row][col].isBomb) {
            board[row][col].isBomb = true;
            bombsPlaced++;
        }
    }
}

// Calculate number of bombs surrounding each cell
function calculateNeighbors() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j].isBomb) continue; // Skip bombs
            let bombsCount = 0;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    let newRow = i + x;
                    let newCol = j + y;
                    if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                        if (board[newRow][newCol].isBomb) bombsCount++;
                    }
                }
            }
            board[i][j].neighborBombs = bombsCount;
        }
    }
}

// Render the board in the HTML
function renderBoard() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = ""; // Clear any existing content
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`; // Set grid layout
    boardElement.style.gridTemplateRows = `repeat(${boardSize}, 30px)`; // Set grid layout

    // Loop through the board and create cells
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = i;
            cell.dataset.col = j;

            // If the cell is revealed, change color
            if (board[i][j].isRevealed) {
                if (board[i][j].isBomb) {
                    cell.classList.add("bomb");
                    cell.innerText = "💣"; // Display bomb
                } else {
                    cell.innerText = board[i][j].neighborBombs > 0 ? board[i][j].neighborBombs : "";
                }
                cell.classList.add("revealed");
            }

            // Add click event listener to each cell
            cell.addEventListener("click", revealCell);

            boardElement.appendChild(cell);
        }
    }
}

// Reveal the clicked cell
function revealCell(event) {
    if (gameOver) return;

    const row = event.target.dataset.row;
    const col = event.target.dataset.col;

    // If the cell is already revealed, do nothing
    if (board[row][col].isRevealed) return;

    // Mark the cell as revealed
    board[row][col].isRevealed = true;

    // Start the timer on the first click
    if (!timerStarted) {
        startTimer(); // Start the timer
        timerStarted = true; // Ensure the timer only starts once
    }

    // If the cell is a bomb, end the game
    if (board[row][col].isBomb) {
        gameOver = true;
        stopTimer(); // Stop the timer when the game ends
        alert("Game Over! You hit a bomb!");
        renderBoard(); // Render the board after game over
        return;
    }

    // If there are no neighboring bombs, reveal neighboring cells recursively
    if (board[row][col].neighborBombs === 0) {
        revealNeighbors(row, col); // Reveal adjacent cells if no bombs around
    }

    renderBoard(); // Re-render the board after revealing the cell
}

// Recursively reveal neighboring cells
function revealNeighbors(row, col) {
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            let newRow = row + x;
            let newCol = col + y;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                if (!board[newRow][newCol].isRevealed) {
                    board[newRow][newCol].isRevealed = true;
                    if (board[newRow][newCol].neighborBombs === 0) {
                        revealNeighbors(newRow, newCol); // Recursively reveal neighbors if no bombs are adjacent
                    }
                }
            }
        }
    }
}

// Timer logic
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        document.getElementById("timer").innerText = seconds;
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Reset the game
document.getElementById("reset").addEventListener("click", () => {
    gameOver = false;
    timerStarted = false; // Reset the timer flag for the new game
    seconds = 0;  // Reset the timer to 0
    document.getElementById("timer").innerText = seconds;  // Update the timer display
    initializeBoard(); // Reinitialize the board
});

// Initialize the game
initializeBoard();

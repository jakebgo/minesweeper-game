const boardSize = 10; // 10x10 grid
const numBombs = 20;
let board = [];
let gameOver = false;
let timerInterval;
let seconds = 0;
let timerStarted = false; // Flag to check if timer has started

// Start the timer
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

// Initialize the board
function initializeBoard() {
    console.log("Initializing board...");
    seconds = 0;  // Reset the timer to 0 when a new game starts
    document.getElementById("timer").innerText = seconds;  // Show 0 on the timer initially
    gameOver = false;
    board = [];
    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            board[i][j] = { isBomb: false, isRevealed: false, neighborBombs: 0 };
        }
    }
    placeBombs();
    calculateNeighbors();
    renderBoard();
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
            if (board[i][j].isBomb) continue;
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
    console.log("Rendering board...");
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = ""; // Clear any existing content
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`; // Ensure grid size is dynamic based on boardSize
    boardElement.style.gridTemplateRows = `repeat(${boardSize}, 30px)`; // Ensure grid size is dynamic based on boardSize

    // Loop through the board to create and render each cell
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = i;
            cell.dataset.col = j;
            if (board[i][j].isRevealed) {
                if (board[i][j].isBomb) {
                    cell.classList.add("bomb");
                } else {
                    cell.innerText = board[i][j].neighborBombs > 0 ? board[i][j].neighborBombs : "";
                }
            }
            cell.addEventListener("click", revealCell);
            boardElement.appendChild(cell);
        }
    }
}

// Reveal the clicked cell
function revealCell(event) {
    if (gameOver) return;

    // Start the timer on the first click
    if (!timerStarted) {
        startTimer();
        timerStarted = true;
    }

    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    if (board[row][col].isRevealed) return;
    board[row][col].isRevealed = true;
    if (board[row][col].isBomb) {
        gameOver = true;
        stopTimer();  // Stop the timer when the game ends
        alert("Game Over! You hit a bomb!");
        promptForLeaderboard();  // Prompt for leaderboard when you lose
    } else {
        renderBoard();
    }
}

// Prompt for name and save score to leaderboard
function promptForLeaderboard() {
    const playerName = prompt("Game Over! Enter your name to save your score:");
    if (playerName) {
        saveScore(playerName, seconds);  // Save score with player name and time
    }
}

// Save the score to the leaderboard
function saveScore(playerName, score) {
    const leaderboard = document.getElementById("scoreList");
    const newScore = document.createElement("li");
    newScore.textContent = `${playerName}: ${score} seconds`;
    leaderboard.appendChild(newScore);
}

// Reset the game
document.getElementById("reset").addEventListener("click", () => {
    gameOver = false;
    timerStarted = false; // Reset the timer flag for the new game
    initializeBoard();
});

// Initialize the game
initializeBoard();

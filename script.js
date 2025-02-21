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
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = ""; // Clear any existing content
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`; // Ensure grid size is dynamic based on boardSize
    boardElement.style.gridTemplateRows = `repeat(${boardSize}, 30px)`; // Ensure grid size is dynamic based on boardSize

    // Loop through the board and create cells
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = i;
            cell.dataset.col = j;

            // If the cell is revealed, show bomb or neighbor count
            if (board[i][j].isRevealed) {
                if (board[i][j].isBomb) {
                    cell.classList.add("bomb");
                    cell.innerText = "💣"; // Display bomb
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

    if (board[row][col].isRevealed) return; // Prevent revealing already revealed cells

    board[row][col].isRevealed = true;

    // If a bomb is clicked, end the game
    if (board[row][col].isBomb) {
        gameOver = true;
        stopTimer();
        alert("Game Over! You hit a bomb!");
        renderBoard();
        return;
    }

    renderBoard();

    // Check if the player has completed the game
    if (checkGameCompletion()) {
        gameOver = true;
        stopTimer();  // Stop the timer when the game ends successfully
        document.getElementById("completionMessage").innerText = "Congratulations! You completed the game!";
        alert("You completed the game!");
        promptForLeaderboard();  // Save the score to the leaderboard
    }
}

// Function to check if the game is completed (all non-bomb cells revealed)
function checkGameCompletion() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (!board[i][j].isBomb && !board[i][j].isRevealed) {
                return false; // The game is not complete if there's any unrevealed non-bomb cell
            }
        }
    }
    return true; // All non-bomb cells are revealed, game is complete
}

// Prompt for name and save score to leaderboard
function promptForLeaderboard() {
    const playerName = prompt("Congratulations! Enter your name to save your score:");
    if (playerName) {
        saveScore(playerName, seconds);  // Save score with player name and time
    }
}

// Save the score to Firebase
function saveScore(playerName, score) {
    const leaderboardRef = database.ref('leaderboard'); // Reference to leaderboard in Firebase
    
    leaderboardRef.push({
        name: playerName,
        score: score,
        timestamp: Date.now() // To sort scores later
    });
}

// Load the leaderboard from Firebase
function loadLeaderboard() {
    const leaderboardRef = database.ref('leaderboard'); // Reference to leaderboard in Firebase

    leaderboardRef.orderByChild('score').limitToLast(10).once('value', function(snapshot) {
        const leaderboardList = document.getElementById('scoreList');
        leaderboardList.innerHTML = ''; // Clear existing leaderboard

        snapshot.forEach(function(childSnapshot) {
            const scoreData = childSnapshot.val();
            const listItem = document.createElement('li');
            listItem.textContent = `${scoreData.name}: ${scoreData.score} seconds`;
            leaderboardList.appendChild(listItem);
        });
    });
}

window.onload = function() {
    loadLeaderboard();  // Load leaderboard when the page loads
}

// Reset the game
document.getElementById("reset").addEventListener("click", () => {
    gameOver = false;
    timerStarted = false; // Reset the timer flag for the new game
    initializeBoard();
});

// Initialize the game
initializeBoard();

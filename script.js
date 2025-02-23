import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push, get, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvgcoRklnbChOGEKW2I7bSO6so396gn80",
  authDomain: "minesweeper-game-f50f6.firebaseapp.com",
  databaseURL: "https://minesweeper-game-f50f6-default-rtdb.firebaseio.com",
  projectId: "minesweeper-game-f50f6",
  storageBucket: "minesweeper-game-f50f6.firebasestorage.app",
  messagingSenderId: "933417215645",
  appId: "1:933417215645:web:f2ff3bdfea15ad850a9674"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to load leaderboard immediately
function loadLeaderboard() {
    const leaderboardRef = ref(database, 'leaderboard');
    const leaderboardQuery = query(leaderboardRef, orderByChild('score'), limitToLast(10));

    get(leaderboardQuery).then((snapshot) => {
        const leaderboardList = document.getElementById('scoreList');
        leaderboardList.innerHTML = ''; // Clear any existing leaderboard

        snapshot.forEach((childSnapshot) => {
            const scoreData = childSnapshot.val();
            const listItem = document.createElement('li');
            listItem.textContent = `${scoreData.name}: ${scoreData.score} seconds`;
            leaderboardList.appendChild(listItem);
        });
    }).catch((error) => {
        console.error("Error loading leaderboard: ", error);
    });
}

// Load the leaderboard when the page is ready
window.onload = function() {
    loadLeaderboard();
};

// Function to prompt the user for their name and save the score to Firebase
function promptForLeaderboard() {
    const playerName = prompt("Enter your name to save your score:");

    if (playerName) {
        saveScore(playerName, seconds); // Save the score and name
    } else {
        alert("Name is required to save the score!");
    }
}

// Check if all non-bomb cells are revealed
function checkGameCompletion() {
    let allNonBombCellsRevealed = true;

    // Loop through the board to check if any non-bomb cell is unrevealed
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (!board[i][j].isBomb && !board[i][j].isRevealed) {
                allNonBombCellsRevealed = false;
                break;
            }
        }
    }

    // If all non-bomb cells are revealed, end the game
    if (allNonBombCellsRevealed) {
        gameOver = true; // Mark the game as over
        stopTimer(); // Stop the timer
        alert("Congratulations! You have cleared all non-bomb cells!");

        // Prompt for leaderboard entry
        promptForLeaderboard();  // Now this function will be called correctly
        renderBoard(); // Render the final board after completion
    }
}

// Existing functions like saveScore, renderBoard, etc.


const boardSize = 9; // 9x9 grid
const numBombs = 10; // Number of bombs
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
            board[i][j] = { isBomb: false, isRevealed: false, neighborBombs: 0, isFlagged: false };
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
    console.log("Rendering board...");

    const boardElement = document.getElementById("board");
    if (!boardElement) {
        console.error("Board element not found!");
        return;
    }

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

            // Mark flagged cells with a different class
            if (board[i][j].isFlagged) {
                cell.classList.add("flagged");
                cell.innerText = "🚩"; // Flag icon
            }

            // Add event listeners for click and right-click
            cell.addEventListener("click", revealCell);
            cell.addEventListener("contextmenu", placePlanningMarker); // Right-click to place planning marker

            boardElement.appendChild(cell);
        }
    }
}

// Reveal the clicked cell
function revealCell(event) {
    if (gameOver) return;

    const row = event.target.dataset.row;
    const col = event.target.dataset.col;

    // If the cell is flagged, prevent revealing it
    if (board[row][col].isFlagged) return;

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

    renderBoard(); // Re-render the board after revealing the cell

    // Check for game completion
    checkGameCompletion(); // Ensure it checks after each cell reveal
}

// Right-click to place planning marker (flag)
function placePlanningMarker(event) {
    event.preventDefault(); // Prevent the default right-click menu

    const row = event.target.dataset.row;
    const col = event.target.dataset.col;

    // If the cell is already revealed or flagged, do nothing
    if (board[row][col].isRevealed) return;

    // Toggle the flag status
    board[row][col].isFlagged = !board[row][col].isFlagged;

    renderBoard(); // Re-render the board after placing/removing the flag
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

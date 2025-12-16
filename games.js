/* ========================================
   MINI ARCADE - GAME ENGINE
   ======================================== */

// ========== GAME MANAGER ==========
class GameManager {
    constructor() {
        this.currentGame = null;
        this.score = 0;
        this.games = {};
        this.init();
    }

    init() {
        // Register all games
        this.games = {
            tictactoe: TicTacToe,
            connect4: ConnectFour,
            snake: Snake,
            memory: MemoryMatch,
            whackamole: WhackAMole,
            simon: SimonSays,
            breakout: Breakout,
            lightsout: LightsOut,
            sudoku: Sudoku,
            hangman: Hangman,
            numguess: NumberGuessing,
            tetris: Tetris,
            pong: Pong,
            flappy: FlappyBird,
            colormatch: ColorMatch,
            reaction: ReactionTimer,
            wordscramble: WordScramble,
            pacman: PacMan,
            spaceinvaders: SpaceInvaders,
            crossword: Crossword
        };

        this.bindEvents();
    }

    bindEvents() {
        // Game card clicks
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                if (card.classList.contains('coming-soon')) {
                    this.showComingSoon(card.querySelector('h3').textContent);
                } else {
                    this.loadGame(card.dataset.game);
                }
            });
        });

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => this.showLauncher());

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (this.currentGame) this.currentGame.reset();
        });

        // Instructions button
        document.getElementById('instructionsBtn').addEventListener('click', () => {
            if (this.currentGame) this.showInstructions();
        });

        // Modal buttons
        document.getElementById('modalClose').addEventListener('click', () => this.hideModal());
        document.getElementById('modalPlayAgain').addEventListener('click', () => {
            this.hideModal();
            if (this.currentGame) this.currentGame.reset();
        });
        document.getElementById('modalMenu').addEventListener('click', () => {
            this.hideModal();
            this.showLauncher();
        });
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.hideModal();
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('arcade-theme') || 'dark';
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.textContent = '☀️';
        }
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'light') {
                document.documentElement.removeAttribute('data-theme');
                themeToggle.textContent = '🌙';
                localStorage.setItem('arcade-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                themeToggle.textContent = '☀️';
                localStorage.setItem('arcade-theme', 'light');
            }
        });
    }

    loadGame(gameId) {
        const GameClass = this.games[gameId];
        if (!GameClass) return;

        document.getElementById('launcher').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        document.getElementById('backBtn').style.display = 'flex';

        this.currentGame = new GameClass();
        document.getElementById('gameTitle').textContent = this.currentGame.name;
    }

    showLauncher() {
        if (this.currentGame) {
            this.currentGame.destroy();
            this.currentGame = null;
        }
        document.getElementById('launcher').style.display = 'block';
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('backBtn').style.display = 'none';
        document.getElementById('gameBoard').innerHTML = '';
        document.getElementById('gameInfo').innerHTML = '';
        document.getElementById('gameStatus').textContent = '';
    }

    showInstructions() {
        if (!this.currentGame) return;
        document.getElementById('modalTitle').textContent = 'How to Play';
        document.getElementById('modalBody').innerHTML = this.currentGame.instructions;
        this.showModal();
    }

    showModal() {
        document.getElementById('modalOverlay').classList.add('active');
    }

    hideModal() {
        document.getElementById('modalOverlay').classList.remove('active');
    }

    showComingSoon(gameName) {
        document.getElementById('modalTitle').textContent = '🚧 Coming Soon!';
        document.getElementById('modalBody').innerHTML = `
            <div style="text-align:center;">
                <p style="font-size:1.2rem;margin-bottom:16px;"><strong>${gameName}</strong> is currently in development.</p>
                <p style="color:var(--text-secondary);">Stay tuned for updates! This game will be added in a future release.</p>
            </div>
        `;
        document.getElementById('modalPlayAgain').style.display = 'none';
        document.getElementById('modalMenu').textContent = 'OK';
        this.showModal();
    }

    showGameOver(title, message, isWin = false) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = `<p>${message}</p>`;
        document.getElementById('modalPlayAgain').style.display = 'inline-flex';
        document.getElementById('modalMenu').textContent = 'Back to Menu';
        this.showModal();
    }

    updateScore(points) {
        this.score += points;
        document.getElementById('currentScore').textContent = `Score: ${this.score}`;
    }

    toast(message, type = '') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast show ' + type;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// ========== BASE GAME CLASS ==========
class BaseGame {
    constructor(name) {
        this.name = name;
        this.board = document.getElementById('gameBoard');
        this.info = document.getElementById('gameInfo');
        this.status = document.getElementById('gameStatus');
        this.isGameOver = false;
    }

    init() {}
    reset() { this.isGameOver = false; this.init(); }
    destroy() {}
    render() {}
    
    get instructions() { return ''; }

    setStatus(text, className = '') {
        this.status.textContent = text;
        this.status.className = 'game-status ' + className;
    }

    setInfo(html) {
        this.info.innerHTML = html;
    }
}

// ========== TIC TAC TOE ==========
class TicTacToe extends BaseGame {
    constructor() {
        super('Tic Tac Toe');
        this.init();
    }

    init() {
        this.cells = Array(9).fill('');
        this.currentPlayer = 'X';
        this.isGameOver = false;
        this.render();
        this.updateInfo();
    }

    get instructions() {
        return `<h4>Tic Tac Toe</h4>
        <p>Take turns placing X or O on the grid. First to get 3 in a row wins!</p>
        <p><strong>Controls:</strong> Click any empty cell to place your mark.</p>`;
    }

    render() {
        this.board.innerHTML = '<div class="ttt-grid"></div>';
        const grid = this.board.querySelector('.ttt-grid');
        
        this.cells.forEach((cell, i) => {
            const div = document.createElement('div');
            div.className = 'ttt-cell' + (cell ? ' taken ' + cell.toLowerCase() : '');
            div.textContent = cell;
            div.addEventListener('click', () => this.makeMove(i));
            grid.appendChild(div);
        });
    }

    makeMove(index) {
        if (this.cells[index] || this.isGameOver) return;

        this.cells[index] = this.currentPlayer;
        this.render();

        const winner = this.checkWinner();
        if (winner) {
            this.isGameOver = true;
            this.setStatus(`${winner} Wins! 🎉`, 'winner');
            this.highlightWinningCells();
            gameManager.showGameOver('Game Over!', `Player ${winner} wins!`, true);
        } else if (this.cells.every(c => c)) {
            this.isGameOver = true;
            this.setStatus("It's a Draw! 🤝");
            gameManager.showGameOver('Game Over!', "It's a draw!");
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateInfo();
        }
    }

    updateInfo() {
        this.setInfo(`<span class="active">Current: Player ${this.currentPlayer}</span>`);
        this.setStatus(`Player ${this.currentPlayer}'s turn`);
    }

    checkWinner() {
        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (const [a,b,c] of wins) {
            if (this.cells[a] && this.cells[a] === this.cells[b] && this.cells[a] === this.cells[c]) {
                this.winningCells = [a,b,c];
                return this.cells[a];
            }
        }
        return null;
    }

    highlightWinningCells() {
        const cells = this.board.querySelectorAll('.ttt-cell');
        this.winningCells.forEach(i => cells[i].classList.add('winning'));
    }
}

// ========== CONNECT FOUR ==========
class ConnectFour extends BaseGame {
    constructor() {
        super('Connect Four');
        this.rows = 6;
        this.cols = 7;
        this.init();
    }

    init() {
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(''));
        this.currentPlayer = 'red';
        this.isGameOver = false;
        this.render();
        this.updateInfo();
    }

    get instructions() {
        return `<h4>Connect Four</h4>
        <p>Drop colored discs into the grid. First to connect 4 in a row wins!</p>
        <p><strong>Controls:</strong> Click a column to drop your disc.</p>`;
    }

    render() {
        this.board.innerHTML = '<div class="c4-grid"></div>';
        const grid = this.board.querySelector('.c4-grid');

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'c4-cell ' + this.grid[r][c];
                cell.addEventListener('click', () => this.dropPiece(c));
                grid.appendChild(cell);
            }
        }
    }

    dropPiece(col) {
        if (this.isGameOver) return;

        for (let r = this.rows - 1; r >= 0; r--) {
            if (!this.grid[r][col]) {
                this.grid[r][col] = this.currentPlayer;
                this.render();
                
                const cells = this.board.querySelectorAll('.c4-cell');
                cells[r * this.cols + col].classList.add('dropping');

                if (this.checkWinner(r, col)) {
                    this.isGameOver = true;
                    const winner = this.currentPlayer === 'red' ? '🔴 Red' : '🟡 Yellow';
                    this.setStatus(`${winner} Wins!`, 'winner');
                    gameManager.showGameOver('Game Over!', `${winner} wins!`, true);
                } else if (this.grid[0].every(c => c)) {
                    this.isGameOver = true;
                    this.setStatus("It's a Draw!");
                    gameManager.showGameOver('Game Over!', "It's a draw!");
                } else {
                    this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
                    this.updateInfo();
                }
                return;
            }
        }
    }

    updateInfo() {
        const player = this.currentPlayer === 'red' ? '🔴 Red' : '🟡 Yellow';
        this.setInfo(`<span class="active">Current: ${player}</span>`);
        this.setStatus(`${player}'s turn`);
    }

    checkWinner(row, col) {
        const directions = [[0,1],[1,0],[1,1],[1,-1]];
        const player = this.grid[row][col];

        for (const [dr, dc] of directions) {
            let count = 1;
            for (let i = 1; i < 4; i++) {
                const r = row + dr * i, c = col + dc * i;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.grid[r][c] === player) count++;
                else break;
            }
            for (let i = 1; i < 4; i++) {
                const r = row - dr * i, c = col - dc * i;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.grid[r][c] === player) count++;
                else break;
            }
            if (count >= 4) return true;
        }
        return false;
    }
}

// ========== SNAKE ==========
class Snake extends BaseGame {
    constructor() {
        super('Snake');
        this.gridSize = 20;
        this.init();
    }

    init() {
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.food = this.spawnFood();
        this.score = 0;
        this.speed = 150;
        this.isGameOver = false;
        this.isPaused = false;

        this.render();
        this.updateInfo();
        this.bindKeys();
        this.startLoop();
    }

    get instructions() {
        return `<h4>Snake</h4>
        <p>Control the snake to eat food and grow longer. Don't hit walls or yourself!</p>
        <p><strong>Controls:</strong> Arrow keys or WASD to move.</p>`;
    }

    bindKeys() {
        this.keyHandler = (e) => {
            const key = e.key.toLowerCase();
            if ((key === 'arrowup' || key === 'w') && this.direction.y !== 1) 
                this.nextDirection = {x: 0, y: -1};
            if ((key === 'arrowdown' || key === 's') && this.direction.y !== -1) 
                this.nextDirection = {x: 0, y: 1};
            if ((key === 'arrowleft' || key === 'a') && this.direction.x !== 1) 
                this.nextDirection = {x: -1, y: 0};
            if ((key === 'arrowright' || key === 'd') && this.direction.x !== -1) 
                this.nextDirection = {x: 1, y: 0};
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    destroy() {
        document.removeEventListener('keydown', this.keyHandler);
        clearInterval(this.gameLoop);
    }

    startLoop() {
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    update() {
        if (this.isGameOver || this.isPaused) return;

        this.direction = {...this.nextDirection};
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Wall collision
        if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
            this.gameOver();
            return;
        }

        // Self collision
        if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Eat food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.spawnFood();
            gameManager.updateScore(10);
            if (this.speed > 50) this.speed -= 2;
            clearInterval(this.gameLoop);
            this.startLoop();
        } else {
            this.snake.pop();
        }

        this.render();
        this.updateInfo();
    }

    spawnFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.some(s => s.x === food.x && s.y === food.y));
        return food;
    }

    render() {
        this.board.innerHTML = '<div class="snake-grid"></div>';
        const grid = this.board.querySelector('.snake-grid');

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'snake-cell';
                
                if (this.snake[0].x === x && this.snake[0].y === y) {
                    cell.classList.add('head');
                } else if (this.snake.some(s => s.x === x && s.y === y)) {
                    cell.classList.add('snake');
                } else if (this.food.x === x && this.food.y === y) {
                    cell.classList.add('food');
                }
                grid.appendChild(cell);
            }
        }
    }

    updateInfo() {
        this.setInfo(`<span>Score: ${this.score}</span><span>Length: ${this.snake.length}</span>`);
        this.setStatus('Use arrow keys to move');
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.setStatus('Game Over!', 'loser');
        gameManager.showGameOver('Game Over!', `Final Score: ${this.score}`);
    }
}

// ========== MINESWEEPER ==========
class Minesweeper extends BaseGame {
    constructor() {
        super('Minesweeper');
        this.size = 9;
        this.mineCount = 10;
        this.init();
    }

    init() {
        this.grid = [];
        this.revealed = [];
        this.flagged = [];
        this.mines = [];
        this.isGameOver = false;
        this.firstClick = true;

        for (let i = 0; i < this.size * this.size; i++) {
            this.grid[i] = 0;
            this.revealed[i] = false;
            this.flagged[i] = false;
        }

        this.render();
        this.updateInfo();
    }

    get instructions() {
        return `<h4>Minesweeper</h4>
        <p>Reveal all cells without hitting a mine!</p>
        <p><strong>Left click:</strong> Reveal cell</p>
        <p><strong>Right click:</strong> Place/remove flag</p>`;
    }

    placeMines(excludeIndex) {
        let placed = 0;
        while (placed < this.mineCount) {
            const idx = Math.floor(Math.random() * this.size * this.size);
            if (idx !== excludeIndex && !this.mines.includes(idx)) {
                this.mines.push(idx);
                this.grid[idx] = -1;
                placed++;
            }
        }

        // Calculate numbers
        for (let i = 0; i < this.size * this.size; i++) {
            if (this.grid[i] === -1) continue;
            const neighbors = this.getNeighbors(i);
            this.grid[i] = neighbors.filter(n => this.grid[n] === -1).length;
        }
    }

    getNeighbors(idx) {
        const neighbors = [];
        const row = Math.floor(idx / this.size);
        const col = idx % this.size;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr, nc = col + dc;
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                    neighbors.push(nr * this.size + nc);
                }
            }
        }
        return neighbors;
    }

    render() {
        this.board.innerHTML = '<div class="mine-grid"></div>';
        const grid = this.board.querySelector('.mine-grid');

        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'mine-cell';
            
            if (this.revealed[i]) {
                cell.classList.add('revealed');
                if (this.grid[i] === -1) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else if (this.grid[i] > 0) {
                    cell.textContent = this.grid[i];
                    cell.dataset.count = this.grid[i];
                }
            } else if (this.flagged[i]) {
                cell.classList.add('flagged');
            }

            cell.addEventListener('click', () => this.reveal(i));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.toggleFlag(i);
            });
            grid.appendChild(cell);
        }
    }

    reveal(idx) {
        if (this.isGameOver || this.revealed[idx] || this.flagged[idx]) return;

        if (this.firstClick) {
            this.placeMines(idx);
            this.firstClick = false;
        }

        this.revealed[idx] = true;

        if (this.grid[idx] === -1) {
            this.isGameOver = true;
            this.mines.forEach(m => this.revealed[m] = true);
            this.render();
            this.setStatus('Game Over! 💥', 'loser');
            gameManager.showGameOver('Game Over!', 'You hit a mine!');
            return;
        }

        if (this.grid[idx] === 0) {
            this.getNeighbors(idx).forEach(n => this.reveal(n));
        }

        this.render();
        this.checkWin();
    }

    toggleFlag(idx) {
        if (this.isGameOver || this.revealed[idx]) return;
        this.flagged[idx] = !this.flagged[idx];
        this.render();
        this.updateInfo();
    }

    checkWin() {
        const unrevealed = this.revealed.filter((r, i) => !r && this.grid[i] !== -1).length;
        if (unrevealed === 0) {
            this.isGameOver = true;
            this.setStatus('You Win! 🎉', 'winner');
            gameManager.showGameOver('Congratulations!', 'You cleared all mines!', true);
        }
    }

    updateInfo() {
        const flags = this.flagged.filter(f => f).length;
        this.setInfo(`<span>Mines: ${this.mineCount}</span><span>Flags: ${flags}</span>`);
        this.setStatus('Left click to reveal, right click to flag');
    }
}

// ========== MEMORY MATCH ==========
class MemoryMatch extends BaseGame {
    constructor() {
        super('Memory Match');
        this.emojis = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎰', '🎳'];
        this.init();
    }

    init() {
        this.cards = [...this.emojis, ...this.emojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
        this.flippedCards = [];
        this.moves = 0;
        this.matches = 0;
        this.isLocked = false;
        this.isGameOver = false;
        this.render();
        this.updateInfo();
    }

    get instructions() {
        return `<h4>Memory Match</h4>
        <p>Flip cards to find matching pairs. Match all pairs to win!</p>
        <p><strong>Controls:</strong> Click cards to flip them.</p>`;
    }

    render() {
        this.board.innerHTML = '<div class="memory-grid"></div>';
        const grid = this.board.querySelector('.memory-grid');

        this.cards.forEach((card, i) => {
            const div = document.createElement('div');
            div.className = 'memory-card' + (card.flipped || card.matched ? ' flipped' : '') + (card.matched ? ' matched' : '');
            div.innerHTML = `
                <div class="card-face card-front">❓</div>
                <div class="card-face card-back">${card.emoji}</div>
            `;
            div.addEventListener('click', () => this.flipCard(i));
            grid.appendChild(div);
        });
    }

    flipCard(index) {
        const card = this.cards[index];
        if (this.isLocked || card.flipped || card.matched || this.isGameOver) return;

        card.flipped = true;
        this.flippedCards.push(card);
        this.render();

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.isLocked = true;
            this.checkMatch();
        }
        this.updateInfo();
    }

    checkMatch() {
        const [a, b] = this.flippedCards;
        if (a.emoji === b.emoji) {
            a.matched = b.matched = true;
            this.matches++;
            this.flippedCards = [];
            this.isLocked = false;
            gameManager.updateScore(20);

            if (this.matches === this.emojis.length) {
                this.isGameOver = true;
                this.setStatus('You Win! 🎉', 'winner');
                gameManager.showGameOver('Congratulations!', `Completed in ${this.moves} moves!`, true);
            }
        } else {
            setTimeout(() => {
                a.flipped = b.flipped = false;
                this.flippedCards = [];
                this.isLocked = false;
                this.render();
            }, 1000);
        }
    }

    updateInfo() {
        this.setInfo(`<span>Moves: ${this.moves}</span><span>Pairs: ${this.matches}/${this.emojis.length}</span>`);
        this.setStatus('Find all matching pairs!');
    }
}

// ========== ROCK PAPER SCISSORS ==========
class RockPaperScissors extends BaseGame {
    constructor() {
        super('Rock Paper Scissors');
        this.choices = ['rock', 'paper', 'scissors'];
        this.emojis = { rock: '✊', paper: '✋', scissors: '✌️' };
        this.init();
    }

    init() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.round = 0;
        this.maxRounds = 5;
        this.lastResult = null;
        this.playerChoice = null;
        this.computerChoice = null;
        this.isGameOver = false;
        this.render();
        this.updateInfo();
    }

    get instructions() {
        return `<h4>Rock Paper Scissors</h4>
        <p>Best of 5 rounds against the computer!</p>
        <p><strong>Rules:</strong> Rock beats Scissors, Scissors beats Paper, Paper beats Rock.</p>`;
    }

    render() {
        this.board.innerHTML = `
            <div class="rps-choices">
                <button class="rps-btn" data-choice="rock">${this.emojis.rock}</button>
                <button class="rps-btn" data-choice="paper">${this.emojis.paper}</button>
                <button class="rps-btn" data-choice="scissors">${this.emojis.scissors}</button>
            </div>
            <div class="rps-result" id="rpsResult"></div>
        `;

        this.board.querySelectorAll('.rps-btn').forEach(btn => {
            btn.addEventListener('click', () => this.play(btn.dataset.choice));
        });

        if (this.playerChoice && this.computerChoice) {
            document.getElementById('rpsResult').innerHTML = `
                <div class="rps-player">
                    <span>You</span>
                    <span style="font-size:4rem">${this.emojis[this.playerChoice]}</span>
                </div>
                <span class="rps-vs">VS</span>
                <div class="rps-computer">
                    <span>Computer</span>
                    <span style="font-size:4rem">${this.emojis[this.computerChoice]}</span>
                </div>
            `;
        }
    }

    play(choice) {
        if (this.isGameOver) return;

        this.playerChoice = choice;
        this.computerChoice = this.choices[Math.floor(Math.random() * 3)];
        this.round++;

        const result = this.getResult();
        if (result === 'win') {
            this.playerScore++;
            this.lastResult = 'You win this round!';
            gameManager.updateScore(10);
        } else if (result === 'lose') {
            this.computerScore++;
            this.lastResult = 'Computer wins this round!';
        } else {
            this.lastResult = "It's a tie!";
        }

        this.render();
        this.updateInfo();

        if (this.playerScore === 3 || this.computerScore === 3) {
            this.isGameOver = true;
            const winner = this.playerScore > this.computerScore ? 'You' : 'Computer';
            this.setStatus(`${winner} won the game!`, this.playerScore > this.computerScore ? 'winner' : 'loser');
            gameManager.showGameOver('Game Over!', `${winner} won ${this.playerScore > this.computerScore ? this.playerScore : this.computerScore}-${this.playerScore > this.computerScore ? this.computerScore : this.playerScore}!`, this.playerScore > this.computerScore);
        }
    }

    getResult() {
        if (this.playerChoice === this.computerChoice) return 'tie';
        if ((this.playerChoice === 'rock' && this.computerChoice === 'scissors') ||
            (this.playerChoice === 'scissors' && this.computerChoice === 'paper') ||
            (this.playerChoice === 'paper' && this.computerChoice === 'rock')) return 'win';
        return 'lose';
    }

    updateInfo() {
        this.setInfo(`<span>You: ${this.playerScore}</span><span>Round: ${this.round}/${this.maxRounds}</span><span>Computer: ${this.computerScore}</span>`);
        this.setStatus(this.lastResult || 'Choose your weapon!');
    }
}

// ========== 2048 ==========
class Game2048 extends BaseGame {
    constructor() {
        super('2048');
        this.size = 4;
        this.init();
    }

    init() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.isGameOver = false;
        this.addTile();
        this.addTile();
        this.render();
        this.updateInfo();
        this.bindKeys();
    }

    get instructions() {
        return `<h4>2048</h4>
        <p>Slide tiles to merge matching numbers. Reach 2048 to win!</p>
        <p><strong>Controls:</strong> Arrow keys or WASD to slide.</p>`;
    }

    bindKeys() {
        this.keyHandler = (e) => {
            if (this.isGameOver) return;
            const key = e.key.toLowerCase();
            let moved = false;
            if (key === 'arrowup' || key === 'w') moved = this.move('up');
            if (key === 'arrowdown' || key === 's') moved = this.move('down');
            if (key === 'arrowleft' || key === 'a') moved = this.move('left');
            if (key === 'arrowright' || key === 'd') moved = this.move('right');
            if (moved) {
                this.addTile();
                this.render();
                this.updateInfo();
                this.checkGameState();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    destroy() {
        document.removeEventListener('keydown', this.keyHandler);
    }

    addTile() {
        const empty = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) empty.push({ r, c });
            }
        }
        if (empty.length) {
            const { r, c } = empty[Math.floor(Math.random() * empty.length)];
            this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(dir) {
        let moved = false;
        const rotated = this.rotate(dir);

        for (let r = 0; r < this.size; r++) {
            const row = rotated[r].filter(x => x !== 0);
            const merged = [];
            for (let i = 0; i < row.length; i++) {
                if (row[i] === row[i + 1]) {
                    merged.push(row[i] * 2);
                    this.score += row[i] * 2;
                    gameManager.updateScore(row[i]);
                    i++;
                } else {
                    merged.push(row[i]);
                }
            }
            while (merged.length < this.size) merged.push(0);
            if (rotated[r].join() !== merged.join()) moved = true;
            rotated[r] = merged;
        }

        this.grid = this.unrotate(rotated, dir);
        return moved;
    }

    rotate(dir) {
        const g = this.grid.map(r => [...r]);
        if (dir === 'left') return g;
        if (dir === 'right') return g.map(r => r.reverse());
        if (dir === 'up') return g[0].map((_, i) => g.map(r => r[i]));
        if (dir === 'down') return g[0].map((_, i) => g.map(r => r[i]).reverse());
    }

    unrotate(g, dir) {
        if (dir === 'left') return g;
        if (dir === 'right') return g.map(r => r.reverse());
        if (dir === 'up') return g[0].map((_, i) => g.map(r => r[i]));
        if (dir === 'down') return g[0].map((_, i) => g.map(r => r[this.size - 1 - i]));
    }

    render() {
        this.board.innerHTML = '<div class="game-2048-grid"></div>';
        const grid = this.board.querySelector('.game-2048-grid');

        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const val = this.grid[r][c];
                const tile = document.createElement('div');
                tile.className = 'tile-2048' + (val ? ` tile-${val}` : '');
                tile.textContent = val || '';
                grid.appendChild(tile);
            }
        }
    }

    checkGameState() {
        // Check for 2048
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 2048) {
                    this.isGameOver = true;
                    this.setStatus('You Win! 🎉', 'winner');
                    gameManager.showGameOver('Congratulations!', `You reached 2048! Score: ${this.score}`, true);
                    return;
                }
            }
        }

        // Check for available moves
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) return;
                if (c < this.size - 1 && this.grid[r][c] === this.grid[r][c + 1]) return;
                if (r < this.size - 1 && this.grid[r][c] === this.grid[r + 1][c]) return;
            }
        }

        this.isGameOver = true;
        this.setStatus('Game Over!', 'loser');
        gameManager.showGameOver('Game Over!', `Final Score: ${this.score}`);
    }

    updateInfo() {
        this.setInfo(`<span>Score: ${this.score}</span>`);
        this.setStatus('Use arrow keys to slide tiles');
    }
}

// ========== WHACK-A-MOLE ==========
class WhackAMole extends BaseGame {
    constructor() {
        super('Whack-a-Mole');
        this.difficulties = {
            easy: { moleInterval: 1500, moleStay: 1200, time: 45 },
            medium: { moleInterval: 1000, moleStay: 800, time: 30 },
            hard: { moleInterval: 600, moleStay: 500, time: 20 }
        };
        this.difficulty = 'medium';
        this.showDifficultySelect();
    }

    showDifficultySelect() {
        this.board.innerHTML = `
            <div class="difficulty-select" style="text-align:center;">
                <h3 style="margin-bottom:20px;color:var(--text-primary);">Select Difficulty</h3>
                <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
                    <button class="btn btn-secondary diff-btn" data-diff="easy" style="min-width:120px;">
                        🟢 Easy<br><small>Slow moles, 45s</small>
                    </button>
                    <button class="btn btn-primary diff-btn" data-diff="medium" style="min-width:120px;">
                        🟡 Medium<br><small>Normal, 30s</small>
                    </button>
                    <button class="btn btn-secondary diff-btn" data-diff="hard" style="min-width:120px;">
                        🔴 Hard<br><small>Fast moles, 20s</small>
                    </button>
                </div>
            </div>
        `;
        this.board.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.dataset.diff;
                this.init();
            });
        });
        this.setStatus('Choose your difficulty level');
    }

    init() {
        const settings = this.difficulties[this.difficulty];
        this.score = 0;
        this.timeLeft = settings.time;
        this.moleIntervalTime = settings.moleInterval;
        this.moleStayTime = settings.moleStay;
        this.activeHoles = new Set();
        this.whackedHoles = new Set();
        this.isGameOver = false;
        this.isStarted = true;
        this.render();
        this.updateInfo();
        this.startGame();
    }

    get instructions() {
        return `<h4>Whack-a-Mole</h4>
        <p>Click the moles before they hide! The faster you click, the more points you earn.</p>
        <p><strong>Difficulty:</strong> Changes mole speed and game duration.</p>`;
    }

    render() {
        this.board.innerHTML = '<div class="mole-grid"></div>';
        const grid = this.board.querySelector('.mole-grid');

        for (let i = 0; i < 9; i++) {
            const hole = document.createElement('div');
            const isActive = this.activeHoles.has(i);
            const isWhacked = this.whackedHoles.has(i);
            hole.className = 'mole-hole' + (isActive ? ' active' : '') + (isWhacked ? ' whacked' : '');
            hole.innerHTML = '<div class="mole">🦔</div>';
            hole.addEventListener('click', (e) => {
                e.stopPropagation();
                this.whack(i);
            });
            grid.appendChild(hole);
        }
    }

    startGame() {
        this.moleInterval = setInterval(() => this.showMole(), this.moleIntervalTime);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateInfo();
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    showMole() {
        if (this.isGameOver) return;
        
        // Pick a random hole that's not already active
        let newHole;
        do {
            newHole = Math.floor(Math.random() * 9);
        } while (this.activeHoles.has(newHole) && this.activeHoles.size < 9);
        
        this.activeHoles.add(newHole);
        this.render();
        
        // Hide mole after stay time
        setTimeout(() => {
            if (this.activeHoles.has(newHole)) {
                this.activeHoles.delete(newHole);
                this.render();
            }
        }, this.moleStayTime);
    }

    whack(hole) {
        if (this.isGameOver) return;
        
        if (this.activeHoles.has(hole)) {
            this.score += 10;
            this.activeHoles.delete(hole);
            this.whackedHoles.add(hole);
            gameManager.updateScore(10);
            this.render();
            this.updateInfo();
            
            // Clear whacked visual after short delay
            setTimeout(() => {
                this.whackedHoles.delete(hole);
                this.render();
            }, 200);
        }
    }

    endGame() {
        this.isGameOver = true;
        clearInterval(this.moleInterval);
        clearInterval(this.timerInterval);
        this.setStatus('Time Up!', 'loser');
        gameManager.showGameOver('Time Up!', `Final Score: ${this.score} (${this.difficulty.toUpperCase()})`);
    }

    reset() {
        this.destroy();
        this.showDifficultySelect();
    }

    destroy() {
        clearInterval(this.moleInterval);
        clearInterval(this.timerInterval);
    }

    updateInfo() {
        this.setInfo(`<span>Score: ${this.score}</span><span>Time: ${this.timeLeft}s</span><span>Mode: ${this.difficulty.toUpperCase()}</span>`);
        this.setStatus('Click the moles as they appear!');
    }
}

// ========== SIMON SAYS ==========
class SimonSays extends BaseGame {
    constructor() {
        super('Simon Says');
        this.colors = ['red', 'green', 'yellow', 'blue'];
        this.init();
    }

    init() {
        this.sequence = [];
        this.playerSequence = [];
        this.isPlaying = false;
        this.score = 0;
        this.isGameOver = false;
        this.render();
        this.updateInfo();
        this.setStatus('Press any button to start!');
    }

    get instructions() {
        return `<h4>Simon Says</h4>
        <p>Watch the color sequence, then repeat it! Each round adds one more color.</p>`;
    }

    render() {
        this.board.innerHTML = '<div class="simon-grid"></div>';
        const grid = this.board.querySelector('.simon-grid');

        this.colors.forEach((color, i) => {
            const btn = document.createElement('button');
            btn.className = 'simon-btn';
            btn.dataset.color = color;
            btn.addEventListener('click', () => this.handleClick(i));
            grid.appendChild(btn);
        });
    }

    handleClick(index) {
        if (this.isGameOver) return;

        if (this.sequence.length === 0) {
            this.nextRound();
            return;
        }

        if (this.isPlaying) return;

        this.flashButton(index);
        this.playerSequence.push(index);

        const currentIndex = this.playerSequence.length - 1;
        if (this.playerSequence[currentIndex] !== this.sequence[currentIndex]) {
            this.gameOver();
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            this.score++;
            gameManager.updateScore(10);
            this.updateInfo();
            setTimeout(() => this.nextRound(), 1000);
        }
    }

    nextRound() {
        this.playerSequence = [];
        this.sequence.push(Math.floor(Math.random() * 4));
        this.isPlaying = true;
        this.setStatus('Watch the sequence...');
        this.playSequence();
    }

    playSequence() {
        let i = 0;
        const interval = setInterval(() => {
            if (i >= this.sequence.length) {
                clearInterval(interval);
                this.isPlaying = false;
                this.setStatus('Your turn!');
                return;
            }
            this.flashButton(this.sequence[i]);
            i++;
        }, 600);
    }

    flashButton(index) {
        const btns = this.board.querySelectorAll('.simon-btn');
        btns[index].classList.add('active');
        setTimeout(() => btns[index].classList.remove('active'), 300);
    }

    gameOver() {
        this.isGameOver = true;
        this.setStatus('Wrong! Game Over', 'loser');
        gameManager.showGameOver('Game Over!', `You reached level ${this.score}!`);
    }

    updateInfo() {
        this.setInfo(`<span>Level: ${this.score}</span>`);
    }
}

// ========== BREAKOUT ==========
class Breakout extends BaseGame {
    constructor() {
        super('Breakout');
        this.init();
    }

    init() {
        this.paddleX = 200;
        this.ballX = 240;
        this.ballY = 350;
        this.ballDX = 3;
        this.ballDY = -3;
        this.score = 0;
        this.isGameOver = false;
        this.bricks = [];

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 8; c++) {
                this.bricks.push({ x: c * 58 + 10, y: r * 25 + 30, alive: true });
            }
        }

        this.render();
        this.updateInfo();
        this.bindEvents();
        this.startLoop();
    }

    get instructions() {
        return `<h4>Breakout</h4>
        <p>Move the paddle to bounce the ball and break all bricks!</p>
        <p><strong>Controls:</strong> Mouse or arrow keys to move paddle.</p>`;
    }

    bindEvents() {
        this.mouseMoveHandler = (e) => {
            const rect = this.board.querySelector('.breakout-container').getBoundingClientRect();
            this.paddleX = Math.min(Math.max(e.clientX - rect.left - 40, 0), 400);
        };
        this.keyHandler = (e) => {
            if (e.key === 'ArrowLeft') this.paddleX = Math.max(this.paddleX - 20, 0);
            if (e.key === 'ArrowRight') this.paddleX = Math.min(this.paddleX + 20, 400);
        };
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('keydown', this.keyHandler);
    }

    destroy() {
        document.removeEventListener('mousemove', this.mouseMoveHandler);
        document.removeEventListener('keydown', this.keyHandler);
        cancelAnimationFrame(this.animationId);
    }

    startLoop() {
        const loop = () => {
            if (this.isGameOver) return;
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    update() {
        this.ballX += this.ballDX;
        this.ballY += this.ballDY;

        // Wall collisions
        if (this.ballX <= 0 || this.ballX >= 468) this.ballDX *= -1;
        if (this.ballY <= 0) this.ballDY *= -1;

        // Paddle collision
        if (this.ballY >= 365 && this.ballX >= this.paddleX && this.ballX <= this.paddleX + 80) {
            this.ballDY *= -1;
            this.ballY = 364;
        }

        // Ball out
        if (this.ballY > 400) {
            this.isGameOver = true;
            this.setStatus('Game Over!', 'loser');
            gameManager.showGameOver('Game Over!', `Final Score: ${this.score}`);
            return;
        }

        // Brick collisions
        this.bricks.forEach(brick => {
            if (brick.alive && this.ballX >= brick.x && this.ballX <= brick.x + 55 &&
                this.ballY >= brick.y && this.ballY <= brick.y + 20) {
                brick.alive = false;
                this.ballDY *= -1;
                this.score += 10;
                gameManager.updateScore(10);
                this.updateInfo();
            }
        });

        // Win check
        if (this.bricks.every(b => !b.alive)) {
            this.isGameOver = true;
            this.setStatus('You Win! 🎉', 'winner');
            gameManager.showGameOver('Congratulations!', `You cleared all bricks! Score: ${this.score}`, true);
        }
    }

    render() {
        const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71'];
        let bricksHtml = this.bricks.filter(b => b.alive).map((b, i) => 
            `<div class="breakout-brick" style="left:${b.x}px;top:${b.y}px;background:${colors[Math.floor(i/8)%4]}"></div>`
        ).join('');

        this.board.innerHTML = `
            <div class="breakout-container">
                ${bricksHtml}
                <div class="breakout-paddle" style="left:${this.paddleX}px"></div>
                <div class="breakout-ball" style="left:${this.ballX}px;top:${this.ballY}px"></div>
            </div>
        `;
    }

    updateInfo() {
        this.setInfo(`<span>Score: ${this.score}</span><span>Bricks: ${this.bricks.filter(b => b.alive).length}</span>`);
        this.setStatus('Move paddle with mouse or arrow keys');
    }
}

// ========== LIGHTS OUT ==========
class LightsOut extends BaseGame {
    constructor() {
        super('Lights Out');
        this.size = 5;
        this.init();
    }

    init() {
        this.grid = Array(this.size * this.size).fill(false);
        this.moves = 0;
        this.isGameOver = false;
        this.solutionMoves = [];
        
        // Generate a solvable puzzle by making random clicks from solved state
        // Store the moves so we know the solution exists
        const numMoves = Math.floor(Math.random() * 5) + 3; // 3-7 moves
        
        for (let i = 0; i < numMoves; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * 25);
            } while (this.solutionMoves.includes(randomIndex)); // Each cell at most once
            
            this.toggleCell(randomIndex, false);
            this.solutionMoves.push(randomIndex);
        }
        
        // If all lights are off, add a guaranteed pattern
        if (this.grid.every(light => !light)) {
            // Apply a simple cross pattern
            [7, 11, 12, 13, 17].forEach(idx => {
                this.toggleCell(idx, false);
                this.solutionMoves.push(idx);
            });
            // Simplify solution (clicking same cell twice cancels out)
            this.solutionMoves = this.solutionMoves.filter((idx, i, arr) => {
                return arr.filter(x => x === idx).length % 2 === 1;
            }).filter((v, i, a) => a.indexOf(v) === i);
        }
        
        this.render();
        this.updateInfo();
    }

    get instructions() {
        return `<h4>Lights Out</h4>
        <p>Turn off all the lights! Clicking a cell toggles it and its 4 neighbors.</p>
        <p><strong>Tip:</strong> Every puzzle is solvable! The solution uses the same cells that created the puzzle.</p>`;
    }

    toggleCell(index, count = true) {
        const row = Math.floor(index / this.size);
        const col = index % this.size;
        
        // Toggle the clicked cell
        this.grid[index] = !this.grid[index];
        
        // Toggle neighbors (up, down, left, right)
        if (row > 0) this.grid[index - this.size] = !this.grid[index - this.size];
        if (row < this.size - 1) this.grid[index + this.size] = !this.grid[index + this.size];
        if (col > 0) this.grid[index - 1] = !this.grid[index - 1];
        if (col < this.size - 1) this.grid[index + 1] = !this.grid[index + 1];
        
        if (count) this.moves++;
    }

    render() {
        this.board.innerHTML = `
            <div class="lights-grid"></div>
            <p style="margin-top:16px;color:var(--text-muted);font-size:0.85rem;text-align:center;">💡 Click a light to toggle it and its neighbors</p>
        `;
        const grid = this.board.querySelector('.lights-grid');

        this.grid.forEach((on, i) => {
            const cell = document.createElement('div');
            cell.className = 'light-cell ' + (on ? 'on' : 'off');
            cell.addEventListener('click', () => this.handleClick(i));
            grid.appendChild(cell);
        });
    }

    handleClick(index) {
        if (this.isGameOver) return;
        
        this.toggleCell(index);
        this.render();
        this.updateInfo();
        
        if (this.grid.every(light => !light)) {
            this.isGameOver = true;
            this.setStatus('You Win! 🎉', 'winner');
            gameManager.showGameOver('Congratulations!', `Solved in ${this.moves} moves!`, true);
            gameManager.updateScore(50);
        }
    }

    updateInfo() {
        const lightsOn = this.grid.filter(l => l).length;
        this.setInfo(`<span>Moves: ${this.moves}</span><span>Lights On: ${lightsOn}</span>`);
        this.setStatus('Turn off all the lights!');
    }
}

// ========== SUDOKU ==========
class Sudoku extends BaseGame {
    constructor() {
        super('Sudoku');
        this.difficulties = {
            easy: 35,    // Remove 35 cells
            medium: 45,  // Remove 45 cells
            hard: 55     // Remove 55 cells
        };
        this.difficulty = 'medium';
        this.showDifficultySelect();
    }

    showDifficultySelect() {
        this.board.innerHTML = `
            <div class="difficulty-select" style="text-align:center;">
                <h3 style="margin-bottom:20px;color:var(--text-primary);">Select Difficulty</h3>
                <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
                    <button class="btn btn-secondary diff-btn" data-diff="easy" style="min-width:120px;">
                        🟢 Easy<br><small>35 empty cells</small>
                    </button>
                    <button class="btn btn-primary diff-btn" data-diff="medium" style="min-width:120px;">
                        🟡 Medium<br><small>45 empty cells</small>
                    </button>
                    <button class="btn btn-secondary diff-btn" data-diff="hard" style="min-width:120px;">
                        🔴 Hard<br><small>55 empty cells</small>
                    </button>
                </div>
            </div>
        `;
        this.board.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.dataset.diff;
                this.init();
            });
        });
        this.setStatus('Choose your difficulty level');
    }

    init() {
        this.solution = this.generateSolution();
        this.puzzle = this.createPuzzle(this.difficulties[this.difficulty]);
        this.userGrid = this.puzzle.map(row => [...row]);
        this.selectedCell = null;
        this.isGameOver = false;
        this.bindKeyboard();
        this.render();
        this.updateInfo();
    }

    get instructions() {
        return `<h4>Sudoku</h4>
        <p>Fill the grid so each row, column, and 3x3 box contains digits 1-9.</p>
        <p><strong>Controls:</strong> Click a cell, then click a number button OR type 1-9 on keyboard. Press 0 or Backspace to clear.</p>`;
    }

    bindKeyboard() {
        this.keyHandler = (e) => {
            if (!this.selectedCell || this.isGameOver) return;
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                this.enterNumber(num);
            } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
                this.enterNumber(0);
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    destroy() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
    }

    generateSolution() {
        const grid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fillGrid(grid);
        return grid;
    }

    fillGrid(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
                    for (const num of nums) {
                        if (this.isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (this.fillGrid(grid)) return true;
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValid(grid, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num || grid[i][col] === num) return false;
        }
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r][c] === num) return false;
            }
        }
        return true;
    }

    createPuzzle(removeCount) {
        const puzzle = this.solution.map(row => [...row]);
        let removed = 0;
        const attempts = new Set();
        
        while (removed < removeCount && attempts.size < 81) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            const key = row * 9 + col;
            
            if (!attempts.has(key) && puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                removed++;
            }
            attempts.add(key);
        }
        return puzzle;
    }

    render() {
        this.board.innerHTML = `
            <div class="sudoku-grid"></div>
            <div class="sudoku-numbers" style="display:flex;gap:8px;margin-top:16px;justify-content:center;flex-wrap:wrap;">
                ${[1,2,3,4,5,6,7,8,9,0].map(n => 
                    `<button class="btn btn-secondary" style="width:40px;height:40px;padding:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;" data-num="${n}">${n === 0 ? '⌫' : n}</button>`
                ).join('')}
            </div>
            <p style="margin-top:8px;color:var(--text-muted);font-size:0.85rem;text-align:center;">💡 You can also use keyboard: 1-9 to enter, 0 or Backspace to clear</p>
        `;
        
        const grid = this.board.querySelector('.sudoku-grid');

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                const val = this.userGrid[r][c];
                const isFixed = this.puzzle[r][c] !== 0;
                const isSelected = this.selectedCell && this.selectedCell.r === r && this.selectedCell.c === c;
                const isError = val !== 0 && val !== this.solution[r][c];
                
                cell.className = 'sudoku-cell' + 
                    (isFixed ? ' fixed' : '') + 
                    (isSelected ? ' selected' : '') +
                    (isError ? ' error' : '');
                cell.textContent = val || '';
                cell.addEventListener('click', () => this.selectCell(r, c));
                grid.appendChild(cell);
            }
        }

        this.board.querySelectorAll('[data-num]').forEach(btn => {
            btn.addEventListener('click', () => this.enterNumber(parseInt(btn.dataset.num)));
        });
    }

    selectCell(r, c) {
        if (this.puzzle[r][c] !== 0 || this.isGameOver) return;
        this.selectedCell = { r, c };
        this.render();
    }

    enterNumber(num) {
        if (!this.selectedCell || this.isGameOver) return;
        const { r, c } = this.selectedCell;
        this.userGrid[r][c] = num;
        this.render();
        this.checkWin();
    }

    checkWin() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.userGrid[r][c] !== this.solution[r][c]) return;
            }
        }
        this.isGameOver = true;
        this.setStatus('You Win! 🎉', 'winner');
        gameManager.showGameOver('Congratulations!', `Puzzle completed on ${this.difficulty.toUpperCase()} mode!`, true);
        gameManager.updateScore(this.difficulty === 'hard' ? 150 : this.difficulty === 'medium' ? 100 : 50);
    }

    reset() {
        this.destroy();
        this.showDifficultySelect();
    }

    updateInfo() {
        const filled = this.userGrid.flat().filter(c => c !== 0).length;
        this.setInfo(`<span>Filled: ${filled}/81</span><span>Mode: ${this.difficulty.toUpperCase()}</span>`);
        this.setStatus('Click cell, then enter number (1-9) or click button');
    }
}

// ========== HANGMAN ==========
class Hangman extends BaseGame {
    constructor() {
        super('Hangman');
        this.words = ['JAVASCRIPT', 'PYTHON', 'ARCADE', 'GAMING', 'PUZZLE', 'SNAKE', 'MEMORY', 'BREAKOUT', 'SUDOKU', 'MINESWEEPER'];
        this.init();
    }

    init() {
        this.word = this.words[Math.floor(Math.random() * this.words.length)];
        this.guessed = [];
        this.wrongGuesses = 0;
        this.maxWrong = 6;
        this.isGameOver = false;
        this.render();
        this.updateInfo();
    }

    get instructions() {
        return `<h4>Hangman</h4>
        <p>Guess the word letter by letter. 6 wrong guesses and you lose!</p>`;
    }

    render() {
        const displayWord = this.word.split('').map(l => 
            this.guessed.includes(l) ? l : '_'
        ).join(' ');

        const hangmanParts = [
            '<circle cx="100" cy="30" r="20" stroke="white" fill="none" stroke-width="3"/>', // head
            '<line x1="100" y1="50" x2="100" y2="100" stroke="white" stroke-width="3"/>', // body
            '<line x1="100" y1="60" x2="70" y2="90" stroke="white" stroke-width="3"/>', // left arm
            '<line x1="100" y1="60" x2="130" y2="90" stroke="white" stroke-width="3"/>', // right arm
            '<line x1="100" y1="100" x2="70" y2="140" stroke="white" stroke-width="3"/>', // left leg
            '<line x1="100" y1="100" x2="130" y2="140" stroke="white" stroke-width="3"/>' // right leg
        ];

        const svgContent = hangmanParts.slice(0, this.wrongGuesses).join('');

        this.board.innerHTML = `
            <div class="hangman-container">
                <div class="hangman-drawing">
                    <svg viewBox="0 0 200 180">
                        <line x1="40" y1="170" x2="160" y2="170" stroke="white" stroke-width="3"/>
                        <line x1="60" y1="170" x2="60" y2="10" stroke="white" stroke-width="3"/>
                        <line x1="60" y1="10" x2="100" y2="10" stroke="white" stroke-width="3"/>
                        <line x1="100" y1="10" x2="100" y2="10" stroke="white" stroke-width="3"/>
                        ${svgContent}
                    </svg>
                </div>
                <div class="hangman-word">${displayWord}</div>
                <div class="hangman-keyboard">
                    ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => {
                        const used = this.guessed.includes(l);
                        const correct = this.word.includes(l) && used;
                        const wrong = !this.word.includes(l) && used;
                        return `<button class="hangman-key ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}" 
                            ${used ? 'disabled' : ''} data-letter="${l}">${l}</button>`;
                    }).join('')}
                </div>
            </div>
        `;

        this.board.querySelectorAll('.hangman-key').forEach(key => {
            key.addEventListener('click', () => this.guess(key.dataset.letter));
        });
    }

    guess(letter) {
        if (this.isGameOver || this.guessed.includes(letter)) return;
        
        this.guessed.push(letter);
        
        if (!this.word.includes(letter)) {
            this.wrongGuesses++;
        }

        this.render();
        this.updateInfo();

        if (this.wrongGuesses >= this.maxWrong) {
            this.isGameOver = true;
            this.setStatus(`Game Over! The word was ${this.word}`, 'loser');
            gameManager.showGameOver('Game Over!', `The word was: ${this.word}`);
        } else if (this.word.split('').every(l => this.guessed.includes(l))) {
            this.isGameOver = true;
            this.setStatus('You Win! 🎉', 'winner');
            gameManager.showGameOver('Congratulations!', `You guessed: ${this.word}!`, true);
            gameManager.updateScore(50);
        }
    }

    updateInfo() {
        this.setInfo(`<span>Wrong: ${this.wrongGuesses}/${this.maxWrong}</span>`);
        this.setStatus('Click letters to guess the word');
    }
}

// ========== NUMBER GUESSING ==========
class NumberGuessing extends BaseGame {
    constructor() {
        super('Number Guessing');
        this.init();
    }

    init() {
        this.target = Math.floor(Math.random() * 100) + 1;
        this.guesses = [];
        this.hint = '';
        this.isGameOver = false;
        this.render();
        this.updateInfo();
    }

    get instructions() {
        return `<h4>Number Guessing</h4>
        <p>Guess the number between 1 and 100. Use the hints to help you!</p>`;
    }

    render() {
        this.board.innerHTML = `
            <div class="numguess-container">
                <div class="numguess-display">?</div>
                <div class="numguess-input">
                    <input type="number" min="1" max="100" placeholder="1-100" id="guessInput">
                    <button class="btn btn-primary" id="guessBtn">Guess</button>
                </div>
                <div class="numguess-hint ${this.hint}">${this.getHintText()}</div>
                <div class="numguess-history">
                    ${this.guesses.map(g => `<span class="numguess-guess">${g}</span>`).join('')}
                </div>
            </div>
        `;

        const input = document.getElementById('guessInput');
        const btn = document.getElementById('guessBtn');
        
        btn.addEventListener('click', () => this.makeGuess(parseInt(input.value)));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess(parseInt(input.value));
        });
        
        setTimeout(() => input.focus(), 100);
    }

    makeGuess(num) {
        if (this.isGameOver || isNaN(num) || num < 1 || num > 100) return;

        this.guesses.push(num);

        if (num === this.target) {
            this.hint = 'correct';
            this.isGameOver = true;
            this.board.querySelector('.numguess-display').textContent = this.target;
            this.render();
            this.setStatus('You Win! 🎉', 'winner');
            gameManager.showGameOver('Congratulations!', `Guessed in ${this.guesses.length} tries!`, true);
            gameManager.updateScore(Math.max(100 - this.guesses.length * 10, 10));
        } else if (num < this.target) {
            this.hint = 'higher';
        } else {
            this.hint = 'lower';
        }

        this.render();
        this.updateInfo();
    }

    getHintText() {
        if (this.hint === 'higher') return '📈 Go Higher!';
        if (this.hint === 'lower') return '📉 Go Lower!';
        if (this.hint === 'correct') return '🎯 Correct!';
        return 'Enter a number to start';
    }

    updateInfo() {
        this.setInfo(`<span>Guesses: ${this.guesses.length}</span>`);
        this.setStatus('Guess a number between 1 and 100');
    }
}

// ========== TETRIS ==========
class Tetris extends BaseGame {
    constructor() {
        super('Tetris');
        this.init();
    }

    init() {
        this.cols = 10;
        this.rows = 20;
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.isGameOver = false;
        this.isPaused = false;
        
        this.pieces = [
            [[1,1,1,1]], // I
            [[1,1],[1,1]], // O
            [[0,1,0],[1,1,1]], // T
            [[1,0,0],[1,1,1]], // L
            [[0,0,1],[1,1,1]], // J
            [[0,1,1],[1,1,0]], // S
            [[1,1,0],[0,1,1]]  // Z
        ];
        this.colors = ['#00f5ff', '#ffeb3b', '#9c27b0', '#ff9800', '#2196f3', '#4caf50', '#f44336'];
        
        this.spawnPiece();
        this.render();
        this.updateInfo();
        this.bindKeys();
        this.startLoop();
    }

    get instructions() {
        return `<h4>Tetris</h4>
        <p>Stack falling blocks to clear lines!</p>
        <p><strong>Controls:</strong> ←→ move, ↑ rotate, ↓ soft drop, Space hard drop</p>`;
    }

    spawnPiece() {
        const idx = Math.floor(Math.random() * this.pieces.length);
        this.currentPiece = this.pieces[idx].map(r => [...r]);
        this.currentColor = idx + 1;
        this.pieceX = Math.floor((this.cols - this.currentPiece[0].length) / 2);
        this.pieceY = 0;
        
        if (this.collides()) {
            this.isGameOver = true;
            this.setStatus('Game Over!', 'loser');
            gameManager.showGameOver('Game Over!', `Final Score: ${this.score}`);
        }
    }

    bindKeys() {
        this.keyHandler = (e) => {
            if (this.isGameOver) return;
            if (e.key === 'ArrowLeft') this.move(-1);
            if (e.key === 'ArrowRight') this.move(1);
            if (e.key === 'ArrowDown') this.softDrop();
            if (e.key === 'ArrowUp') this.rotate();
            if (e.key === ' ') this.hardDrop();
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    destroy() {
        document.removeEventListener('keydown', this.keyHandler);
        clearInterval(this.gameLoop);
    }

    startLoop() {
        this.gameLoop = setInterval(() => this.tick(), Math.max(100, 500 - this.level * 40));
    }

    tick() {
        if (this.isGameOver || this.isPaused) return;
        this.pieceY++;
        if (this.collides()) {
            this.pieceY--;
            this.lockPiece();
            this.clearLines();
            this.spawnPiece();
        }
        this.render();
    }

    move(dir) {
        this.pieceX += dir;
        if (this.collides()) this.pieceX -= dir;
        else this.render();
    }

    softDrop() {
        this.pieceY++;
        if (this.collides()) {
            this.pieceY--;
        } else {
            this.score += 1;
        }
        this.render();
    }

    hardDrop() {
        while (!this.collides()) {
            this.pieceY++;
            this.score += 2;
        }
        this.pieceY--;
        this.lockPiece();
        this.clearLines();
        this.spawnPiece();
        this.render();
    }

    rotate() {
        const rotated = this.currentPiece[0].map((_, i) => 
            this.currentPiece.map(row => row[i]).reverse()
        );
        const original = this.currentPiece;
        this.currentPiece = rotated;
        if (this.collides()) this.currentPiece = original;
        else this.render();
    }

    collides() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x]) {
                    const newX = this.pieceX + x;
                    const newY = this.pieceY + y;
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) return true;
                    if (newY >= 0 && this.grid[newY][newX]) return true;
                }
            }
        }
        return false;
    }

    lockPiece() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x]) {
                    const newY = this.pieceY + y;
                    if (newY >= 0) this.grid[newY][this.pieceX + x] = this.currentColor;
                }
            }
        }
    }

    clearLines() {
        let lines = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(c => c)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                lines++;
                y++;
            }
        }
        if (lines) {
            this.linesCleared += lines;
            this.score += [0, 100, 300, 500, 800][lines] * this.level;
            this.level = Math.floor(this.linesCleared / 10) + 1;
            gameManager.updateScore(lines * 10);
            clearInterval(this.gameLoop);
            this.startLoop();
            this.updateInfo();
        }
    }

    render() {
        let html = '<div class="tetris-container" style="display:flex;gap:20px;align-items:flex-start;">';
        html += '<div class="tetris-grid" style="display:grid;grid-template-columns:repeat(10,24px);grid-template-rows:repeat(20,24px);gap:1px;background:#1a1a2e;padding:4px;border-radius:8px;">';
        
        const display = this.grid.map(r => [...r]);
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x] && this.pieceY + y >= 0) {
                    display[this.pieceY + y][this.pieceX + x] = this.currentColor;
                }
            }
        }
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const color = display[y][x] ? this.colors[display[y][x] - 1] : '#16213e';
                html += `<div style="width:24px;height:24px;background:${color};border-radius:2px;"></div>`;
            }
        }
        html += '</div></div>';
        this.board.innerHTML = html;
    }

    updateInfo() {
        this.setInfo(`<span>Score: ${this.score}</span><span>Level: ${this.level}</span><span>Lines: ${this.linesCleared}</span>`);
        this.setStatus('Use arrow keys to play');
    }
}

// ========== PONG ==========
class Pong extends BaseGame {
    constructor() {
        super('Pong');
        this.init();
    }

    init() {
        this.width = 500;
        this.height = 300;
        this.paddleH = 60;
        this.paddleW = 10;
        this.ballSize = 10;
        
        this.p1Y = this.height / 2 - this.paddleH / 2;
        this.p2Y = this.height / 2 - this.paddleH / 2;
        this.ballX = this.width / 2;
        this.ballY = this.height / 2;
        this.ballDX = 4;
        this.ballDY = 2;
        
        this.p1Score = 0;
        this.p2Score = 0;
        this.winScore = 5;
        this.isGameOver = false;
        
        this.keys = {};
        this.render();
        this.updateInfo();
        this.bindKeys();
        this.startLoop();
    }

    get instructions() {
        return `<h4>Pong</h4>
        <p>First to 5 points wins!</p>
        <p><strong>Player 1:</strong> W/S keys | <strong>Player 2:</strong> ↑/↓ keys</p>`;
    }

    bindKeys() {
        this.keyDownHandler = (e) => { this.keys[e.key.toLowerCase()] = true; };
        this.keyUpHandler = (e) => { this.keys[e.key.toLowerCase()] = false; };
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }

    destroy() {
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        cancelAnimationFrame(this.animationId);
    }

    startLoop() {
        const loop = () => {
            if (this.isGameOver) return;
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    update() {
        // Paddle movement
        if (this.keys['w']) this.p1Y = Math.max(0, this.p1Y - 6);
        if (this.keys['s']) this.p1Y = Math.min(this.height - this.paddleH, this.p1Y + 6);
        if (this.keys['arrowup']) this.p2Y = Math.max(0, this.p2Y - 6);
        if (this.keys['arrowdown']) this.p2Y = Math.min(this.height - this.paddleH, this.p2Y + 6);

        // Ball movement
        this.ballX += this.ballDX;
        this.ballY += this.ballDY;

        // Top/bottom collision
        if (this.ballY <= 0 || this.ballY >= this.height - this.ballSize) this.ballDY *= -1;

        // Paddle collisions
        if (this.ballX <= this.paddleW + 10 && this.ballY >= this.p1Y && this.ballY <= this.p1Y + this.paddleH) {
            this.ballDX = Math.abs(this.ballDX) * 1.05;
            this.ballDY += (this.ballY - (this.p1Y + this.paddleH / 2)) * 0.1;
        }
        if (this.ballX >= this.width - this.paddleW - 10 - this.ballSize && this.ballY >= this.p2Y && this.ballY <= this.p2Y + this.paddleH) {
            this.ballDX = -Math.abs(this.ballDX) * 1.05;
            this.ballDY += (this.ballY - (this.p2Y + this.paddleH / 2)) * 0.1;
        }

        // Score
        if (this.ballX < 0) { this.p2Score++; this.resetBall(); }
        if (this.ballX > this.width) { this.p1Score++; this.resetBall(); }

        this.updateInfo();
        if (this.p1Score >= this.winScore || this.p2Score >= this.winScore) {
            this.isGameOver = true;
            const winner = this.p1Score >= this.winScore ? 'Player 1' : 'Player 2';
            this.setStatus(`${winner} Wins!`, 'winner');
            gameManager.showGameOver('Game Over!', `${winner} wins ${this.p1Score}-${this.p2Score}!`, true);
        }
    }

    resetBall() {
        this.ballX = this.width / 2;
        this.ballY = this.height / 2;
        this.ballDX = (Math.random() > 0.5 ? 1 : -1) * 4;
        this.ballDY = (Math.random() - 0.5) * 4;
    }

    render() {
        this.board.innerHTML = `
            <div style="position:relative;width:${this.width}px;height:${this.height}px;background:#1a1a2e;border:2px solid #6c5ce7;border-radius:8px;overflow:hidden;">
                <div style="position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(255,255,255,0.2);transform:translateX(-50%);"></div>
                <div style="position:absolute;left:10px;top:${this.p1Y}px;width:${this.paddleW}px;height:${this.paddleH}px;background:#00d9a5;border-radius:4px;"></div>
                <div style="position:absolute;right:10px;top:${this.p2Y}px;width:${this.paddleW}px;height:${this.paddleH}px;background:#ff6b6b;border-radius:4px;"></div>
                <div style="position:absolute;left:${this.ballX}px;top:${this.ballY}px;width:${this.ballSize}px;height:${this.ballSize}px;background:#fff;border-radius:50%;"></div>
            </div>
        `;
    }

    updateInfo() {
        this.setInfo(`<span style="color:#00d9a5">P1: ${this.p1Score}</span><span>First to ${this.winScore}</span><span style="color:#ff6b6b">P2: ${this.p2Score}</span>`);
        this.setStatus('P1: W/S | P2: ↑/↓');
    }
}

// ========== FLAPPY BIRD ==========
class FlappyBird extends BaseGame {
    constructor() {
        super('Flappy Bird');
        this.init();
    }

    init() {
        this.width = 400;
        this.height = 500;
        this.birdY = this.height / 2;
        this.birdVel = 0;
        this.gravity = 0.4;
        this.jumpForce = -8;
        this.score = 0;
        this.pipes = [];
        this.pipeGap = 150;
        this.pipeWidth = 60;
        this.isGameOver = false;
        this.isStarted = false;
        
        this.render();
        this.updateInfo();
        this.bindEvents();
    }

    get instructions() {
        return `<h4>Flappy Bird</h4>
        <p>Click or press Space to flap and avoid the pipes!</p>`;
    }

    bindEvents() {
        this.clickHandler = () => this.flap();
        this.keyHandler = (e) => { if (e.key === ' ') this.flap(); };
        this.board.addEventListener('click', this.clickHandler);
        document.addEventListener('keydown', this.keyHandler);
    }

    destroy() {
        this.board.removeEventListener('click', this.clickHandler);
        document.removeEventListener('keydown', this.keyHandler);
        cancelAnimationFrame(this.animationId);
    }

    flap() {
        if (this.isGameOver) return;
        if (!this.isStarted) {
            this.isStarted = true;
            this.startLoop();
        }
        this.birdVel = this.jumpForce;
    }

    startLoop() {
        const loop = () => {
            if (this.isGameOver) return;
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    update() {
        this.birdVel += this.gravity;
        this.birdY += this.birdVel;

        // Spawn pipes
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.width - 200) {
            const gapY = Math.random() * (this.height - this.pipeGap - 100) + 50;
            this.pipes.push({ x: this.width, gapY });
        }

        // Move and check pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].x -= 3;
            
            // Score
            if (!this.pipes[i].scored && this.pipes[i].x + this.pipeWidth < 50) {
                this.pipes[i].scored = true;
                this.score++;
                gameManager.updateScore(5);
                this.updateInfo();
            }

            // Collision
            if (this.pipes[i].x < 80 && this.pipes[i].x + this.pipeWidth > 30) {
                if (this.birdY < this.pipes[i].gapY || this.birdY + 30 > this.pipes[i].gapY + this.pipeGap) {
                    this.gameOver();
                    return;
                }
            }

            // Remove off-screen pipes
            if (this.pipes[i].x + this.pipeWidth < 0) this.pipes.splice(i, 1);
        }

        // Floor/ceiling collision
        if (this.birdY < 0 || this.birdY > this.height - 30) {
            this.gameOver();
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.setStatus('Game Over!', 'loser');
        gameManager.showGameOver('Game Over!', `Score: ${this.score}`);
    }

    render() {
        let pipesHtml = this.pipes.map(p => `
            <div style="position:absolute;left:${p.x}px;top:0;width:${this.pipeWidth}px;height:${p.gapY}px;background:linear-gradient(90deg,#2ecc71,#27ae60);border-radius:0 0 8px 8px;"></div>
            <div style="position:absolute;left:${p.x}px;top:${p.gapY + this.pipeGap}px;width:${this.pipeWidth}px;bottom:0;background:linear-gradient(90deg,#2ecc71,#27ae60);border-radius:8px 8px 0 0;"></div>
        `).join('');

        this.board.innerHTML = `
            <div style="position:relative;width:${this.width}px;height:${this.height}px;background:linear-gradient(#87ceeb,#e0f6ff);border:2px solid #6c5ce7;border-radius:8px;overflow:hidden;cursor:pointer;">
                ${pipesHtml}
                <div style="position:absolute;left:30px;top:${this.birdY}px;width:35px;height:30px;font-size:28px;transform:rotate(${Math.min(this.birdVel * 3, 45)}deg);">🐦</div>
                ${!this.isStarted ? '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);padding:20px;border-radius:12px;color:white;text-align:center;"><div style="font-size:24px;">Click or Space to Start</div></div>' : ''}
            </div>
        `;
    }

    updateInfo() {
        this.setInfo(`<span>Score: ${this.score}</span>`);
        this.setStatus('Click or press Space to flap!');
    }
}

// ========== COLOR MATCH ==========
class ColorMatch extends BaseGame {
    constructor() {
        super('Color Match');
        this.colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'];
        this.colorValues = { Red: '#e74c3c', Blue: '#3498db', Green: '#2ecc71', Yellow: '#f1c40f', Purple: '#9b59b6', Orange: '#e67e22' };
        this.init();
    }

    init() {
        this.score = 0;
        this.timeLeft = 30;
        this.isGameOver = false;
        this.generateRound();
        this.render();
        this.updateInfo();
        this.startTimer();
    }

    get instructions() {
        return `<h4>Color Match</h4>
        <p>Does the text color match the word? Click Yes or No as fast as you can!</p>`;
    }

    generateRound() {
        this.word = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.isMatch = Math.random() > 0.5;
        if (this.isMatch) this.color = this.word;
        else while (this.color === this.word) this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateInfo();
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    endGame() {
        this.isGameOver = true;
        clearInterval(this.timerInterval);
        this.setStatus('Time Up!', 'loser');
        gameManager.showGameOver('Time Up!', `Final Score: ${this.score}`);
    }

    destroy() {
        clearInterval(this.timerInterval);
    }

    answer(isYes) {
        if (this.isGameOver) return;
        const correct = (isYes && this.word === this.color) || (!isYes && this.word !== this.color);
        if (correct) {
            this.score += 10;
            gameManager.updateScore(10);
        } else {
            this.score = Math.max(0, this.score - 5);
        }
        this.generateRound();
        this.render();
        this.updateInfo();
    }

    render() {
        this.board.innerHTML = `
            <div style="text-align:center;">
                <p style="font-size:14px;color:var(--text-secondary);margin-bottom:20px;">Does the COLOR of the text match the WORD?</p>
                <div style="font-size:72px;font-weight:bold;color:${this.colorValues[this.color]};margin:40px 0;">${this.word}</div>
                <div style="display:flex;gap:20px;justify-content:center;">
                    <button class="btn btn-primary" style="width:120px;height:60px;font-size:24px;" id="yesBtn">✓ Yes</button>
                    <button class="btn btn-secondary" style="width:120px;height:60px;font-size:24px;background:#e74c3c;border-color:#e74c3c;" id="noBtn">✗ No</button>
                </div>
            </div>
        `;
        document.getElementById('yesBtn').addEventListener('click', () => this.answer(true));
        document.getElementById('noBtn').addEventListener('click', () => this.answer(false));
    }

    updateInfo() {
        this.setInfo(`<span>Score: ${this.score}</span><span>Time: ${this.timeLeft}s</span>`);
        this.setStatus('Match the color, not the word!');
    }
}

// ========== REACTION TIMER ==========
class ReactionTimer extends BaseGame {
    constructor() {
        super('Reaction Timer');
        this.init();
    }

    init() {
        this.times = [];
        this.state = 'waiting'; // waiting, ready, click
        this.isGameOver = false;
        this.round = 0;
        this.maxRounds = 5;
        this.render();
        this.updateInfo();
    }

    get instructions() {
        return `<h4>Reaction Timer</h4>
        <p>Wait for green, then click as fast as you can! Best of 5 rounds.</p>`;
    }

    destroy() {
        clearTimeout(this.timeout);
    }

    startRound() {
        if (this.round >= this.maxRounds) {
            this.endGame();
            return;
        }
        this.state = 'ready';
        this.render();
        const delay = Math.random() * 3000 + 2000;
        this.timeout = setTimeout(() => {
            this.state = 'click';
            this.startTime = Date.now();
            this.render();
        }, delay);
    }

    handleClick() {
        if (this.isGameOver) return;
        
        if (this.state === 'waiting') {
            this.startRound();
        } else if (this.state === 'ready') {
            clearTimeout(this.timeout);
            this.state = 'early';
            this.render();
            setTimeout(() => {
                this.state = 'waiting';
                this.render();
            }, 1500);
        } else if (this.state === 'click') {
            const time = Date.now() - this.startTime;
            this.times.push(time);
            this.round++;
            this.state = 'result';
            this.lastTime = time;
            this.render();
            setTimeout(() => {
                this.state = 'waiting';
                if (this.round < this.maxRounds) {
                    this.startRound();
                } else {
                    this.endGame();
                }
            }, 1000);
        }
    }

    endGame() {
        this.isGameOver = true;
        const avg = Math.round(this.times.reduce((a, b) => a + b, 0) / this.times.length);
        this.setStatus(`Average: ${avg}ms`, avg < 250 ? 'winner' : '');
        gameManager.showGameOver('Results', `Average reaction time: ${avg}ms`, avg < 300);
        gameManager.updateScore(Math.max(500 - avg, 0));
    }

    render() {
        const colors = { waiting: '#3498db', ready: '#e74c3c', click: '#2ecc71', early: '#e67e22', result: '#9b59b6' };
        const messages = {
            waiting: 'Click to Start',
            ready: 'Wait for Green...',
            click: 'CLICK NOW!',
            early: 'Too Early! Wait...',
            result: `${this.lastTime}ms`
        };

        this.board.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;gap:20px;">
                <div style="width:300px;height:300px;background:${colors[this.state]};border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.2s;" id="reactionCircle">
                    <span style="color:white;font-size:28px;font-weight:bold;text-align:center;">${messages[this.state]}</span>
                </div>
                <div style="display:flex;gap:10px;">
                    ${this.times.map((t, i) => `<span style="padding:8px 12px;background:var(--bg-card);border-radius:8px;">${i + 1}: ${t}ms</span>`).join('')}
                </div>
            </div>
        `;
        document.getElementById('reactionCircle').addEventListener('click', () => this.handleClick());
    }

    updateInfo() {
        this.setInfo(`<span>Round: ${this.round}/${this.maxRounds}</span>`);
        this.setStatus('Test your reflexes!');
    }
}

// ========== WORD SCRAMBLE ==========
class WordScramble extends BaseGame {
    constructor() {
        super('Word Scramble');
        this.words = ['ARCADE', 'PUZZLE', 'GAMING', 'PLAYER', 'SCREEN', 'BUTTON', 'MEMORY', 'RANDOM', 'SPRITE', 'LEVELS'];
        this.init();
    }

    init() {
        this.score = 0;
        this.round = 0;
        this.maxRounds = 10;
        this.timeLeft = 60;
        this.isGameOver = false;
        this.selectWord();
        this.render();
        this.updateInfo();
        this.startTimer();
    }

    get instructions() {
        return `<h4>Word Scramble</h4>
        <p>Unscramble the letters to find the hidden word! 10 words in 60 seconds.</p>`;
    }

    selectWord() {
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.scrambled = this.currentWord.split('').sort(() => Math.random() - 0.5).join('');
        while (this.scrambled === this.currentWord) {
            this.scrambled = this.currentWord.split('').sort(() => Math.random() - 0.5).join('');
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateInfo();
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    destroy() {
        clearInterval(this.timerInterval);
    }

    checkAnswer() {
        const input = document.getElementById('wordInput');
        if (!input) return;
        const guess = input.value.toUpperCase().trim();
        
        if (guess === this.currentWord) {
            this.score += 10;
            this.round++;
            gameManager.updateScore(10);
            
            if (this.round >= this.maxRounds) {
                this.endGame();
            } else {
                this.selectWord();
                this.render();
            }
        } else {
            input.style.animation = 'shake 0.3s';
            setTimeout(() => input.style.animation = '', 300);
        }
        this.updateInfo();
    }

    skip() {
        this.round++;
        if (this.round >= this.maxRounds) {
            this.endGame();
        } else {
            this.selectWord();
            this.render();
        }
        this.updateInfo();
    }

    endGame() {
        this.isGameOver = true;
        clearInterval(this.timerInterval);
        this.setStatus('Game Over!', this.score >= 50 ? 'winner' : 'loser');
        gameManager.showGameOver('Game Over!', `Final Score: ${this.score}`, this.score >= 50);
    }

    render() {
        this.board.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:48px;letter-spacing:12px;font-weight:bold;color:var(--accent-primary);margin:30px 0;">${this.scrambled}</div>
                <div style="display:flex;gap:10px;justify-content:center;margin:20px 0;">
                    <input type="text" id="wordInput" placeholder="Type your answer..." style="padding:12px 20px;font-size:18px;border:2px solid var(--accent-primary);border-radius:8px;background:var(--bg-card);color:var(--text-primary);width:200px;text-transform:uppercase;letter-spacing:2px;">
                    <button class="btn btn-primary" id="submitBtn">Submit</button>
                    <button class="btn btn-secondary" id="skipBtn">Skip</button>
                </div>
            </div>
        `;
        
        const input = document.getElementById('wordInput');
        document.getElementById('submitBtn').addEventListener('click', () => this.checkAnswer());
        document.getElementById('skipBtn').addEventListener('click', () => this.skip());
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.checkAnswer(); });
        input.focus();
    }

    updateInfo() {
        this.setInfo(`<span>Score: ${this.score}</span><span>Word: ${this.round + 1}/${this.maxRounds}</span><span>Time: ${this.timeLeft}s</span>`);
        this.setStatus('Unscramble the word!');
    }
}

// ========== PAC-MAN ==========
class PacMan extends BaseGame {
    constructor() {
        super('Pac-Man');
        this.init();
    }

    init() {
        this.cols = 15;
        this.rows = 15;
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;
        
        // Create maze (0 = wall, 1 = path with dot, 2 = empty path, 3 = pacman, 4 = ghost)
        this.maze = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,1,1,1,0,1,1,1,1,1,1,0],
            [0,1,0,0,1,0,1,0,1,0,1,0,0,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,0,1,0,0,1,0,1,0,0,1,0,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,0,0,1,0,1,0,0,0,1,0,1,0,0,0],
            [0,1,1,1,1,1,1,2,1,1,1,1,1,1,0],
            [0,0,0,1,0,1,0,0,0,1,0,1,0,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,0,1,0,0,1,0,1,0,0,1,0,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,0,0,1,0,1,0,1,0,1,0,0,1,0],
            [0,1,1,1,1,1,1,0,1,1,1,1,1,1,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        
        this.pacman = { x: 7, y: 7 };
        this.ghosts = [
            { x: 1, y: 1, color: '#ff6b6b' },
            { x: 13, y: 1, color: '#74b9ff' },
            { x: 1, y: 13, color: '#fd79a8' }
        ];
        this.totalDots = this.countDots();
        
        this.render();
        this.updateInfo();
        this.bindKeys();
        this.startLoop();
    }

    get instructions() {
        return `<h4>Pac-Man</h4>
        <p>Eat all the dots while avoiding ghosts!</p>
        <p><strong>Controls:</strong> Arrow keys to move</p>`;
    }

    countDots() {
        return this.maze.flat().filter(c => c === 1).length;
    }

    bindKeys() {
        this.keyHandler = (e) => {
            if (this.isGameOver) return;
            if (e.repeat) return; // Prevent key repeat causing double movement
            const moves = { 
                ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0],
                w: [0,-1], W: [0,-1], s: [0,1], S: [0,1], a: [-1,0], A: [-1,0], d: [1,0], D: [1,0]
            };
            if (moves[e.key]) {
                e.preventDefault();
                const [dx, dy] = moves[e.key];
                this.movePacman(dx, dy);
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    destroy() {
        document.removeEventListener('keydown', this.keyHandler);
        clearInterval(this.gameLoop);
    }

    startLoop() {
        this.gameLoop = setInterval(() => this.moveGhosts(), 400);
    }

    movePacman(dx, dy) {
        const newX = this.pacman.x + dx;
        const newY = this.pacman.y + dy;
        
        if (this.maze[newY] && this.maze[newY][newX] !== 0) {
            if (this.maze[newY][newX] === 1) {
                this.score += 10;
                this.maze[newY][newX] = 2;
                gameManager.updateScore(10);
            }
            this.pacman.x = newX;
            this.pacman.y = newY;
            this.render();
            this.updateInfo();
            this.checkWin();
            this.checkCollision();
        }
    }

    moveGhosts() {
        if (this.isGameOver) return;
        
        this.ghosts.forEach(ghost => {
            const dirs = [[0,-1],[0,1],[-1,0],[1,0]].filter(([dx,dy]) => {
                const nx = ghost.x + dx, ny = ghost.y + dy;
                return this.maze[ny] && this.maze[ny][nx] !== 0;
            });
            if (dirs.length) {
                const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
                ghost.x += dx;
                ghost.y += dy;
            }
        });
        this.render();
        this.checkCollision();
    }

    checkCollision() {
        if (this.ghosts.some(g => g.x === this.pacman.x && g.y === this.pacman.y)) {
            this.lives--;
            if (this.lives <= 0) {
                this.isGameOver = true;
                this.setStatus('Game Over!', 'loser');
                gameManager.showGameOver('Game Over!', `Final Score: ${this.score}`);
            } else {
                this.pacman = { x: 7, y: 7 };
                this.render();
                this.updateInfo();
            }
        }
    }

    checkWin() {
        if (this.countDots() === 0) {
            this.isGameOver = true;
            this.setStatus('You Win! 🎉', 'winner');
            gameManager.showGameOver('Congratulations!', `All dots eaten! Score: ${this.score}`, true);
        }
    }

    render() {
        let html = '<div style="display:grid;grid-template-columns:repeat(15,28px);gap:2px;">';
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let content = '', bg = '#1a1a2e';
                if (this.maze[y][x] === 0) bg = '#2d3436';
                else if (this.maze[y][x] === 1) content = '<div style="width:6px;height:6px;background:#f1c40f;border-radius:50%;"></div>';
                
                if (this.pacman.x === x && this.pacman.y === y) content = '<div style="font-size:20px;">😮</div>';
                const ghost = this.ghosts.find(g => g.x === x && g.y === y);
                if (ghost) content = `<div style="font-size:20px;color:${ghost.color};">👻</div>`;
                
                html += `<div style="width:28px;height:28px;background:${bg};display:flex;align-items:center;justify-content:center;border-radius:4px;">${content}</div>`;
            }
        }
        html += '</div>';
        this.board.innerHTML = html;
    }

    updateInfo() {
        this.setInfo(`<span>Score: ${this.score}</span><span>Lives: ${'❤️'.repeat(this.lives)}</span><span>Dots: ${this.countDots()}</span>`);
        this.setStatus('Eat all dots, avoid ghosts!');
    }
}

// ========== SPACE INVADERS ==========
class SpaceInvaders extends BaseGame {
    constructor() {
        super('Space Invaders');
        this.init();
    }

    init() {
        this.width = 400;
        this.height = 450;
        this.playerX = 185;
        this.score = 0;
        this.isGameOver = false;
        this.bullets = [];
        this.alienBullets = [];
        
        // Create aliens grid
        this.aliens = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 8; c++) {
                this.aliens.push({ x: 30 + c * 42, y: 30 + r * 35, alive: true });
            }
        }
        this.alienDir = 1;
        this.alienSpeed = 1;
        
        this.render();
        this.updateInfo();
        this.bindKeys();
        this.startLoop();
    }

    get instructions() {
        return `<h4>Space Invaders</h4>
        <p>Destroy all aliens before they reach you!</p>
        <p><strong>Controls:</strong> ←→ to move, Space to shoot</p>`;
    }

    bindKeys() {
        this.keys = {};
        this.keyDownHandler = (e) => { 
            this.keys[e.key] = true; 
            if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
        };
        this.keyUpHandler = (e) => { this.keys[e.key] = false; };
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }

    destroy() {
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        cancelAnimationFrame(this.animationId);
    }

    startLoop() {
        this.lastAlienMove = 0;
        this.lastAlienShoot = 0;
        const loop = (time) => {
            if (this.isGameOver) return;
            this.update(time);
            this.render();
            this.animationId = requestAnimationFrame(loop);
        };
        loop(0);
    }

    shoot() {
        if (this.bullets.length < 3) {
            this.bullets.push({ x: this.playerX + 12, y: this.height - 50 });
        }
    }

    update(time) {
        // Player movement
        if (this.keys['ArrowLeft']) this.playerX = Math.max(0, this.playerX - 5);
        if (this.keys['ArrowRight']) this.playerX = Math.min(this.width - 30, this.playerX + 5);

        // Move bullets
        this.bullets.forEach(b => b.y -= 8);
        this.bullets = this.bullets.filter(b => b.y > 0);

        // Move alien bullets
        this.alienBullets.forEach(b => b.y += 4);
        this.alienBullets = this.alienBullets.filter(b => b.y < this.height);

        // Move aliens periodically
        if (time - this.lastAlienMove > 500) {
            this.moveAliens();
            this.lastAlienMove = time;
        }

        // Alien shooting periodically
        if (time - this.lastAlienShoot > 1000) {
            this.alienShoot();
            this.lastAlienShoot = time;
        }

        // Check bullet-alien collisions
        this.bullets.forEach((bullet, bi) => {
            this.aliens.forEach(alien => {
                if (alien.alive && bullet.x >= alien.x && bullet.x <= alien.x + 30 && 
                    bullet.y >= alien.y && bullet.y <= alien.y + 25) {
                    alien.alive = false;
                    this.bullets.splice(bi, 1);
                    this.score += 10;
                    gameManager.updateScore(10);
                    this.updateInfo();
                }
            });
        });

        // Check alien bullet-player collision
        this.alienBullets.forEach(b => {
            if (b.x >= this.playerX && b.x <= this.playerX + 30 && b.y >= this.height - 40) {
                this.gameOver();
            }
        });

        // Check win
        if (this.aliens.every(a => !a.alive)) {
            this.isGameOver = true;
            this.setStatus('You Win! 🎉', 'winner');
            gameManager.showGameOver('Victory!', `All aliens destroyed! Score: ${this.score}`, true);
        }
    }

    moveAliens() {
        let hitEdge = this.aliens.some(a => a.alive && (a.x <= 5 || a.x >= this.width - 35));
        
        if (hitEdge) {
            this.alienDir *= -1;
            this.aliens.forEach(a => a.y += 15);
        } else {
            this.aliens.forEach(a => a.x += 10 * this.alienDir);
        }

        // Check if aliens reached bottom
        if (this.aliens.some(a => a.alive && a.y >= this.height - 80)) {
            this.gameOver();
        }
    }

    alienShoot() {
        const shooters = this.aliens.filter(a => a.alive);
        if (shooters.length) {
            const shooter = shooters[Math.floor(Math.random() * shooters.length)];
            this.alienBullets.push({ x: shooter.x + 15, y: shooter.y + 25 });
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.setStatus('Game Over!', 'loser');
        gameManager.showGameOver('Game Over!', `Final Score: ${this.score}`);
    }

    render() {
        let aliensHtml = this.aliens.filter(a => a.alive).map(a => 
            `<div style="position:absolute;left:${a.x}px;top:${a.y}px;font-size:24px;">👾</div>`
        ).join('');

        let bulletsHtml = this.bullets.map(b =>
            `<div style="position:absolute;left:${b.x}px;top:${b.y}px;width:4px;height:12px;background:#f1c40f;border-radius:2px;"></div>`
        ).join('');

        let alienBulletsHtml = this.alienBullets.map(b =>
            `<div style="position:absolute;left:${b.x}px;top:${b.y}px;width:4px;height:10px;background:#e74c3c;border-radius:2px;"></div>`
        ).join('');

        this.board.innerHTML = `
            <div style="position:relative;width:${this.width}px;height:${this.height}px;background:#0a0a1a;border:2px solid #2ecc71;border-radius:8px;overflow:hidden;">
                ${aliensHtml}
                ${bulletsHtml}
                ${alienBulletsHtml}
                <div style="position:absolute;left:${this.playerX}px;bottom:10px;font-size:28px;">🚀</div>
            </div>
        `;
    }

    updateInfo() {
        const remaining = this.aliens.filter(a => a.alive).length;
        this.setInfo(`<span>Score: ${this.score}</span><span>Aliens: ${remaining}</span>`);
        this.setStatus('←→ Move, Space to Shoot');
    }
}

// ========== CROSSWORD ==========
class Crossword extends BaseGame {
    constructor() {
        super('Crossword');
        this.init();
    }

    init() {
        this.puzzles = [
            {
                grid: [
                    ['C','O','D','E','#'],
                    ['#','#','A','#','#'],
                    ['G','A','M','E','S'],
                    ['#','#','E','#','#'],
                    ['#','#','#','#','#']
                ],
                clues: {
                    across: { '1': 'Write programs (4)', '3': 'Fun activities to play (5)' },
                    down: { '2': 'Informal word for game (4)' }
                },
                answers: { '1A': 'CODE', '3A': 'GAMES', '2D': 'GAME' }
            }
        ];
        
        this.puzzle = this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
        this.userGrid = this.puzzle.grid.map(row => row.map(c => c === '#' ? '#' : ''));
        this.selectedCell = null;
        this.isGameOver = false;
        this.score = 0;
        
        this.render();
        this.updateInfo();
        this.bindKeyboard();
    }

    get instructions() {
        return `<h4>Crossword</h4>
        <p>Fill in the crossword puzzle using the clues!</p>
        <p><strong>Controls:</strong> Click a cell, then type a letter.</p>`;
    }

    bindKeyboard() {
        this.keyHandler = (e) => {
            if (!this.selectedCell || this.isGameOver) return;
            if (/^[a-zA-Z]$/.test(e.key)) {
                const { r, c } = this.selectedCell;
                this.userGrid[r][c] = e.key.toUpperCase();
                this.render();
                this.checkWin();
            } else if (e.key === 'Backspace') {
                const { r, c } = this.selectedCell;
                this.userGrid[r][c] = '';
                this.render();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    destroy() {
        document.removeEventListener('keydown', this.keyHandler);
    }

    selectCell(r, c) {
        if (this.puzzle.grid[r][c] === '#' || this.isGameOver) return;
        this.selectedCell = { r, c };
        this.render();
    }

    checkWin() {
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (this.puzzle.grid[r][c] !== '#' && this.userGrid[r][c] !== this.puzzle.grid[r][c]) {
                    return;
                }
            }
        }
        this.isGameOver = true;
        this.score = 100;
        this.setStatus('You Win! 🎉', 'winner');
        gameManager.showGameOver('Congratulations!', 'Crossword completed!', true);
        gameManager.updateScore(100);
    }

    render() {
        let gridHtml = '<div style="display:grid;grid-template-columns:repeat(5,50px);gap:2px;">';
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const isBlack = this.puzzle.grid[r][c] === '#';
                const isSelected = this.selectedCell && this.selectedCell.r === r && this.selectedCell.c === c;
                const val = this.userGrid[r][c];
                const isCorrect = val && val === this.puzzle.grid[r][c];
                const isWrong = val && val !== this.puzzle.grid[r][c];
                
                gridHtml += `<div style="width:50px;height:50px;background:${isBlack ? '#2d3436' : isSelected ? '#6c5ce7' : '#16213e'};
                    border:2px solid ${isWrong ? '#e74c3c' : isCorrect ? '#2ecc71' : 'rgba(255,255,255,0.2)'};border-radius:4px;
                    display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:bold;
                    cursor:${isBlack ? 'default' : 'pointer'};color:${isWrong ? '#e74c3c' : 'white'};"
                    onclick="gameManager.currentGame && gameManager.currentGame.selectCell(${r},${c})">${isBlack ? '' : val}</div>`;
            }
        }
        gridHtml += '</div>';

        const cluesHtml = `
            <div style="display:flex;gap:30px;margin-top:20px;text-align:left;font-size:0.9rem;">
                <div><strong>Across:</strong><br>1. ${this.puzzle.clues.across['1']}<br>3. ${this.puzzle.clues.across['3']}</div>
                <div><strong>Down:</strong><br>2. ${this.puzzle.clues.down['2']}</div>
            </div>
        `;

        this.board.innerHTML = gridHtml + cluesHtml + '<p style="margin-top:10px;color:var(--text-muted);font-size:0.85rem;">💡 Click a cell, then type a letter. Backspace to clear.</p>';
    }

    updateInfo() {
        const filled = this.userGrid.flat().filter(c => c && c !== '#').length;
        const total = this.puzzle.grid.flat().filter(c => c !== '#').length;
        this.setInfo(`<span>Filled: ${filled}/${total}</span>`);
        this.setStatus('Fill in the crossword!');
    }
}

// ========== INITIALIZE GAME MANAGER ==========
const gameManager = new GameManager();

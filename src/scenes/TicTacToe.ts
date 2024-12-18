import { Scene } from 'phaser';

export class TicTacToe extends Scene {
    // 틱택토
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msgText: Phaser.GameObjects.Text;
    grid: Phaser.GameObjects.Rectangle[][];
    currentPlayer: string;
    board: string[][];
    restartButton: Phaser.GameObjects.Image;

    constructor() {
        super('TicTacToe');
        this.grid = [];
        this.currentPlayer = 'X';
        this.board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.msgText = this.add.text(512, 50, 'Tic-Tac-Toe', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.msgText.setOrigin(0.5);

        this.createGrid();
        this.createRestartButton();
    }

    createGrid() {
        const size = 100;
        const gridWidth = size * 3;
        const gridHeight = size * 3;
        const offsetX = (this.cameras.main.width - gridWidth) / 2 + size / 2;
        const offsetY = (this.cameras.main.height - gridHeight) / 2 + size / 2;

        for (let i = 0; i < 3; i++) {
            this.grid[i] = [];
            for (let j = 0; j < 3; j++) {
                const rect = this.add.rectangle(offsetX + j * size, offsetY + i * size, size, size, 0xffffff).setStrokeStyle(2, 0x000000);
                rect.setInteractive();
                rect.on('pointerdown', () => this.handleCellClick(i, j));
                this.grid[i][j] = rect;
            }
        }
    }

    createRestartButton() {
        this.restartButton = this.add.image(512, 700, 'button').setInteractive();
        this.restartButton.setVisible(false);
        this.restartButton.on('pointerdown', () => this.restartGame());
    }

    restartGame() {
    if (this.isBoardNotEmpty()) {
        this.resetGame();
    }
    this.scene.restart();
    }

    isBoardNotEmpty(): boolean {
        for (let row of this.board) {
            for (let cell of row) {
                if (cell !== '') {
                    return true;
                }
            }
        }
        return false;
    }

    resetGame() {
        this.board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
        this.currentPlayer = 'X';
        this.grid.forEach(row => row.forEach(cell => cell.setFillStyle(0xffffff)));
        this.msgText.setText('Tic-Tac-Toe');
        this.restartButton.setVisible(false);
    }

    handleCellClick(row: number, col: number) {
        if (this.board[row][col] !== '') {
            return;
        }

        this.board[row][col] = this.currentPlayer;
        this.add.text(this.grid[row][col].x, this.grid[row][col].y, this.currentPlayer, {
            fontFamily: 'Arial Black', fontSize: 48, color: '#000000'
        }).setOrigin(0.5);

        if (this.checkWin()) {
            this.msgText.setText(`${this.currentPlayer} Wins!`);
            this.endGame();
        } else if (this.checkDraw()) {
            this.msgText.setText('Draw!');
            this.endGame();
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
    }

    endGame() {
        this.grid.forEach(row => row.forEach(cell => cell.disableInteractive()));
        this.restartButton.setVisible(true);
    }

    checkWin(): boolean {
        const b = this.board;
        for (let i = 0; i < 3; i++) {
            if (b[i][0] === this.currentPlayer && b[i][1] === this.currentPlayer && b[i][2] === this.currentPlayer) return true;
            if (b[0][i] === this.currentPlayer && b[1][i] === this.currentPlayer && b[2][i] === this.currentPlayer) return true;
        }
        if (b[0][0] === this.currentPlayer && b[1][1] === this.currentPlayer && b[2][2] === this.currentPlayer) return true;
        if (b[0][2] === this.currentPlayer && b[1][1] === this.currentPlayer && b[2][0] === this.currentPlayer) return true;
        return false;
    }

    checkDraw(): boolean {
        return this.board.flat().every(cell => cell !== '');
    }
}
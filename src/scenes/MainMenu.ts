import { Scene, GameObjects } from 'phaser';

// Define the MainMenu class that extends Phaser's Scene class
export class MainMenu extends Scene {
    // Declare properties for background image, logo image, title text, and buttons
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    startButton: GameObjects.Text;
    startTictactoeButton: GameObjects.Text;
    optionsButton: GameObjects.Text;

    // Constructor method to initialize the scene with the key 'MainMenu'
    constructor() {
        super('MainMenu');
    }

    // Create method to set up the scene's content
    create() {
        // TEMP: 계속 클릭하기 귀찮아서 바로 게임으로 넘어가게 수정
        this.scene.start('preperation');
        // Add a background image at coordinates (512, 384) with the key 'background'
        this.background = this.add.image(512, 384, 'background');

        // Add a logo image at coordinates (512, 300) with the key 'logo'
        this.logo = this.add.image(512, 300, 'logo');

        // Add a title text at coordinates (512, 460) with specific style properties
        this.title = this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5); // Center the text origin

        // Add a start button at coordinates (512, 520) with specific style properties
        this.startButton = this.add.text(512, 520, 'Start Game', {
            fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
            backgroundColor: '#0000ff', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        this.startTictactoeButton = this.add.text(512, 580, 'Start Tic-Tac-Toe', {
            fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
            backgroundColor: '#0000ff', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        // Add an options button at coordinates (512, 580) with specific style properties
        this.optionsButton = this.add.text(512, 640, 'Options', {
            fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
            backgroundColor: '#0000ff', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        // Set up an input event listener for the start button
        this.startButton.on('pointerdown', () => {
            // Start the 'Game' scene when the start button is pressed
            this.scene.start('Game');
        });

        this.startTictactoeButton.on('pointerdown', () => {
            // Start the 'Game' scene when the start button is pressed
            this.scene.start('TicTacToe');
        });

        // Set up an input event listener for the options button
        this.optionsButton.on('pointerdown', () => {
            // Start the 'Options' scene when the options button is pressed
            this.scene.start('Options');
        });
    }
}
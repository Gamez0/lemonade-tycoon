import { Scene } from "phaser";
import { SupplyStatusContainer } from "../ui/supply-status-container";
import { BudgetContainer } from "../ui/budget-container";
import { GameControlContainer } from "../ui/game-control-container";
import { Supplies } from "../models/supplies";
import { Budget } from "../models/budget";
import { TextButton } from "../ui/text-button";

export class PreparationScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    private budget: Budget;
    private supplies: Supplies;
    supplyStatusContainer: SupplyStatusContainer;
    budgetContainer: BudgetContainer;
    gameControlUI: GameControlContainer;
    startButton: TextButton;

    constructor() {
        super("preparation");
        this.budget = new Budget(100);
        this.supplies = new Supplies(0, 0, 0, 0, 0, 0, 0, 0);
    }

    preload() {
        this.load.image("lemon", "assets/lemon-32.png");
        this.load.image("ice", "assets/ice-32.png");
        this.load.image("sugar", "assets/sugar-32.png");
        this.load.image("cup", "assets/cup-32.png");
        this.load.image("plus", "assets/plus.svg");
        this.load.image("minus", "assets/minus.svg");
        this.load.image("cup-16", "assets/cup-16.png");
        this.load.image("recipe-16", "assets/recipe-16.png");
        this.load.image("marketing-32", "assets/marketing-32.png");
        this.load.image("recipe-32", "assets/recipe-32.png");
        this.load.image("rent-32", "assets/rent-32.png");
        this.load.image("results-32", "assets/results-32.png");
        this.load.image("staff-32", "assets/staff-32.png");
        this.load.image("supplies-32", "assets/supplies-32.png");
        this.load.image("upgrades-32", "assets/upgrades-32.png");
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor("rgb(24, 174, 49)");

        this.supplyStatusContainer = new SupplyStatusContainer(this, 50, 25, this.supplies);
        this.budgetContainer = new BudgetContainer(this, 924, 16, this.budget);
        this.gameControlUI = new GameControlContainer(this, 0, 125, this.budget, this.supplies);
        this.startButton = new TextButton(this, 410, 700, "START GAME");
        this.startButton.setInteractive();
        this.startButton.on("pointerdown", () => {
            console.log("Starting game");
            this.scene.start("day", {
                budget: this.budget,
                supplies: this.supplies,
            });
        });
    }
}

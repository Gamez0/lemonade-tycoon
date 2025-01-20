import { Scene } from "phaser";
import { SupplyStatusContainer } from "../ui/supply-status-container";
import { BudgetContainer } from "../ui/budget-container";
import { GameControlContainer } from "../ui/game-control-container";
import { Supplies } from "../models/supplies";
import { Budget } from "../models/budget";

export class PreparationScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    private budget: Budget;
    private supplies: Supplies;
    supplyStatusContainer: SupplyStatusContainer;
    budgetContainer: BudgetContainer;
    gameControlUI: GameControlContainer;

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
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        this.supplyStatusContainer = new SupplyStatusContainer(this, 50, 25, this.supplies);
        this.budgetContainer = new BudgetContainer(this, 924, 50, this.budget);
        this.gameControlUI = new GameControlContainer(this, 50, 75, this.budget, this.supplies);
    }
}

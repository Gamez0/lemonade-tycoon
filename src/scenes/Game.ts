import { Scene } from 'phaser';
import { SupplyStatusContainer } from '../ui/supply-status-container';
import { BudgetContainer } from '../ui/budget-container';
import { GameControlUI } from '../ui/game-control-ui';
import { Supplies } from '../models/supplies';
import { Budget } from '../models/budget';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    private budget: Budget;
    private supplies: Supplies;
    supplyStatusContainer: SupplyStatusContainer;
    budgetContainer: BudgetContainer;
    gameControlUI: GameControlUI;
      

    constructor() {
        super('Game');
        this.budget = new Budget(100);
        this.supplies = new Supplies(0,0,0,0);
        
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.supplyStatusContainer = new SupplyStatusContainer(this, 50, 25, this.supplies);
        this.budgetContainer = new BudgetContainer(this, 924, 50, this.budget);
        this.gameControlUI = new GameControlUI(this, 50, 75, this.budget.getAmount, this.budget.setAmount , this.supplies);
    }
}


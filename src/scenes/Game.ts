import { Scene } from 'phaser';
import { SupplyStatusUI } from '../ui/supply-status-ui';
import { BudgetUI } from '../ui/budget-ui';
import { GameControlUI } from '../ui/game-control-ui';
import { Supplies } from '../models/supplies';
import { Budget } from '../models/budget';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    private budget: Budget;
    private supplies: Supplies;
    supplyStatusUI: SupplyStatusUI;
    budgetUI: BudgetUI;
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

        this.supplyStatusUI = new SupplyStatusUI(this, 50, 25, this.supplies);
        this.budgetUI = new BudgetUI(this, 924, 50, this.budget.amount);
        this.gameControlUI = new GameControlUI(this, 50, 75, this.budget, this.supplies);
    }
}


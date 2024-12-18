import { Scene } from 'phaser';
import { SupplyStatusUI } from '../ui/supply-status-ui';
import { BudgetUI } from '../ui/budget-ui';
import { GameControlUI } from '../ui/game-control-ui';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    budget: number;
    lemon: number;
    sugar: number;
    ice: number;
    cup: number;
    supplyStatusUI: SupplyStatusUI;
    budgetUI: BudgetUI;
    gameControlUI: GameControlUI;
      

    constructor() {
        super('Game');
        this.budget = 100;
        this.lemon = 0;
        this.sugar = 0;
        this.ice = 0;
        this.cup = 0;
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.supplyStatusUI = new SupplyStatusUI(this, 50, 25, this.lemon, this.sugar, this.ice, this.cup);
        this.budgetUI = new BudgetUI(this, 924, 50, this.budget);
        this.gameControlUI = new GameControlUI(this, 50, 75);
    }

}
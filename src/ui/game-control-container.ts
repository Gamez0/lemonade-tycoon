import { SUPPLIES_LIMIT } from "../constants";
import { Budget } from "../models/budget";
import { RentedLocation } from "../models/location";
import { Recipe } from "../models/recipe";
import { Supplies } from "../models/supplies";
import { BuySuppliesContainer } from "./buy-supplies-container";
import { MarketingContainer } from "./marketing-container";
import { PreparationTabContainer } from "./preparation-tab-container";
import { RecipeContainer } from "./recipe-container";
import { RentContainer } from "./rent-container";
import { ResultsContainer } from "./results-container";
import { StaffContainer } from "./staff-container";
import { UpgradesContainer } from "./upgrades-container";

export interface SuppliesTotalPrice {
    lemonTotalPrice: number;
    sugarTotalPrice: number;
    iceTotalPrice: number;
    cupsTotalPrice: number;
}

export interface SuppliesTotalAmount {
    lemonTotalAmount: number;
    sugarTotalAmount: number;
    iceTotalAmount: number;
    cupsTotalAmount: number;
}

export class GameControlContainer extends Phaser.GameObjects.Container {
    // TODO: need better name for this class
    preparationTabContainer: PreparationTabContainer;
    selectedTabIndex: number;
    resultsContainer: ResultsContainer;
    rentContainer: RentContainer;
    upgradesContainer: UpgradesContainer;
    staffContainer: StaffContainer;
    marketingContainer: MarketingContainer;
    buySuppliesContainer: BuySuppliesContainer;
    recipeContainer: RecipeContainer;
    budget: Budget;
    private supplies: Supplies;
    tabItemsBackgroundContainer: Phaser.GameObjects.Rectangle;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        budget: Budget,
        supplies: Supplies,
        rentedLocation: RentedLocation,
        recipe: Recipe
    ) {
        super(scene, x, y);
        const marginLeft = 16;
        const padding = 16;
        this.preparationTabContainer = new PreparationTabContainer(scene, marginLeft + 32.5, 0); // 32.5 is half of the "Results" tab item width

        this.preparationTabContainer.on("tabSelected", this.onTabSelected, this);
        this.selectedTabIndex = 0; // Initialize selectedTabIndex

        this.budget = budget;
        this.supplies = supplies;

        this.resultsContainer = new ResultsContainer(scene, marginLeft + padding, 64);
        this.rentContainer = new RentContainer(scene, marginLeft + padding, 64, rentedLocation);
        this.upgradesContainer = new UpgradesContainer(scene, marginLeft + padding, 64);
        this.staffContainer = new StaffContainer(scene, marginLeft + padding, 64);
        this.marketingContainer = new MarketingContainer(scene, marginLeft + padding, 64);
        this.buySuppliesContainer = new BuySuppliesContainer(scene, marginLeft + padding, 64, this.purchaseSupplies);
        this.recipeContainer = new RecipeContainer(scene, marginLeft + padding, 64, this.supplies, recipe);

        this.tabItemsBackgroundContainer = scene.add.rectangle(marginLeft, 50, 488, 384, 0x009631, 1);
        this.tabItemsBackgroundContainer.setOrigin(0, 0);
        this.add([
            this.tabItemsBackgroundContainer,
            this.preparationTabContainer,
            this.resultsContainer,
            this.rentContainer,
            this.upgradesContainer,
            this.staffContainer,
            this.marketingContainer,
            this.buySuppliesContainer,
            this.recipeContainer,
        ]);
        scene.add.existing(this);
        this.updateUI();
    }

    onTabSelected(tabIndex: number) {
        this.selectedTabIndex = tabIndex;
        this.updateUI();
    }

    private purchaseSupplies = (totalPrice: SuppliesTotalPrice, totalAmount: SuppliesTotalAmount) => {
        const { lemonTotalPrice, sugarTotalPrice, iceTotalPrice, cupsTotalPrice } = totalPrice;
        const { lemonTotalAmount, sugarTotalAmount, iceTotalAmount, cupsTotalAmount } = totalAmount;
        const currentBudget: number = this.budget.getAmount();

        const totalCost = lemonTotalPrice + sugarTotalPrice + iceTotalPrice + cupsTotalPrice;
        if (totalCost > currentBudget) {
            alert("You don't have enough budget to buy all the supplies");
            return;
        }

        const exceedsLimit = (amount: number, limit: number, itemName: string) => {
            if (amount > limit) {
                alert(`You can't have more than ${limit} ${itemName}`);
                return true;
            }
            return false;
        };

        if (
            exceedsLimit(lemonTotalAmount + this.supplies.lemon, SUPPLIES_LIMIT.LEMON, "lemons") ||
            exceedsLimit(sugarTotalAmount + this.supplies.sugar, SUPPLIES_LIMIT.SUGAR, "sugars") ||
            exceedsLimit(iceTotalAmount + this.supplies.ice, SUPPLIES_LIMIT.ICE, "ices") ||
            exceedsLimit(cupsTotalAmount + this.supplies.cup, SUPPLIES_LIMIT.CUP, "cups")
        ) {
            return;
        }

        const newAmount = currentBudget - totalCost;
        this.budget.setAmount(newAmount);

        this.supplies.lemon += lemonTotalAmount;
        this.supplies.sugar += sugarTotalAmount;
        this.supplies.ice += iceTotalAmount;
        this.supplies.cup += cupsTotalAmount;

        this.buySuppliesContainer.reset();
    };

    updateUI() {
        // Hide all UI elements
        this.resultsContainer.setVisible(false);
        this.rentContainer.setVisible(false);
        this.upgradesContainer.setVisible(false);
        this.staffContainer.setVisible(false);
        this.marketingContainer.setVisible(false);
        this.buySuppliesContainer.setVisible(false);
        this.recipeContainer.setVisible(false);

        // Show UI elements based on selected tab
        switch (this.selectedTabIndex) {
            case 0:
                this.resultsContainer.setVisible(true);
                break;
            case 1:
                this.rentContainer.setVisible(true);
                break;
            case 2:
                this.upgradesContainer.setVisible(true);
                break;
            case 3:
                this.staffContainer.setVisible(true);
                break;
            case 4:
                this.marketingContainer.setVisible(true);
                break;
            case 5:
                this.recipeContainer.setVisible(true);
                break;
            case 6:
                this.buySuppliesContainer.setVisible(true);
                break;
            default:
                break;
        }
    }
}

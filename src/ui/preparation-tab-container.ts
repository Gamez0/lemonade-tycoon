export class PreparationTabContainer extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        // Create tab items
        const gap = 7; // Define a fixed gap value
        let currentX = 0;

        const results = new TabItem(scene, currentX, 0, "results");
        currentX += results.getContainerWidth() / 2 + gap;
        const rent = new TabItem(scene, currentX, 0, "rent");
        rent.setPosition(currentX + rent.getContainerWidth() / 2, 0);
        currentX += rent.getContainerWidth() + gap;
        const upgrades = new TabItem(scene, currentX, 0, "upgrades");
        upgrades.setPosition(currentX + upgrades.getContainerWidth() / 2, 0);
        currentX += upgrades.getContainerWidth() + gap;
        const staff = new TabItem(scene, currentX, 0, "staff");
        staff.setPosition(currentX + staff.getContainerWidth() / 2, 0);
        currentX += staff.getContainerWidth() + gap;
        const marketing = new TabItem(scene, currentX, 0, "marketing");
        marketing.setPosition(currentX + marketing.getContainerWidth() / 2, 0);
        currentX += marketing.getContainerWidth() + gap;
        const recipe = new TabItem(scene, currentX, 0, "recipe");
        recipe.setPosition(currentX + recipe.getContainerWidth() / 2, 0);
        currentX += recipe.getContainerWidth() + gap;
        const supplies = new TabItem(scene, currentX, 0, "supplies");
        supplies.setPosition(currentX + supplies.getContainerWidth() / 2, 0);
        currentX += supplies.getContainerWidth() + gap;

        results.setSize(results.getContainerWidth(), results.getContainerHeight());
        rent.setSize(rent.getContainerWidth(), rent.getContainerHeight());
        upgrades.setSize(upgrades.getContainerWidth(), upgrades.getContainerHeight());
        staff.setSize(staff.getContainerWidth(), staff.getContainerHeight());
        marketing.setSize(marketing.getContainerWidth(), marketing.getContainerHeight());
        recipe.setSize(recipe.getContainerWidth(), recipe.getContainerHeight());
        supplies.setSize(supplies.getContainerWidth(), supplies.getContainerHeight());

        results.setInteractive();
        rent.setInteractive();
        upgrades.setInteractive();
        staff.setInteractive();
        marketing.setInteractive();
        recipe.setInteractive();
        supplies.setInteractive();

        results.on("pointerdown", () => {
            this.emit("tabSelected", 0);
        });
        rent.on("pointerdown", () => {
            this.emit("tabSelected", 1);
        });
        upgrades.on("pointerdown", () => {
            this.emit("tabSelected", 2);
        });
        staff.on("pointerdown", () => {
            this.emit("tabSelected", 3);
        });
        marketing.on("pointerdown", () => {
            this.emit("tabSelected", 4);
        });
        recipe.on("pointerdown", () => {
            this.emit("tabSelected", 5);
        });
        supplies.on("pointerdown", () => {
            this.emit("tabSelected", 6);
        });

        this.add([results, rent, upgrades, staff, marketing, recipe, supplies]);

        scene.add.existing(this);
    }
}

class TabItem extends Phaser.GameObjects.Container {
    private text: Phaser.GameObjects.Text;
    private image: Phaser.GameObjects.Image;
    private background: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, itemKey: string) {
        super(scene, x, y);
        const { _text, _image } = this.getItemFromKey(itemKey);

        // Create text and image objects
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, _text, {
            fontFamily: "Arial",
            fontSize: "14px",
            color: "#ffffff",
        });
        this.image = new Phaser.GameObjects.Image(scene, 0, 0, _image);

        // Set origin to center for both text and image
        this.text.setOrigin(0.5, 0.5);
        this.image.setOrigin(0.5, 0.5);

        // Position the image above the text
        this.image.y = -this.text.height / 2 - 5; // Adjust the spacing as needed
        this.text.y = this.image.height / 2 + 5; // Adjust the spacing as needed

        const padding = 8;
        const backgroundWidth = Math.max(this.text.width, this.image.width) + padding * 2;
        const backgroundHeight = this.text.height + this.image.height + padding * 4;
        this.background = new Phaser.GameObjects.Rectangle(scene, 0, 0, backgroundWidth, backgroundHeight, 0x73cb21);

        // Add text and image to the container
        this.add([this.background, this.image, this.text]);
        scene.add.existing(this);
    }

    private getItemFromKey(itemKey: string) {
        switch (itemKey) {
            case "results":
                return { _text: "Results", _image: "results-32" };
            case "rent":
                return { _text: "Rent", _image: "rent-32" };
            case "upgrades":
                return { _text: "Upgrades", _image: "upgrades-32" };
            case "staff":
                return { _text: "Staff", _image: "staff-32" };
            case "marketing":
                return { _text: "Marketing", _image: "marketing-32" };
            case "recipe":
                return { _text: "Recipe", _image: "recipe-32" };
            case "supplies":
                return { _text: "Supplies", _image: "supplies-32" };
            default:
                return { _text: "", _image: "" };
        }
    }

    getContainerWidth() {
        return this.background.width;
    }

    getContainerHeight() {
        return this.background.height;
    }
}

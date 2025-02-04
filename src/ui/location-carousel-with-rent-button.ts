import { LOCATIONS_DATA } from "../data/locations";
import { RentedLocation } from "../models/location";
import { TextButton } from "./text-button";
import { TitleText } from "./title-text";

export class LocationCarouselWithRentButton extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private imageAreaTodo: Phaser.GameObjects.Rectangle;  // TODO: Image Button 이 필요하다.
    private description: Phaser.GameObjects.Text;
    private popularity: Phaser.GameObjects.Text;
    private satisfaction: Phaser.GameObjects.Text;
    private price: TitleText;
    private nextButton: TextButton;
    private previousButton: TextButton;
    private seekingLocationIndex: number;
    private background: Phaser.GameObjects.Rectangle;
    private rentButton: TextButton;

    constructor(scene: Phaser.Scene, x: number, y: number, rentedLocation: RentedLocation) {
        super(scene, x, y);

        this.seekingLocationIndex = 0;
        
        const backgroundWidth = 360;
        const backgroundHeight = 180;
        this.background = scene.add.rectangle(45, 0, backgroundWidth, backgroundHeight, 0x008229, 1);
        this.background.setOrigin(0, 0);

        this.previousButton = new TextButton(scene, 30, 30, "<");
        this.previousButton.setInteractive();
        this.previousButton.on("pointerdown", () => {
            this.seekingLocationIndex = (this.seekingLocationIndex - 1 + LOCATIONS_DATA.length) % LOCATIONS_DATA.length;
            this.updateUI(rentedLocation);
        });

        this.title = new Phaser.GameObjects.Text(scene, 225, 5, LOCATIONS_DATA[this.seekingLocationIndex].title, {
            color: "white",
            fontSize: "16px",
        });

        this.imageAreaTodo = new Phaser.GameObjects.Rectangle(scene, 50, 5, 170, 80);
        this.imageAreaTodo.setStrokeStyle(2, 0xffffff);
        this.imageAreaTodo.setOrigin(0, 0);

        this.description = new Phaser.GameObjects.Text(
            scene,
            225,
            35,
            LOCATIONS_DATA[this.seekingLocationIndex].shortDescription,
            {
                color: "white",
                fontSize: "12px",
            },
        );

        this.popularity = new Phaser.GameObjects.Text(
            scene,
            55,
            100,
            `Popularity: ${rentedLocation.getPopularity(this.seekingLocationIndex)}`,
            {
                color: "white",
                fontSize: "12px",
            },
        );

        this.satisfaction = new Phaser.GameObjects.Text(
            scene,
            55,
            150,
            `Satisfaction: ${rentedLocation.getSatisfaction(this.seekingLocationIndex)}`,
            {
                color: "white",
                fontSize: "12px",
            },
        );

        this.price = new TitleText(
            scene,
            245,
            130,
            `${LOCATIONS_DATA[this.seekingLocationIndex].price.toFixed(2)} $`,
        );

        this.nextButton = new TextButton(scene, 420, 30, ">");
        this.nextButton.setInteractive();
        this.nextButton.on("pointerdown", () => {
            this.seekingLocationIndex = (this.seekingLocationIndex + 1) % LOCATIONS_DATA.length;
            this.updateUI(rentedLocation);
        });

        this.rentButton = new TextButton(scene, 360, 240, "RENT", this.seekingLocationIndex === rentedLocation.getCurrentLocationKey());
        
        this.rentButton.setInteractive();
        this.rentButton.on("pointerdown", () => {
            rentedLocation.setCurrentLocationKey(this.seekingLocationIndex);
            this.updateRentButton(rentedLocation);
        });

        this.add([
            this.background,
            this.previousButton,
            this.imageAreaTodo,
            this.title,
            this.description,
            this.nextButton,
            this.popularity,
            this.satisfaction,
            this.price,
            this.rentButton,
        ]);
        scene.add.existing(this);
    }

    private updateUI (rentedLocation: RentedLocation) {
        this.title.setText(LOCATIONS_DATA[this.seekingLocationIndex].title);
        this.description.setText(LOCATIONS_DATA[this.seekingLocationIndex].shortDescription);
        this.popularity.setText(`Popularity: ${rentedLocation.getPopularity(this.seekingLocationIndex)}`);
        this.satisfaction.setText(`Satisfaction: ${rentedLocation.getSatisfaction(this.seekingLocationIndex)}`);
        this.price.setText(`${LOCATIONS_DATA[this.seekingLocationIndex].price.toFixed(2)} $`);
        this.updateRentButton(rentedLocation);
    }

    private updateRentButton (rentedLocation: RentedLocation) {
        this.rentButton.destroy();
        this.rentButton = new TextButton(this.scene, 360, 240, "RENT", this.seekingLocationIndex === rentedLocation.getCurrentLocationKey());
        this.rentButton.setInteractive();
        this.rentButton.on("pointerdown", () => {
            rentedLocation.setCurrentLocationKey(this.seekingLocationIndex);
            this.updateRentButton(rentedLocation);
        });
        this.add(this.rentButton);
    }
}

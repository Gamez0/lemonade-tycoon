import { Location } from "../models/location";
import { LocationCarouselWithRentButton } from "./location-carousel-with-rent-button";

export class RentContainer extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private description: Phaser.GameObjects.Text;
    private chosenLocation: Location;
    private locationWithRentButton: LocationCarouselWithRentButton;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        this.title = new Phaser.GameObjects.Text(scene, 0, 0, "Locations", {
            color: "white",
            fontSize: "24px",
        });
        this.description = new Phaser.GameObjects.Text(scene, 0, 30, "Choose a location", {
            color: "white",
            fontSize: "16px",
        });

        this.locationWithRentButton = new LocationCarouselWithRentButton(scene, 0, 90);

        this.add([this.title, this.description, this.locationWithRentButton]);

        scene.add.existing(this);
    }

    getChosenLocation = (): Location => {
        return this.chosenLocation;
    };
}

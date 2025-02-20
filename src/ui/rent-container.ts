import { RentedLocation } from "../models/location";
import { LocationCarouselWithRentButton } from "./location-carousel-with-rent-button";
import { TitleText } from "./title-text";

export class RentContainer extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private description: Phaser.GameObjects.Text;
    private locationWithRentButton: LocationCarouselWithRentButton;

    constructor(scene: Phaser.Scene, x: number, y: number, rentedLocation: RentedLocation) {
        super(scene, x, y);

        this.title = new TitleText(scene, 0, 0, "Locations");
        this.description = new Phaser.GameObjects.Text(scene, 0, 30, "Choose a location", {
            color: "white",
            fontSize: "16px",
        });

        this.locationWithRentButton = new LocationCarouselWithRentButton(scene, 0, 90, rentedLocation);

        this.add([this.title, this.description, this.locationWithRentButton]);

        scene.add.existing(this);
    }
}

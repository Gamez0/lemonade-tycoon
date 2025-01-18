import { Location } from "../models/location";
import { TextButton } from "./text-button";

export class RentContainer extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private description: Phaser.GameObjects.Text;
    private nextButton: TextButton; // TODO: Image Button 이 필요하다.
    private previousButton: TextButton;
    private rentButton: TextButton;
    private locations: Location[];
    private currentLocationIndex: number;
    private chosenLocation: Location;

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

        this.nextButton = new TextButton(scene, 100, 60, "Next");
        this.nextButton.setInteractive();
        this.nextButton.on("pointerdown", () => {
            this.emit("next");
        });

        this.previousButton = new TextButton(scene, 0, 60, "Previous");
        this.previousButton.setInteractive();
        this.previousButton.on("pointerdown", () => {
            this.emit("previous");
        });

        this.rentButton = new TextButton(scene, 100, 150, "Rent");
        this.rentButton.setInteractive();
        this.rentButton.on("pointerdown", () => {
            // TODO: set the chosen location
        });

        // load locations
        const suburb = new Location(
            "The Suburbs",
            "Kids love lemonade!",
            "Is there a better place to start your Lemonade empire than your very own neighborhood? Don't expect a lot of customeres here, but the free rent and popularity bonus will help you test...",
            0,
            0,
            0,
        );
        const park = new Location(
            "The Park",
            "Kids love lemonade!",
            "With a decent customer base and a fairly cheap daily rent, the park is a nice place to start expanding your business. Kids just can't resist a cool glass of lemonade, so long as you keep...",
            10,
            0,
            0,
        );

        this.locations = [suburb, park];
        this.currentLocationIndex = 0;

        this.add([this.title, this.description, this.nextButton, this.previousButton, this.rentButton]);

        scene.add.existing(this);
    }

    getChoosenLocation = (): Location => {
        return this.chosenLocation;
    };
}

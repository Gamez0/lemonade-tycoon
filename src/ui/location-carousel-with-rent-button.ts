import { Location } from "../models/location";
import { TextButton } from "./text-button";

const suburb = new Location(
    "The Suburbs",
    "Your very own \nneighborhood!",
    "Is there a better place to start your Lemonade empire than your very own neighborhood? Don't expect a lot of customers here, but the free rent and popularity bonus will help you test the ups and downs of the business without too much risk.",
    0,
    0,
    0,
);
const park = new Location(
    "The Park",
    "Kids love lemonade!",
    "With a decent customer base and a fairly cheap daily rent, the park is a nice place to start expanding your business. Kids just can't resist a cool glass of lemonade, so long as you keep the price in their range.",
    10,
    0,
    0,
);

const downTown = new Location(
    "Downtown",
    "Now it's time to get serious",
    "Lots of customers with money to spend means you can hit the big bucks in the downtown area... just make sure you have the proper equipment: businessmen with their busy schedules simply hate waiting in line.",
    30,
    0,
    0,
);

const locations = [suburb, park, downTown];

export class LocationCarouselWithRentButton extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private description: Phaser.GameObjects.Text;
    private popularity: Phaser.GameObjects.Text;
    private satisfaction: Phaser.GameObjects.Text;
    private price: Phaser.GameObjects.Text;
    private nextButton: TextButton; // TODO: Image Button 이 필요하다.
    private previousButton: TextButton;
    private seekingLocationIndex: number;
    private locations: Location[];

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        this.locations = locations;
        this.seekingLocationIndex = 0;

        this.previousButton = new TextButton(scene, 0, 0, "<");
        this.previousButton.setInteractive();
        this.previousButton.on("pointerdown", () => {
            this.seekingLocationIndex = (this.seekingLocationIndex - 1 + this.locations.length) % this.locations.length;
            // update UI
            this.title.setText(this.locations[this.seekingLocationIndex].getName());
            this.description.setText(this.locations[this.seekingLocationIndex].getShortDescription());
            this.popularity.setText(`Popularity: ${this.locations[this.seekingLocationIndex].getPopularity()}`);
            this.satisfaction.setText(`Satisfaction: ${this.locations[this.seekingLocationIndex].getSatisfaction()}`);
            this.price.setText(`${this.locations[this.seekingLocationIndex].getPrice().toFixed(2)} $`);
        });

        this.title = new Phaser.GameObjects.Text(scene, 200, 0, this.locations[this.seekingLocationIndex].getName(), {
            color: "white",
            fontSize: "16px",
        });

        this.description = new Phaser.GameObjects.Text(
            scene,
            200,
            30,
            this.locations[this.seekingLocationIndex].getShortDescription(),
            {
                color: "white",
                fontSize: "12px",
            },
        );

        this.popularity = new Phaser.GameObjects.Text(
            scene,
            30,
            60,
            `Popularity: ${this.locations[this.seekingLocationIndex].getPopularity()}`,
            {
                color: "white",
                fontSize: "16px",
            },
        );

        this.satisfaction = new Phaser.GameObjects.Text(
            scene,
            30,
            90,
            `Satisfaction: ${this.locations[this.seekingLocationIndex].getSatisfaction()}`,
            {
                color: "white",
                fontSize: "16px",
            },
        );

        this.price = new Phaser.GameObjects.Text(
            scene,
            200,
            80,
            `${this.locations[this.seekingLocationIndex].getPrice().toFixed(2)} $`,
            {
                color: "white",
                fontSize: "24px",
            },
        );

        this.nextButton = new TextButton(scene, 400, 0, ">");
        this.nextButton.setInteractive();
        this.nextButton.on("pointerdown", () => {
            this.seekingLocationIndex = (this.seekingLocationIndex + 1) % this.locations.length;
            // update UI
            this.title.setText(this.locations[this.seekingLocationIndex].getName());
            this.description.setText(this.locations[this.seekingLocationIndex].getShortDescription());
            this.popularity.setText(`Popularity: ${this.locations[this.seekingLocationIndex].getPopularity()}`);
            this.satisfaction.setText(`Satisfaction: ${this.locations[this.seekingLocationIndex].getSatisfaction()}`);
            this.price.setText(`${this.locations[this.seekingLocationIndex].getPrice().toFixed(2)} $`);
        });

        this.add([
            this.previousButton,
            this.title,
            this.description,
            this.nextButton,
            this.popularity,
            this.satisfaction,
            this.price,
        ]);
        scene.add.existing(this);
    }
}

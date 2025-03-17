import { LOCATIONS_DATA } from "../data/locations";
import { RentedLocation } from "../models/location";
import { TitleText } from "./title-text";

const paddingLeft = 12;

export default class MapContainer extends Phaser.GameObjects.Container {
    locationTitleText: Phaser.GameObjects.Text;
    locationDetailText: Phaser.GameObjects.Text;
    locationPopularityText: Phaser.GameObjects.Text;
    locationSatisfactionText: Phaser.GameObjects.Text;
    location: RentedLocation;
    background: Phaser.GameObjects.Rectangle;
    map: Phaser.Tilemaps.Tilemap;
    tileset: Phaser.Tilemaps.Tileset | null;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        map: Phaser.Tilemaps.Tilemap,
        tileset: Phaser.Tilemaps.Tileset | null,
        location: RentedLocation
    ) {
        super(scene, x, y);
        this.map = map;
        this.tileset = tileset;
        this.location = location;
        const locationKey = this.location.getCurrentLocationKey();
        const { title, description } = LOCATIONS_DATA[locationKey];

        this.locationTitleText = new TitleText(scene, paddingLeft, 384 + 12, title);

        this.locationDetailText = new Phaser.GameObjects.Text(scene, paddingLeft, 384 + 40, description, {
            fontSize: "12px",
        });

        const popularity = this.location.getPopularity(locationKey);
        const satisfaction = this.location.getSatisfaction(locationKey);
        this.locationPopularityText = new Phaser.GameObjects.Text(
            scene,
            paddingLeft,
            384 + 120,
            `Popularity: ${popularity}`,
            {
                fontSize: "12px",
            }
        );

        this.locationSatisfactionText = new Phaser.GameObjects.Text(
            scene,
            paddingLeft + 192,
            384 + 120,
            `Satisfaction: ${satisfaction}`,
            {
                fontSize: "12px",
            }
        );

        this.location.on("locationChanged", (locationKey: number) => {
            const { title, description } = LOCATIONS_DATA[locationKey];
            this.locationTitleText.setText(title);
            this.locationDetailText.setText(description);
            const popularity = this.location.getPopularity(locationKey);
            const satisfaction = this.location.getSatisfaction(locationKey);
            this.locationPopularityText.setText(`Popularity: ${popularity}`);
            this.locationSatisfactionText.setText(`Satisfaction: ${satisfaction}`);
        });
        this.background = scene.add.rectangle(0, 0, 488, 384 + 160, 0x008229, 1);
        this.background.setOrigin(0, 0);

        this.add([
            this.background,
            this.locationTitleText,
            this.locationDetailText,
            this.locationPopularityText,
            this.locationSatisfactionText,
        ]);
        scene.add.existing(this);

        scene.events.on("shutdown", this.onSceneShutdown, this);

        this.loadMap();
    }

    private onSceneShutdown() {
        this.location.off("locationChanged");
    }

    loadMap() {
        if (this.tileset) {
            const mapX = 516;
            const mapY = 198;
            this.map.createLayer("Tile Layer 1", this.tileset)?.setPosition(mapX, mapY);
            this.map.createLayer("Tile Layer 2", this.tileset)?.setPosition(mapX, mapY);
            this.map.createLayer("Tile Layer 3", this.tileset)?.setPosition(mapX, mapY);
        } else {
            console.error("Failed to load tileset");
        }
    }
}

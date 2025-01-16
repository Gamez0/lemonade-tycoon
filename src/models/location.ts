export class Location extends Phaser.Events.EventEmitter {
  private name: string;
  private shortDescription: string;
  private description: string;
  private price: number;
  private popularity: number;
  private satisfaction: number;

  constructor(
    name: string,
    shortDescription: string,
    description: string,
    price: number,
    popularity: number,
    satisfaction: number
  ) {
    super();
    this.name = name;
    this.shortDescription = shortDescription;
    this.description = description;
    this.price = price;
    this.popularity = popularity;
    this.satisfaction = satisfaction;
  }

  // get and set methods
  getName = (): string => {
    return this.name;
  };

  getShortDescription = (): string => {
    return this.shortDescription;
  };

  getDescription = (): string => {
    return this.description;
  };

  getPrice = (): number => {
    return this.price;
  };

  getPopularity = (): number => {
    return this.popularity;
  };

  getSatisfaction = (): number => {
    return this.satisfaction;
  };

  setName = (value: string) => {
    this.name = value;
    this.emit('change', this.name);
  };

  setShortDescription = (value: string) => {
    this.shortDescription = value;
    this.emit('change', this.shortDescription);
  };

  setDescription = (value: string) => {
    this.description = value;
    this.emit('change', this.description);
  };

  setPrice = (value: number) => {
    this.price = value;
    this.emit('change', this.price);
  };

  setPopularity = (value: number) => {
    this.popularity = value;
    this.emit('change', this.popularity);
  };

  setSatisfaction = (value: number) => {
    this.satisfaction = value;
    this.emit('change', this.satisfaction);
  };
}

export interface LocationData {
    title: string;
    shortDescription: string;
    description: string;
    price: number; // idea: event에 따라 가격이 변하면 좋을 듯.
}

const SUBURB: LocationData = {
    title: "The Suburbs",
    shortDescription: "Your very own \nneighborhood!",
    description:
        "Is there a better place to start your Lemonade empire than \nyour very own neighborhood? Don't expect a lot of customers \nhere, but the free rent and popularity bonus will help you \ntest the ups and downs of the business without too much risk.",
    price: 0,
};

const PARK: LocationData = {
    title: "The Park",
    shortDescription: "Kids love lemonade!",
    description:
        "With a decent customer base and a fairly cheap daily rent, \nthe park is a nice place to start expanding your business. \nKids just can't resist a cool glass of lemonade, so long as you \nkeep the price in their range.",
    price: 10,
};

const DOWNTOWN: LocationData = {
    title: "Downtown",
    shortDescription: "Now it's time to get \nserious",
    description:
        "Lots of customers with money to spend means you can hit the \nbig bucks in the downtown area... just make sure you have \nthe proper equipment: businessmen with their busy schedules \nsimply hate waiting in line.",
    price: 30,
};

export const LOCATIONS_DATA = [SUBURB, PARK, DOWNTOWN];

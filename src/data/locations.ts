export interface LocationData {
  title: string;
  shortDescription: string;
  description: string;
  price: number; // idea: event에 따라 가격이 변하면 좋을 듯.
}

const SUBURB:LocationData = 
{  title: "The Suburbs",
  shortDescription: "Your very own \nneighborhood!",
  description: "Is there a better place to start your Lemonade empire than your very own neighborhood? Don't expect a lot of customers here, but the free rent and popularity bonus will help you test the ups and downs of the business without too much risk.",
  price: 0,
}

const PARK:LocationData = {
  title: "The Park",
  shortDescription: "Kids love lemonade!",
  description: "With a decent customer base and a fairly cheap daily rent, the park is a nice place to start expanding your business. Kids just can't resist a cool glass of lemonade, so long as you keep the price in their range.",
  price: 10,
}

const DOWNTOWN:LocationData = {
  title: "Downtown",
  shortDescription: "Now it's time to get serious",
  description: "Lots of customers with money to spend means you can hit the big bucks in the downtown area... just make sure you have the proper equipment: businessmen with their busy schedules simply hate waiting in line.",
  price: 30,
}

export const LOCATIONS_DATA = [SUBURB, PARK, DOWNTOWN];
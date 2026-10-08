const { newGame, buy, setPlan, openDay, nextDay } = require('../../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../../.test-build/simulation/street-day.js');
function stock(state, price = 175) {
    const ice = state.weather.temperature >= 30 ? 4 : state.weather.temperature >= 25 ? 3 : state.weather.temperature >= 21 ? 2 : 1;
    state = setPlan(state, { price, recipe: { lemon: 2, sugar: 1, ice } });
    for (const [key, target] of [['lemon', 40], ['sugar', 20], ['ice', 320], ['cup', 80]])
        if (state.stock[key] < target) state = buy(state, key, target - state.stock[key]);
    return state;
}
function campaign(seed = 2026, days = 8) {
    let state = newGame(seed); const history = [];
    for (let i = 0; i < days; i++) {
        const done = finishStreetDay(beginStreetDay(openDay(stock(state)))).day.game;
        history.push(done); state = nextDay(done);
    }
    return { state, history };
}
module.exports = { stock, campaign };

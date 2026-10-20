const { newGame, openDay, nextDay, reserveLocation } = require('../../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../../.test-build/simulation/street-day.js');
const { stock } = require('./business.cjs');
// Funded opening is an isolated test fixture, never a product starting balance.
exports.fundedStandBusiness = location => {
    let state = { ...newGame(), cash: 2000000, openingCash: 2000000 }; const history = [];
    for (let i = 0; i < 8 + Number(location !== 'neighborhood'); i++) {
        state = stock(state);
        if (i === 8) state = reserveLocation(state, location);
        const done = finishStreetDay(beginStreetDay(openDay(state))).day.game;
        history.push(done); state = nextDay(done);
    }
    return { state: stock(state), history };
};

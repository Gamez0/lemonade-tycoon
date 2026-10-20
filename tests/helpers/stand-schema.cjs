const { defaultLocationStats } = require('../../.test-build/content/locations.js');
// Preserve historical fixtures while filling neutral fields added by v8 and v9.
exports.withBasicStand = state => ({ ...state,
    locationStats: { ...defaultLocationStats(), ...state.locationStats },
    management: { ...state.management, upgrades: { ...state.management.upgrades, stand: 0 } } });

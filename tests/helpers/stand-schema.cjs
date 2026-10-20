// Historical fixtures stay unchanged; v8 adds only a Basic Stand default to them.
exports.withBasicStand = state => ({ ...state, management: { ...state.management,
    upgrades: { ...state.management.upgrades, stand: 0 } } });

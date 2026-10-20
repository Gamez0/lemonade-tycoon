const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MAP_LAYOUTS, mapPosition, queueProgress } = require('../.test-build/content/map-layouts.js');
const inside = ([x, y]) => x >= 0 && x <= 300 && y >= 0 && y <= 240;

test('ten map layouts have continuous entrances, stable reachable service points and off-frame exits', () => {
    assert.equal(Object.keys(MAP_LAYOUTS).length, 10);
    for (const [id, layout] of Object.entries(MAP_LAYOUTS)) {
        assert.ok(inside(layout.ground), id + ' stand ground');
        const service = mapPosition(id, 286);
        assert.ok(inside(service), id + ' service');
        assert.ok(Math.hypot(service[0] - layout.ground[0], service[1] - layout.ground[1]) < 45, id + ' counter reach');
        assert.ok(service[1] > layout.ground[1], id + ' customers stand in front of the counter');
        assert.equal(Math.sign(service[0] - layout.ground[0]), layout.facing === 'left' ? -1 : 1, id + ' counter faces its customers');
        assert.ok(!inside(mapPosition(id, -20)), id + ' entry');
        assert.ok(!inside(mapPosition(id, 680)), id + ' exit');
        for (let i = 1; i < layout.route.length; i++) {
            const at = layout.route[i][0]; assert.ok(at > layout.route[i - 1][0]);
            const before = mapPosition(id, at - 0.000001), after = mapPosition(id, at + 0.000001);
            assert.ok(Math.hypot(after[0] - before[0], after[1] - before[1]) < 0.001, id + ' continuous turn');
        }
    }
});

test('neighborhood through traffic follows the upper sidewalk without a crossing U-turn', () => {
    let previous = -Infinity;
    for (let at = -20; at <= 680; at++) {
        const [x, y] = mapPosition('neighborhood', at);
        assert.ok(x >= previous, 'no reversed travel along the street'); previous = x;
        // Observed upper sidewalk band, away from the branch and foreground lot.
        assert.ok(Math.abs(y - (x * .62 + 10)) < 4, 'upper sidewalk clearance');
    }
});

test('downtown pedestrians avoid the lawn interior and foreground office footprint', () => {
    for (let at = -20; at <= 680; at++) {
        const [x, y] = mapPosition('downtown', at);
        assert.ok(!(x >= 135 && x <= 195 && y >= 125 && y <= 165), 'lawn interior');
        assert.ok(!(x >= 240 && y >= 180), 'foreground building');
    }
});

test('marina walkers remain on the promenade and mall walkers avoid the escalator opening', () => {
    for (let at = -20; at <= 680; at++) {
        const [x, y] = mapPosition('marina', at);
        if (x >= 0 && x <= 300) {
            assert.ok(y > 135 - .3 * x, 'clear of promenade planters and benches');
            assert.ok(y < 175 - .3 * x, 'clear of water and railing');
        }
        const [mx, my] = mapPosition('mall', at);
        assert.ok(!(mx > 130 && mx < 210 && my > 90 && my < 165), 'escalator opening');
    }
});

test('queue footprints remain separate on maps with different path lengths', () => {
    for (const id of Object.keys(MAP_LAYOUTS)) {
        let previous = mapPosition(id, 286);
        for (let index = 0; index < 6; index++) {
            const next = mapPosition(id, queueProgress(id, index));
            assert.ok(Math.hypot(next[0] - previous[0], next[1] - previous[1]) >= 14, id + ' customer footprint spacing');
            previous = next;
        }
    }
});

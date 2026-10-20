const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MAP_LAYOUTS, mapPosition } = require('../.test-build/content/map-layouts.js');
const inside = ([x, y]) => x >= 0 && x <= 300 && y >= 0 && y <= 240;

test('ten map layouts have continuous entrances, stable reachable service points and off-frame exits', () => {
    assert.equal(Object.keys(MAP_LAYOUTS).length, 10);
    for (const [id, layout] of Object.entries(MAP_LAYOUTS)) {
        assert.ok(inside(layout.ground), id + ' stand ground');
        const service = mapPosition(id, 286);
        assert.ok(inside(service), id + ' service');
        assert.ok(Math.hypot(service[0] - layout.ground[0], service[1] - layout.ground[1]) < 45, id + ' counter reach');
        assert.ok(!inside(mapPosition(id, -20)), id + ' entry');
        assert.ok(!inside(mapPosition(id, 680)), id + ' exit');
        for (let i = 1; i < layout.route.length; i++) {
            const at = layout.route[i][0]; assert.ok(at > layout.route[i - 1][0]);
            const before = mapPosition(id, at - 0.000001), after = mapPosition(id, at + 0.000001);
            assert.ok(Math.hypot(after[0] - before[0], after[1] - before[1]) < 0.001, id + ' continuous turn');
        }
    }
});

test('neighborhood pedestrians cross the branch only at its crossing and avoid the foreground roof', () => {
    for (let at = -20; at <= 680; at++) {
        const [x, y] = mapPosition('neighborhood', at);
        // Inset asphalt band observed on the selected painted background,
        // deliberately independent of route control-point coordinates.
        const onBranchAsphalt = y > 229 - x * 0.58 && y < 269 - x * 0.58;
        if (onBranchAsphalt) assert.ok(at >= 333 && at <= 420, 'crossing segment');
        assert.ok(!(x >= 200 && y >= 170), 'foreground building clearance');
    }
});

test('downtown pedestrians avoid the lawn interior and foreground office footprint', () => {
    for (let at = -20; at <= 680; at++) {
        const [x, y] = mapPosition('downtown', at);
        assert.ok(!(x >= 135 && x <= 195 && y >= 125 && y <= 165), 'lawn interior');
        assert.ok(!(x >= 240 && y >= 180), 'foreground building');
    }
});

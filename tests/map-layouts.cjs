const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MAP_LAYOUTS, mapPosition, queueProgress } = require('../.test-build/content/map-layouts.js');
const inside = ([x, y]) => x >= 0 && x <= 300 && y >= 0 && y <= 240;
const { vectorFacing, routeFacing, customerAppearance } = require('../.test-build/content/customer-facing.js');

test('customer facing follows actual route purpose, reversed queue travel and stand position', () => {
    assert.equal(routeFacing('neighborhood', 100, 'through', 1), 'se');
    assert.equal(routeFacing('neighborhood', 100, 'service', 1), 'ne');
    assert.equal(routeFacing('neighborhood', 500, 'depart', 1), 'sw');
    assert.equal(routeFacing('train-station', 500, 'depart', 1), 'ne');
    assert.equal(routeFacing('magic-gardens', 500, 'depart', 1), 'sw');
    for (const [id, layout] of Object.entries(MAP_LAYOUTS)) {
        for (const purpose of ['service', 'through', 'depart']) {
            for (let progress = 0; progress <= 660; progress += 10) {
                const a = mapPosition(id, progress, purpose), b = mapPosition(id, progress + 1, purpose);
                const facing = routeFacing(id, progress, purpose, 1);
                assert.equal(facing.endsWith('w'), b[0] < a[0], id + ' horizontal tangent');
                assert.equal(facing.startsWith('n'), b[1] < a[1], id + ' vertical tangent');
                const reversed = routeFacing(id, progress + 1, purpose, -1);
                assert.notEqual(reversed.endsWith('w'), facing.endsWith('w'), id + ' reverse queue travel');
            }
        }
        const customer = mapPosition(id, 286);
        const facing = vectorFacing(layout.ground[0] - customer[0], layout.ground[1] - customer[1]);
        assert.equal(facing.startsWith('n'), true, id + ' look towards counter');
        assert.equal(facing.endsWith('w'), layout.facing === 'right', id + ' counter side');
    }
});

test('stationary axes preserve facing and reduced motion preserves rear views and purchased cups', () => {
    for (const facing of ['se', 'ne', 'nw', 'sw']) {
        assert.equal(vectorFacing(0, 0, facing), facing);
        assert.equal(vectorFacing(0.001, -0.001, facing), facing);
        assert.equal(customerAppearance(facing, 'walk', 1, false).flipX, facing.endsWith('w'));
    }
    assert.deepEqual(customerAppearance('nw', 'walk', 1, false), { pose: 'rear-walk-1', flipX: true });
    assert.deepEqual(customerAppearance('ne', 'cup', 3, false), { pose: 'rear-cup-3', flipX: false });
    assert.deepEqual(customerAppearance('nw', 'walk', 1, true), { pose: 'rear-idle-0', flipX: true });
    assert.deepEqual(customerAppearance('ne', 'cup', 3, true), { pose: 'rear-cup-4', flipX: false });
    assert.deepEqual(customerAppearance('sw', 'cup', 3, true), { pose: 'front-cup-4', flipX: true });
    assert.deepEqual(customerAppearance('nw', 'order', 2, true), { pose: 'rear-order-0', flipX: true });
});

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

test('counter diagonals match the two observed original stand projection families', () => {
    for (const id of ['neighborhood', 'park', 'old-square', 'mall', 'marina']) assert.equal(MAP_LAYOUTS[id].facing, 'right', id);
    for (const id of ['downtown', 'beach', 'train-station', 'stadium', 'magic-gardens']) assert.equal(MAP_LAYOUTS[id].facing, 'left', id);
});

test('neighborhood buyers leave from the counter along its sidewalk rather than following through traffic', () => {
    assert.deepEqual(mapPosition('neighborhood', 286, 'depart'), mapPosition('neighborhood', 286));
    for (let at = 286; at <= 680; at++) {
        const [x, y] = mapPosition('neighborhood', at, 'depart');
        assert.ok(y < 229 - .58 * x, 'clear of branch asphalt');
        assert.ok(y > 215 - .62 * x, 'near-side sidewalk');
    }
    assert.notDeepEqual(mapPosition('neighborhood', 500, 'through'), mapPosition('neighborhood', 500, 'depart'));
});

test('neighborhood through traffic follows the upper sidewalk without a crossing U-turn', () => {
    let previous = -Infinity;
    for (let at = -20; at <= 680; at++) {
        const [x, y] = mapPosition('neighborhood', at, 'through');
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
            assert.ok(y > 110 - .3 * x, 'clear of promenade planters');
            assert.ok(y < 145 - .3 * x, 'clear of water and railing');
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

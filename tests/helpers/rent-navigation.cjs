// Use the same visible cards and controls as a player, including hidden pages.
exports.selectLocation = async (page, id) => {
    const target = page.locator(`button[data-location="${id}"]`);
    for (let step = 0; step < 10; step++) {
        if (await target.isVisible()) { await target.click(); return; }
        await page.locator('#rent-next').click();
    }
    throw Error('Location was not reachable through Rent navigation: ' + id);
};

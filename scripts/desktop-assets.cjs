// Both build-directory and shipped-ASAR audits use this exact asset boundary.
function isDesktopAsset(file) {
    return /^assets\/[^/]+\.(js|css|ttf)$/.test(file)
        || /^assets\/neighborhood-(?:house-left|cottage|tree|hedge)-[\w-]+\.png$/.test(file)
        || /^assets\/stand-(?:basic|classic|lemon|castle)-[\w-]+\.png$/.test(file)
        || /^assets\/staff-(?:owner|server|host)-v1-[\w-]+\.png$/.test(file)
        || /^assets\/equipment-(?:refrigerator|ice-maker|blender)-v1-[\w-]+\.png$/.test(file)
        || /^assets\/map-(?:neighborhood|park|downtown|beach|old-square|train-station|mall|marina|stadium|magic-gardens)-[\w-]+\.png$/.test(file);
}
module.exports = { isDesktopAsset };

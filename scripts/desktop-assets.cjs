// Both build-directory and shipped-ASAR audits use this exact asset boundary.
function isDesktopAsset(file) {
    return /^assets\/[^/]+\.(js|css|ttf)$/.test(file)
        || /^assets\/neighborhood-(?:house-left|cottage|tree|hedge)-[\w-]+\.png$/.test(file);
}
module.exports = { isDesktopAsset };

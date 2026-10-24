// Original outlined inventory icons shared by the stock strip and controls.
const drawings = {
    stand: '<path fill="#f0d64d" d="M4 13h18v10H4Z"/><path fill="#68985a" d="m2 11 4-8h14l4 8Z"/><path fill="#fff2a1" d="M5 11h16v3H5Z"/><path fill="none" d="M5 5v8m16-8v8M8 16h10m-5-1v8"/>',
    refrigerator: '<path fill="#d4e4d6" d="M5 2h16v22H5Z"/><path fill="#f7f7da" d="M7 4h12v7H7Zm0 9h12v9H7Z"/><path fill="none" d="M5 12h16M9 6v3m0 6v4"/><path fill="#587b64" d="M6 24h3v1H6Zm11 0h3v1h-3Z"/>',
    iceMaker: '<path fill="#a6c7ca" d="M3 3h20v21H3Z"/><path fill="#e9f3db" d="M5 5h16v5H5Z"/><path fill="#31575b" d="M6 12h14v9H6Z"/><path fill="#9edfea" d="m9 14 4-2 4 2v5l-4 2-4-2Z"/><path fill="#f4ffff" d="m9 14 4 2 4-2-4-2Z"/><path fill="#70a534" d="M18 6h2v2h-2Z"/>',
    blender: '<path fill="#d5e8d6" d="M6 3h14l-2 13H8Z"/><path fill="#f5dc43" d="m8 9 10 0-1 6H9Z"/><path fill="none" stroke-width="2" d="M20 6h3v7h-4"/><path fill="#dceac4" d="M6 1h14v3H6Z"/><path fill="#8fa68b" d="M8 17h10l3 7H5Z"/><path fill="#e64933" d="M12 20h3v2h-3Z"/>',
    owner: '<path fill="#e7c39b" d="M8 4h10v10H8Z"/><path fill="#865a34" d="M7 3h12v4H7Z"/><path fill="#e7d948" d="m7 15 6-2 6 2 3 10H4Z"/><path fill="#fff3bd" d="M9 17h8v8H9Z"/><path fill="none" d="M10 8v2m6-2v2m-6 2h6"/>',
    server: '<path fill="#ba835e" d="M8 4h10v10H8Z"/><path fill="#403e35" d="M7 2h12v5H7Z"/><path fill="#dfecda" d="m7 15 6-2 6 2 3 10H4Z"/><path fill="#3a7184" d="m11 15 2 2 2-2-1 9h-2Z"/><path fill="none" d="M10 8v2m6-2v2m-6 2h6"/>',
    host: '<path fill="#e4b98d" d="M8 4h10v10H8Z"/><path fill="#98563c" d="M7 2h12v5H7Zm0 4h2v9H6Zm10 0h2l1 9h-3Z"/><path fill="#6a9d68" d="m7 15 6-2 6 2 3 10H4Z"/><path fill="#fff0ac" d="m9 15 4 4 4-4-4 1Z"/><path fill="none" d="M10 8v2m6-2v2m-6 2h6"/>',
    rent: '<path fill="#eddaa4" d="M3 11 13 3l10 8v12H3Z"/><path fill="#bd8955" d="m1 11 12-10 12 10-3 2-9-7-9 7Z"/><path fill="#70a2aa" d="M6 13h5v5H6Zm9 0h5v5h-5Z"/><path fill="#805d40" d="M11 18h4v5h-4Z"/>',
    sunny: '<path fill="none" stroke="#f7dc56" stroke-width="2" d="M13 1v4m0 16v4M1 13h4m16 0h4M4 4l3 3m12 12 3 3M4 22l3-3M19 7l3-3"/><circle fill="#f2c332" cx="13" cy="13" r="7"/><path fill="none" stroke="#fff19a" d="M8 13a5 5 0 0 1 5-5"/>',
    cloudy: '<path fill="#bccfca" d="M4 20C0 19 1 13 5 12c-1-6 7-9 11-4 5-2 9 2 8 6 4 5-1 8-4 7Z"/><path fill="#f5f3d9" stroke="none" d="M3 16c0-2 2-3 5-2-3-7 5-9 8-4 5-2 7 1 6 4-5-2-7 2-10 2Z"/>',
    rainy: '<path fill="#a6b8c0" d="M4 15C0 14 1 8 5 8c0-6 8-7 11-3 6-2 10 6 6 9Z"/><path fill="#d9e5dc" stroke="none" d="M4 10c1-2 3-1 4-1 0-5 5-6 8-2 3-1 5 0 6 3Z"/><path fill="none" stroke="#9bddf0" stroke-width="2" d="m7 17-2 5m9-5-2 5m9-5-2 5"/>',
    happy: '<path fill="#f7f1c9" d="M2 3h22v16H12l-5 5v-5H2Z"/><path fill="none" d="M7 8v2m11-2v2M7 12q6 7 12 0"/>',
    unhappy: '<path fill="#f7f1c9" d="M2 3h22v16H12l-5 5v-5H2Z"/><path fill="none" d="M7 8v2m11-2v2M7 16q6-7 12 0"/>',
    expensive:
        '<path fill="#f7f1c9" d="M2 3h22v16H12l-5 5v-5H2Z"/><path fill="none" d="M17 7h-7l-2 3 9 3-2 3H8m5-11v13"/>',
    passing:
        '<path fill="#f7f1c9" d="M2 3h22v16H12l-5 5v-5H2Z"/><path fill="none" stroke-width="2" d="M6 10h13m-5-4 5 4-5 4"/>',
    empty: '<path fill="#f7f1c9" d="M2 3h22v16H12l-5 5v-5H2Z"/><path fill="none" d="m9 6 1 9h6l1-9ZM8 6h10m-7 3h4"/>',
    clock: '<circle fill="#f6f1d1" cx="13" cy="13" r="10"/><path fill="none" stroke-width="2" d="M13 5v8l5 3"/>',
    calendar:
        '<path fill="#faf0c5" d="M4 4h18v19H4Z"/><path fill="#397aad" d="M4 4h18v5H4Z"/><path fill="none" stroke-width="2" d="M8 1v6m10-6v6m-7 6 3-2v9"/>',
    lemon: '<path fill="#e4bd27" d="M2 16C0 13 3 7 7 6c4-4 10-3 13 0l1 3-2 2c-1 6-8 11-13 9Z"/><path fill="#fff17b" stroke="none" d="M4 13c0-4 5-7 10-7-5 2-7 5-7 9Z"/><path fill="#4e9438" d="m12 5 3-4 7 1-5 4Z"/><path fill="#e8b832" d="m11 20 12-9c4 7 1 13-7 14Z"/><path fill="#fff29a" d="m13 20 9-7c2 5 0 9-6 10Z"/><path fill="none" stroke="#d4aa39" stroke-width=".7" d="m16 21 5-5m-4 6 5-3m-7 1 3-5"/>',
    sugar: '<path fill="#c4d0ca" d="M18 7h7v3h-7Z"/><path fill="#f5f5e6" d="M10 7h10v11q-5 4-10 0Z"/><path fill="#b5c5bd" stroke="none" d="M17 9h3v9l-3 1Z"/><ellipse fill="#fcfbea" cx="15" cy="7" rx="5" ry="2.5"/><path fill="none" stroke="#b0bab0" stroke-width=".7" d="m12 7 1-1m2 2 1-1m1 0 1-1"/><path fill="#fffce6" d="m1 23 6-5 7 5-6 2Z"/><path fill="none" stroke="#c5ccbe" stroke-width=".7" d="m4 23 3-2m0 3 3-1"/>',
    ice: '<path fill="#91dbe6" d="m2 11 7-4 7 4v8l-7 4-7-4Z"/><path fill="#e5ffff" d="m2 11 7 3 7-3-7-4Z"/><path fill="#63acdb" d="m9 14 7-3v8l-7 4Z"/><path fill="#b7ebf1" d="m12 4 6-3 5 3v7l-6 3-5-3Z"/><path fill="#efffff" d="m12 4 5 3 6-3-5-3Z"/>',
    cup: '<path fill="#d6ddca" d="M3 4h8l-1 18H4Z"/><path fill="#fffdea" stroke="none" d="M4 6h3v15H5Z"/><ellipse fill="#fffdeb" cx="7" cy="4" rx="4" ry="1.6"/><path fill="none" stroke="#8da38b" stroke-width=".7" d="M3.5 7q3.5 2 7 0M4 10q3 2 6 0M4 13q3 2 6 0M4 16q3 2 6 0M4.5 19q2.5 2 5 0"/><path fill="#d6ddca" d="M15 13h8l-1 11h-6Z"/><path fill="#fffdea" stroke="none" d="M16 15h3v8h-2Z"/><ellipse fill="#fffdeb" cx="19" cy="13" rx="4" ry="1.6"/><path fill="none" stroke="#8da38b" stroke-width=".7" d="M15.5 16q3.5 2 7 0M16 19q3 2 6 0M16 22q3 2 6 0"/>',
    results:
        '<path fill="#804b30" d="m3 7 12-4 8 4v14l-12 3-8-4Z"/><path fill="#f6ebc0" d="m3 7 8 4 12-4v11l-12 3-8-4Z"/><path fill="#b65738" d="m3 5 12-4 8 4-12 4Z"/><path fill="none" d="M11 11v10M14 12l6-2m-6 5 6-2m-6 5 6-2"/>',
    recipe: '<path fill="#c2e0b6" d="M5 3h11v18H5Z"/><path fill="#f3dd35" d="M6 10h9v10H6Z"/><path fill="none" stroke-width="2" d="M16 6h5v11h-5"/><path fill="#fffdc5" d="M4 2h13v3H4Z"/><path stroke="#ffffe3" d="M8 6v10"/>',
    supplies:
        '<path fill="#c99545" d="m2 8 11-5 10 5v12l-11 4-10-5Z"/><path fill="#ebc36b" d="m2 8 10 5 11-5-10-5Z"/><path fill="#aa722e" d="m12 13 11-5v12l-11 4Z"/><path fill="none" d="M12 13v11M5 10v10m4-8v9m7-10v11m4-13v12M6 6l11 5"/>',
    price: '<path fill="#d4ac20" d="m3 8 4-4h12l3 4v11l-4 3H7l-4-3Z"/><path fill="#ffe969" d="m3 7 4-4h11l4 4-4 4H7Z"/><path fill="none" d="M3 12l4 3h11l4-3M3 16l4 3h11l4-3"/>',
} as const;
export function icon(name: keyof typeof drawings): string {
    return `<svg class="pixel-icon" viewBox="0 0 26 26" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><g stroke="#304329" stroke-width="1" stroke-linejoin="miter">${drawings[name]}</g></svg>`;
}

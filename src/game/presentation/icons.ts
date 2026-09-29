// Original outlined inventory icons shared by the stock strip and controls.
const drawings = {
    lemon: '<path fill="#e7bd25" d="M3 14C1 12 4 6 9 5c5-3 10-1 12 2l2 3-2 2c-1 6-9 10-14 7Z"/><path fill="#fff07d" stroke="none" d="M5 12c0-4 7-7 12-5-6 0-9 4-9 8Z"/><path fill="#4d9a35" d="m14 5 3-4 6 1-4 4Z"/>',
    sugar: '<path fill="#dedec3" d="M5 7 8 3h10l3 4-2 16H6Z"/><path fill="#fffde5" d="M5 7h16l-3 3H8Z"/><path fill="#9ab7d1" d="M7 12h11v7H7Z"/><path fill="#fffce8" d="m9 16 3-3 4 4Z"/><path fill="none" d="M8 3v3m10-3v3"/>',
    ice: '<path fill="#91dbe6" d="m2 11 7-4 7 4v8l-7 4-7-4Z"/><path fill="#e5ffff" d="m2 11 7 3 7-3-7-4Z"/><path fill="#63acdb" d="m9 14 7-3v8l-7 4Z"/><path fill="#b7ebf1" d="m12 4 6-3 5 3v7l-6 3-5-3Z"/><path fill="#efffff" d="m12 4 5 3 6-3-5-3Z"/>',
    cup: '<path fill="#bec7b8" d="m4 5 8 0-1 17H6Zm11 4h8l-1 14h-5Z"/><path fill="#fffde7" d="m5 7 3 1v12l-2-1Zm11 4 3 1v9l-2-1Z"/><ellipse fill="#f9f6dc" cx="8" cy="5" rx="4" ry="2"/><ellipse fill="#f9f6dc" cx="19" cy="9" rx="4" ry="2"/><path fill="none" stroke="#7f9586" d="m5 11 3 1 4-1M6 16l2 1 3-1m5-1 3 1 3-1"/>',
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

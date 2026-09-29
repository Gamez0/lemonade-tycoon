// Original outlined inventory icons shared by the stock strip and controls.
const drawings = {
    lemon: '<path fill="#e6be26" d="m3 13 3-6 9-3 6 5-1 7-8 5-7-3Z"/><path fill="#fff07d" d="m5 12 3-4 7-2 3 2-8 1-3 6Z"/><path fill="#51a338" d="m14 5 3-4 5 1-3 4Z"/>',
    sugar: '<path fill="#d1d4bb" d="m4 8 9-4 8 4v11l-8 4-9-4Z"/><path fill="#fffce3" d="m4 8 9 4 8-4-8-4Z"/><path fill="#a7ac98" d="m13 12 8-4v11l-8 4Z"/><path fill="none" d="M4 8v11l9 4V12"/>',
    ice: '<path fill="#91dbe6" d="m2 11 7-4 7 4v8l-7 4-7-4Z"/><path fill="#e5ffff" d="m2 11 7 3 7-3-7-4Z"/><path fill="#63acdb" d="m9 14 7-3v8l-7 4Z"/><path fill="#b7ebf1" d="m12 4 6-3 5 3v7l-6 3-5-3Z"/><path fill="#efffff" d="m12 4 5 3 6-3-5-3Z"/>',
    cup: '<path fill="#d0d4bb" d="m5 4 14 0-2 18H7Z"/><path fill="#fffde7" d="m5 4 7 3 7-3-7-2Z"/><path fill="#fffbe3" d="m7 8 6 2-1 10-4-1Z"/><path fill="none" d="m6 11 6 2 6-2M7 16l5 2 5-2"/>',
    recipe: '<path fill="#c2e0b6" d="M5 3h11v18H5Z"/><path fill="#f3dd35" d="M6 10h9v10H6Z"/><path fill="none" stroke-width="2" d="M16 6h5v11h-5"/><path fill="#fffdc5" d="M4 2h13v3H4Z"/><path stroke="#ffffe3" d="M8 6v10"/>',
    supplies:
        '<path fill="#c99545" d="m2 8 11-5 10 5v12l-11 4-10-5Z"/><path fill="#ebc36b" d="m2 8 10 5 11-5-10-5Z"/><path fill="#aa722e" d="m12 13 11-5v12l-11 4Z"/><path fill="none" d="M12 13v11M5 10v10m4-8v9m7-10v11m4-13v12M6 6l11 5"/>',
    price: '<path fill="#d4ac20" d="m3 8 4-4h12l3 4v11l-4 3H7l-4-3Z"/><path fill="#ffe969" d="m3 7 4-4h11l4 4-4 4H7Z"/><path fill="none" d="M3 12l4 3h11l4-3M3 16l4 3h11l4-3"/>',
} as const;
export function icon(name: keyof typeof drawings): string {
    return `<svg class="pixel-icon" viewBox="0 0 26 26" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><g stroke="#304329" stroke-width="1" stroke-linejoin="miter">${drawings[name]}</g></svg>`;
}

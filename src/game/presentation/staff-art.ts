import type { STAFF } from "../content/management";

// Native transparent illustrations; no 26px glyph or canvas intermediary.
const portraits: Record<keyof typeof STAFF, string> = {
    none: new URL("../assets/staff-owner-v1.png", import.meta.url).href,
    server: new URL("../assets/staff-server-v1.png", import.meta.url).href,
    host: new URL("../assets/staff-host-v1.png", import.meta.url).href,
};

export function staffPortrait(id: keyof typeof STAFF): string {
    return `<img class="staff-portrait" src="${portraits[id]}" alt="" width="100" height="100" draggable="false">`;
}

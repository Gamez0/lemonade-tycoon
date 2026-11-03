import { KOREAN, KOREAN_PATTERNS } from "../content/translations";
export type Locale = "en" | "ko";
const KEY = "willow-lane.locale.v1";
let selected: Locale = "en";
try { if (localStorage.getItem(KEY) === "ko") selected = "ko"; } catch { /* English fallback. */ }
const escape = (value: string): string => [...value].map(character => /[A-Za-z0-9 ]/.test(character) || character.charCodeAt(0) > 127 ? character : String.fromCharCode(92) + character).join("");
const patterns = KOREAN_PATTERNS.map(([source, target]) => ({
    expression: new RegExp("^" + source.split(/(\{#?\d+\})/).map(part =>
        /^\{#\d+\}$/.test(part) ? "([0-9]+(?:[.][0-9]+)?)" : /^\{\d+\}$/.test(part) ? "(.+?)" : escape(part)).join("") + "$"), target,
}));
export const locale = (): Locale => selected;
function korean(source: string, depth = 0): string {
    const normalized = source.trim().replace(/\s+/g, " ");
    const exact = KOREAN[normalized];
    if (exact !== undefined) return source.replace(source.trim(), exact);
    if (depth < 8) for (const pattern of patterns) {
        const match = pattern.expression.exec(source.trim());
        if (match) return pattern.target.replace(/\{(\d+)\}/g, (_token, index: string) => korean(match[Number(index) + 1], depth + 1));
    }
    if (source.includes("\n")) return source.split("\n").map(line => korean(line, depth + 1)).join("\n");
    for (const separator of [", ", " · ", " / ", " | ", ": "]) if (source.includes(separator))
        return source.split(separator).map(part => korean(part, depth + 1)).join(separator);
    if (source.endsWith(".") || source.endsWith(":")) {
        const part = source.slice(0, -1), translated = korean(part, depth + 1);
        if (part !== translated) return translated + source.slice(-1);
    }
    return source;
}
export const tr = (source: string): string => selected === "ko" ? korean(source) : source;
interface Translation { source: string; displayed: string }
const texts = new WeakMap<Text, Translation>();
const attributes = new WeakMap<Element, Map<string, Translation>>();
/** Translate view text/accessible labels, excluding player names and editable data. */
export function localize(root: HTMLElement): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
        const text = node as Text;
        if (text.parentElement?.closest('[data-user-text="true"], [data-no-translate], script, style, textarea, input')) continue;
        const previous = texts.get(text), current = text.data;
        const source = previous && (current === previous.displayed || current === previous.source) ? previous.source : current;
        const displayed = tr(source);
        if (current !== displayed) text.data = displayed;
        texts.set(text, { source, displayed });
    }
    for (const element of [root, ...root.querySelectorAll<HTMLElement>("*")]) {
        if (element.closest('[data-user-text="true"], [data-no-translate]')) continue;
        const records = attributes.get(element) ?? new Map<string, Translation>();
        for (const name of ["aria-label", "title", "placeholder"]) {
            if (name === "title" && element.dataset.userTitle === "true") continue;
            const current = element.getAttribute(name); if (current === null) continue;
            const previous = records.get(name);
            const source = previous && (current === previous.displayed || current === previous.source) ? previous.source : current;
            const displayed = tr(source);
            if (current !== displayed) element.setAttribute(name, displayed);
            records.set(name, { source, displayed });
        }
        attributes.set(element, records);
    }
}
export function setLocale(value: string): void {
    selected = value === "ko" ? "ko" : "en";
    try { localStorage.setItem(KEY, selected); } catch { /* Session language still works. */ }
    document.documentElement.lang = selected;
    window.dispatchEvent(new Event("lemonade-language-change"));
}
document.documentElement.lang = selected;

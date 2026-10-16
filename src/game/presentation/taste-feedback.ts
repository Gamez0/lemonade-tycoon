import type { TasteComplaint } from "../simulation/game";

const reactions: Record<TasteComplaint, string> = {
    "too-weak": "Too watery!", "too-warm": "Too warm!", "too-sour": "Too sour!", "too-sweet": "Too sweet!",
};
const advice: Record<TasteComplaint, string> = {
    "too-weak": "Too watery: ice dilutes the drink. Add balanced lemon and sugar, or use less ice.",
    "too-warm": "Not enough ice for today's temperature. Try more ice tomorrow.",
    "too-sour": "Too sour: balance the lemon with more sugar or less lemon.",
    "too-sweet": "Too sweet: balance the sugar with more lemon or less sugar.",
};
export const tasteReaction = (complaints: readonly TasteComplaint[], satisfaction: number | null): string =>
    complaints.length ? reactions[complaints[0]] : satisfaction !== null && satisfaction < 70 ? ":(" : ":)";
export const tasteAdvice = (complaints: readonly TasteComplaint[]): string => complaints.map(reason => advice[reason]).join(" ");

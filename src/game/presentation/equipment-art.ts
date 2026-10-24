import type { UPGRADES } from "../content/management";

type Equipment = Exclude<keyof typeof UPGRADES, "stand">;
const illustrations: Record<Equipment, string> = {
    refrigerator: new URL("../assets/equipment-refrigerator-v1.png", import.meta.url).href,
    iceMaker: new URL("../assets/equipment-ice-maker-v1.png", import.meta.url).href,
    blender: new URL("../assets/equipment-blender-v1.png", import.meta.url).href,
};

export function equipmentArt(id: Equipment): string {
    return `<img class="equipment-illustration" src="${illustrations[id]}" alt="" width="100" height="100" draggable="false">`;
}

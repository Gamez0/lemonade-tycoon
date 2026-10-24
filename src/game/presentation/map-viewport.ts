// Keep the complete 5:4 scene visible without letterboxing its viewport.
// The management column takes spare width instead of stretching the map box.
export function fitDesktopMap(root: HTMLElement): void {
    const layout = root.querySelector<HTMLElement>(".layout")!;
    const frame = root.querySelector<HTMLElement>(".world-frame")!;
    const viewport = root.querySelector<HTMLElement>("#game-container")!;
    const details = [...frame.children].filter(e => !e.classList.contains("scene-window")) as HTMLElement[];
    let scheduled = 0;
    const number = (value: string) => parseFloat(value) || 0;
    const update = () => {
        scheduled = 0;
        const zoom = layout.getBoundingClientRect().width / layout.offsetWidth;
        if (!zoom || !layout.clientHeight) return;
        const style = getComputedStyle(frame), border = getComputedStyle(viewport);
        const horizontal = number(style.paddingLeft) + number(style.paddingRight) + number(style.borderLeftWidth) + number(style.borderRightWidth);
        const vertical = number(style.paddingTop) + number(style.paddingBottom) + number(style.borderTopWidth) + number(style.borderBottomWidth);
        const borderX = number(border.borderLeftWidth) + number(border.borderRightWidth);
        const borderY = number(border.borderTopWidth) + number(border.borderBottomWidth);
        const detailHeight = details.reduce((sum, element) => {
            const css = getComputedStyle(element);
            return sum + element.getBoundingClientRect().height / zoom + number(css.marginTop) + number(css.marginBottom);
        }, 0);
        const gap = number(getComputedStyle(layout).columnGap);
        const maximum = layout.clientWidth - gap - Math.min(480, layout.clientWidth / 2);
        const preferred = (layout.clientHeight - detailHeight - vertical - borderY) * 1.25 + borderX + horizontal;
        const width = Math.max(1, Math.floor(Math.min(maximum, preferred)));
        const height = Math.max(1, (width - horizontal - borderX) / 1.25 + borderY);
        const widthValue = `${width}px`, heightValue = `${height}px`;
        if (root.style.getPropertyValue("--map-column-width") !== widthValue) root.style.setProperty("--map-column-width", widthValue);
        if (root.style.getPropertyValue("--map-viewport-height") !== heightValue) root.style.setProperty("--map-viewport-height", heightValue);
    };
    const schedule = () => { if (!scheduled) scheduled = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    for (const element of [layout, ...details]) observer.observe(element);
    void document.fonts.ready.then(schedule);
    schedule();
}

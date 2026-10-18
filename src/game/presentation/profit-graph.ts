import { results, type State } from "../simulation/game";

export function profitGraph(history: readonly State[], money: (value: number) => string): string {
    const days = history.slice(-30);
    if (!days.length) return "";
    const profits = days.map(day => results(day).profit);
    const limit = Math.max(100, ...profits.map(Math.abs));
    const width = 344 / days.length;
    const barWidth = Math.max(1, Math.min(28, width - 2));
    const summary = days.map((day, i) => `Day ${day.day}: ${money(profits[i])}`).join("; ");
    const bars = days.map((day, i) => {
        const profit = profits[i], height = Math.abs(profit) / limit * 88;
        const center = 64 + (i + 0.5) * width;
        const x = center - barWidth / 2, y = profit >= 0 ? 115 - height : 115;
        const label = i % Math.ceil(days.length / 6) === 0 || i === days.length - 1;
        return `<rect data-report-day="${day.day}" data-profit="${profit}" x="${x}" y="${y}" width="${barWidth}" height="${height}" fill="${profit < 0 ? "#f3c16c" : "#d8ef93"}"><title>Day ${day.day}: ${money(profit)}</title></rect>` +
            (profit === 0 ? `<path d="M${x},115h${barWidth}" stroke="#d8ef93" stroke-width="2"/>` : "") +
            (label ? `<text x="${center}" y="226" text-anchor="middle">${day.day}</text>` : "");
    }).join("");
    return `<svg viewBox="0 0 420 240" role="img" aria-labelledby="profit-graph-title profit-graph-description">
        <title id="profit-graph-title">Daily profit, days ${days[0].day} to ${days[days.length - 1].day}</title>
        <desc id="profit-graph-description">${summary}. Bars above zero are profits; bars below zero are losses.</desc>
        <path d="M64,27H408M64,203H408" stroke="#39aa4c"/>
        <path d="M64,20V208M64,115H408" stroke="#d8edac"/>
        <g fill="#fff8cb" font-family="sans-serif" font-size="11"><text x="58" y="31" text-anchor="end">${money(limit)}</text>
        <text x="58" y="119" text-anchor="end">${money(0)}</text><text x="58" y="207" text-anchor="end">${money(-limit)}</text>${bars}</g></svg>`;
}

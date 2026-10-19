/** Original career header: 30 days per month, 12 months per year.
 * Keep the cumulative day in State and saves; derive the displayed date.
 */
export function careerDate(day: number): { year: number; month: number; day: number } {
    if (!Number.isSafeInteger(day) || day < 1) throw new Error("Day must be a positive safe integer.");
    const elapsed = day - 1;
    return { year: Math.floor(elapsed / 360) + 1, month: Math.floor(elapsed / 30) % 12 + 1,
        day: elapsed % 30 + 1 };
}

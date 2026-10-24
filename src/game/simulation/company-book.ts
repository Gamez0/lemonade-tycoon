import { decodeSave, encodeSave } from "./save";
import type { AsyncSaveStorage } from "./async-save";

export const COMPANY_KEY = "lemonade-tycoon.reboot.companies";
export interface Company { name: string; raw: string }
interface Book {
    version: 1;
    active: number;
    companies: (Company | null)[];
    pending?: { from: number; to: number; previous: string; next: string; target: Company | null };
}
const slot = (n: unknown): n is number => Number.isInteger(n) && Number(n) >= 0 && Number(n) < 8;
function company(value: Company): void {
    if (!value || typeof value.name !== "string" || !value.name.trim() || value.name.length > 40 || typeof value.raw !== "string")
        throw Error("Invalid company record.");
    decodeSave(value.raw);
}
function decode(raw: string, limit: number): Book {
    if (new TextEncoder().encode(raw).length > limit) throw Error("Company list is too large. Export your current business.");
    const b = JSON.parse(raw) as Book;
    if (b?.version !== 1 || !slot(b.active) || !Array.isArray(b.companies) || b.companies.length !== 8)
        throw Error("Company list could not be read. Keep the file as a backup.");
    const identities = new Set<string | undefined>();
    for (const c of b.companies) if (c !== null) {
        company(c);
        const id = decodeSave(c.raw).companyId;
        if (identities.has(id)) throw Error("Company identities are duplicated.");
        identities.add(id);
    }
    if (!b.companies[b.active]) throw Error("Active company is missing.");
    if (b.pending) {
        const p = b.pending;
        if (!slot(p.from) || !slot(p.to) || !b.companies[p.from] || !b.companies[p.to] ||
            typeof p.previous !== "string" || typeof p.next !== "string") throw Error("Invalid company transfer.");
        decodeSave(p.previous); decodeSave(p.next);
        if (p.target !== null) company(p.target);
        if (b.companies[p.to]!.raw !== p.next ||
            (p.from === p.to ? p.target?.raw !== p.previous : b.companies[p.from]!.raw !== p.previous))
            throw Error("Invalid company transfer contents.");
    }
    return b;
}

/** The existing autosave stays authoritative. A journal covers company switches;
 * ordinary game writes retain their existing primary/backup format and ordering. */
export class CompanyBook {
    private book?: Book;
    private needsRecovery = false;
    constructor(private storage: AsyncSaveStorage, private maxBytes: number) {}
    get companies(): readonly (Company | null)[] { return this.book?.companies ?? Array(8).fill(null); }
    get active(): number { return this.book?.active ?? 0; }
    get blocked(): boolean { return !this.book || this.needsRecovery; }
    private async write(book: Book): Promise<void> {
        const raw = JSON.stringify(book);
        if (new TextEncoder().encode(raw).length > this.maxBytes) throw Error("Company list is full. Export a backup before continuing.");
        decode(raw, this.maxBytes);
        await this.storage.setItem(COMPANY_KEY, raw);
    }
    async load(current: string, recovered = false): Promise<string> {
        decodeSave(current);
        this.needsRecovery = true;
        const raw = await this.storage.getItem(COMPANY_KEY);
        const book: Book = raw === null ? { version: 1, active: 0,
            companies: [{ name: "Company 1", raw: current }, ...Array(7).fill(null)] } : decode(raw, this.maxBytes);
        if (book.pending) {
            if (current === book.pending.next) book.active = book.pending.to;
            else if (current === book.pending.previous) {
                book.active = book.pending.from;
                book.companies[book.pending.to] = book.pending.target;
            }
            else throw Error("Company transfer needs recovery. Keep both save files as backups.");
            delete book.pending;
            book.companies[book.active]!.raw = current;
            await this.write(book);
        } else if (recovered && decodeSave(current).companyId !== decodeSave(book.companies[book.active]!.raw).companyId) {
            // The generic backup may belong to the company we switched away
            // from. Recover this company's durable snapshot instead.
            current = book.companies[book.active]!.raw;
        } else if (!decodeSave(current).companyId && decodeSave(book.companies[book.active]!.raw).companyId) {
            const doc = decodeSave(current);
            const owner = decodeSave(book.companies[book.active]!.raw);
            current = encodeSave(doc.state, doc.history, owner.companyId, owner.mode);
        }
        book.companies[book.active]!.raw = current;
        this.book = book;
        this.needsRecovery = false;
        return current;
    }
    async select(index: number, current: string, company: Company | null,
        writeCurrent: (raw: string) => Promise<void>, apply: (raw: string) => void): Promise<void> {
        if (this.blocked || !slot(index)) throw Error("Company list is unavailable. Restart to retry recovery.");
        decodeSave(current);
        const b = JSON.parse(JSON.stringify(this.book)) as Book;
        b.companies[b.active]!.raw = current;
        const target = b.companies[index];
        if (company) {
            if (!company.name.trim() || company.name.trim().length > 40) throw Error("Use a company name of1–40 characters.");
            decodeSave(company.raw);
            b.companies[index] = { ...company, name: company.name.trim() };
        }
        const next = b.companies[index];
        if (!next) throw Error("Choose a saved company.");
        b.pending = { from: b.active, to: index, previous: current, next: next.raw, target };
        this.needsRecovery = true;
        await this.write(b);
        await writeCurrent(next.raw);
        // Update the in-memory game before journal cleanup, so a close cannot
        // accidentally write the old company's state over the new primary.
        apply(next.raw);
        b.active = index;
        delete b.pending;
        await this.write(b);
        this.book = b;
        this.needsRecovery = false;
    }
}

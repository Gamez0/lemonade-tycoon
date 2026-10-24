import { icon } from "./icons";
import { decodeSave } from "../simulation/save";
import { careerDate } from "../simulation/calendar";
import { LOCATIONS } from "../content/locations";
import type { Company } from "../simulation/company-book";
import "./start-menu.css";

type NewCompany = Company & { mode?: "career" | "challenge" };
interface Hooks {
    companies: () => readonly (Company | null)[];
    active: () => number;
    blocked: () => boolean;
    ready: () => boolean;
    enter: (inspect?: boolean) => void;
    select: (index: number, company: NewCompany | null) => Promise<void>;
    help: () => void;
    options: () => void;
    quit: () => void;
    retry: () => Promise<void>;
    import: () => void;
}
const rect = (x: number, y: number, width: number, height: number) =>
    `left:${x}px;top:${y}px;width:${width}px;height:${height}px`;
const button = (id: string, label: string, art: string, x: number, y: number, w: number, h = 50) =>
    `<button id="${id}" style="${rect(x, y, w, h)}">${art}<span>${label}</span></button>`;
const mark = (text: string) => `<span class="menu-mark" aria-hidden="true">${text}</span>`;
const drawing = (paths: string) => `<svg class="pixel-icon" viewBox="0 0 26 26" aria-hidden="true"><g stroke="#304329" stroke-width=".8" stroke-linejoin="round">${paths}</g></svg>`;
const disk = drawing('<path fill="#7b83b9" d="M3 2h18l3 3v19H3Z"/><path fill="#e8ead7" d="M7 2h12v8H7Zm0 13h13v9H7Z"/><path fill="#707f91" d="M14 3h3v5h-3Z"/><path fill="none" d="M10 18h7m-7 3h7"/>');
const options = drawing('<path fill="#d8d9bd" d="M5 3h13l4 4v17H5Z"/><path fill="#afbfa9" d="m18 3 4 4h-4Z"/><path fill="none" stroke-width="2" d="M8 9h11M8 14h11M8 19h11"/><path fill="#f3ce61" d="M10 7h3v4h-3Zm5 5h3v4h-3Zm-6 5h3v4H9Z"/>');
const help = drawing('<path fill="#477db4" d="m4 5 12-3 6 3v18l-12 2-6-3Z"/><path fill="#e8edcd" d="m16 2 6 3v15l-6 2Z"/><path fill="none" stroke="#fff6cf" stroke-width="1.6" d="M7 10q0-4 4-4 5 0 2 5l-2 2m0 3v1"/>');
const credits = drawing('<path fill="#c6d7c2" d="m2 16 4-3 4 3v8H2Zm14 0 4-3 4 3v8h-8Z"/><path fill="#5a7caa" d="m8 16 5-3 5 3v9H8Z"/><ellipse fill="#c69b74" cx="6" cy="9" rx="3" ry="4"/><ellipse fill="#e5ba91" cx="13" cy="9" rx="3" ry="4"/><ellipse fill="#a97c5b" cx="20" cy="9" rx="3" ry="4"/><path fill="#514738" d="M3 7q1-5 5-1v2H3Zm7-1q3-4 6 0v1h-6Zm7 1q1-4 5-1v2h-5Z"/>');

/** Company lobby with eight save cards and a selected-save preview. */
export class StartMenu {
    readonly root = document.createElement("section");
    private selected = 0;
    private busy = false;
    private creating = false;
    private creatingMode: "career" | "challenge" = "career";
    private error = "";
    private summaries: ({ raw: string; mode: string; day: number; date: string; cash: string; location: string } | undefined)[] = [];
    private summary(index: number, company: Company) {
        const cached = this.summaries[index];
        if (cached?.raw === company.raw) return cached;
        const doc = decodeSave(company.raw), date = careerDate(doc.state.day);
        return this.summaries[index] = { raw: company.raw, mode: doc.mode === "challenge" ? "Challenge" : "Career",
            day: doc.state.day, date: `Year ${date.year} / Month ${date.month} / Day ${date.day}`,
            cash: `$${(doc.state.cash / 100).toFixed(2)}`, location: LOCATIONS[doc.state.location].name };
    }
    constructor(private hooks: Hooks) {
        this.root.id = "start-menu";
        this.root.setAttribute("aria-label", "Main menu");
        this.root.innerHTML = `<div class="start-frame">
          <h1 class="menu-logo" style="${rect(24, 12, 286, 84)}">${icon("lemon")}<small>WILLOW LANE</small><strong>LEMONADE</strong><b>TYCOON</b></h1>
          <div class="menu-panel" style="${rect(16, 108, 608, 330)}"></div>
          ${button("menu-options", "Options", options, 360, 24, 56, 56)}
          ${button("menu-help", "Help", help, 422, 24, 56, 56)}
          ${button("menu-credits", "Credits", credits, 484, 24, 56, 56)}
          ${button("menu-quit", "Quit", mark("\u00d7"), 546, 24, 56, 56)}
          <p id="menu-heading" style="${rect(28, 120, 350, 30)}">Choose your company</p>
          <p class="menu-selection-label" style="${rect(392, 126, 218, 24)}">SELECTED COMPANY</p>
          ${button("menu-new", "New career", icon("owner"), 28, 386, 170, 40)}
          ${button("menu-challenge", "30-day challenge", icon("clock"), 206, 386, 170, 40)}
          ${button("menu-continue", "LOAD GAME", disk, 392, 334, 218, 44)}
          <div class="company-list" aria-label="Saved companies" style="${rect(28, 160, 348, 214)}">${Array.from({ length: 8 }, (_, i) =>
            `<button data-company="${i}" aria-pressed="false">Empty company</button>`).join("")}</div>
          <div id="menu-company-info" class="menu-summary" style="${rect(392, 160, 218, 162)}"></div>
          <p id="menu-status" role="status" style="${rect(28, 446, 584, 28)}">Reading saved companies&#8230;</p>
          <button id="menu-retry" style="${rect(28, 386, 170, 40)}" hidden>Retry save recovery</button>
          <button id="menu-import" style="${rect(392, 386, 218, 40)}">Import backup&#8230;</button>
          <button id="menu-inspect" style="${rect(206, 386, 170, 40)}" hidden>Review / export backup</button>
          <form id="menu-create" aria-label="New career" hidden style="${rect(388, 156, 226, 224)}">
            <h2>New career</h2><label>Company name<input id="menu-name" maxlength="40" value="" required></label>
            <label id="menu-replace-label"><input id="menu-replace" type="checkbox"> Replace the selected company's saved game</label>
            <p>Your other companies will be kept.</p><button type="submit">CREATE</button><button id="menu-cancel" type="button">CANCEL</button>
          </form>
          <dialog id="menu-credits-dialog"><h2>Willow Lane Lemonade</h2><p>Art, music and code created for this game.</p><p>Phaser · MIT. Electron and Chromium license notices accompany the Windows package. Oswald · SIL Open Font License.</p><form method="dialog"><button>CLOSE</button></form></dialog>
        </div>`;
        document.body.append(this.root);
        this.el("menu-challenge").title = "Earn as much as you can in30 trading days.";
        this.el("menu-help").onclick = hooks.help;
        this.el("menu-options").onclick = hooks.options;
        this.el("menu-quit").onclick = hooks.quit;
        this.el("menu-import").onclick = hooks.import;
        this.el("menu-inspect").onclick = () => hooks.enter(true);
        this.el("menu-credits").onclick = () => this.el<HTMLDialogElement>("menu-credits-dialog").showModal();
        this.el("menu-continue").onclick = () => {
            if (this.selected === hooks.active()) hooks.enter();
            else void this.transfer(null);
        };
        const start = (mode: "career" | "challenge") => {
            const empty = hooks.companies().findIndex(c => !c);
            if (hooks.companies()[this.selected] && empty >= 0) this.selected = empty;
            this.creating = true;
            this.creatingMode = mode;
            this.el<HTMLInputElement>("menu-name").value = `Company ${this.selected + 1}`;
            this.el<HTMLInputElement>("menu-replace").checked = false;
            this.render(); this.el("menu-name").focus();
        };
        this.el("menu-new").onclick = () => start("career");
        this.el("menu-challenge").onclick = () => start("challenge");
        this.root.querySelectorAll<HTMLButtonElement>("[data-company]").forEach(button => {
            button.onclick = () => { this.selected = Number(button.dataset.company); this.creating = false; this.render(); };
            button.onkeydown = event => {
                const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -2, ArrowDown: 2 }[event.key];
                if (step === undefined && event.key !== "Home" && event.key !== "End") return;
                event.preventDefault();
                if (this.busy || this.hooks.blocked()) return;
                this.selected = event.key === "Home" ? 0 : event.key === "End" ? 7 : Math.max(0, Math.min(7, this.selected + step!));
                this.creating = false; this.render();
                this.root.querySelector<HTMLButtonElement>(`[data-company="${this.selected}"]`)!.focus();
            };
        });
        this.el("menu-cancel").onclick = () => { this.creating = false; this.render(); };
        this.el<HTMLFormElement>("menu-create").onsubmit = event => {
            event.preventDefault();
            if (hooks.companies()[this.selected] && !this.el<HTMLInputElement>("menu-replace").checked) {
                this.error = "Confirm replacement, or select an empty company."; this.render(); return;
            }
            void this.transfer({ name: this.el<HTMLInputElement>("menu-name").value.trim(), raw: "", mode: this.creatingMode });
        };
        this.el("menu-retry").onclick = () => {
            this.busy = true; this.render();
            void hooks.retry().then(() => { this.error = ""; }).catch(error => { this.error = String(error.message ?? error); })
                .finally(() => { this.busy = false; this.render(); });
        };
        const resize = () => { this.root.querySelector<HTMLElement>(".start-frame")!.style.transform =
            `translate(-50%, -50%) scale(${Math.min(innerWidth / 640, innerHeight / 480)})`; };
        window.addEventListener("resize", resize); resize();
        this.render();
    }
    private el<T extends HTMLElement = HTMLElement>(id: string): T { return this.root.querySelector<T>(`#${id}`)!; }
    show(error = ""): void { this.error = error; this.selected = this.hooks.active(); this.root.hidden = false; this.render(); }
    hide(): void { this.root.hidden = true; }
    private async transfer(company: NewCompany | null): Promise<void> {
        this.busy = true; this.error = ""; this.render();
        try { await this.hooks.select(this.selected, company); this.creating = false; this.hooks.enter(); }
        catch (error) { this.error = error instanceof Error ? error.message : "Company could not be loaded."; }
        finally { this.busy = false; this.render(); }
    }
    render(): void {
        const companies = this.hooks.companies(), chosen = companies[this.selected];
        this.root.querySelectorAll<HTMLButtonElement>("[data-company]").forEach((button, index) => {
            const company = companies[index], summary = company ? this.summary(index, company) : null;
            if (!company) this.summaries[index] = undefined;
            const slot = document.createElement("span"), name = document.createElement("strong"), detail = document.createElement("span");
            slot.className = "company-slot"; slot.textContent = String(index + 1);
            name.className = "company-name"; name.textContent = company?.name ?? "Empty slot";
            detail.className = "company-summary"; detail.textContent = summary ? `${summary.mode} / Day ${summary.day} / ${summary.cash}` : "Available for a new company";
            button.replaceChildren(slot, name, detail);
            button.title = company?.name ?? `Empty slot ${index + 1}`;
            button.dataset.empty = String(!company);
            button.disabled = this.busy || this.hooks.blocked();
            button.setAttribute("aria-pressed", String(this.selected === index));
        });
        this.el<HTMLButtonElement>("menu-new").disabled = this.busy || this.hooks.blocked() || !this.hooks.ready();
        this.el<HTMLButtonElement>("menu-challenge").disabled = this.busy || this.hooks.blocked() || !this.hooks.ready();
        this.el<HTMLButtonElement>("menu-continue").disabled = this.busy || !chosen || this.hooks.blocked() || !this.hooks.ready();
        this.el<HTMLButtonElement>("menu-import").disabled = this.busy;
        this.el<HTMLButtonElement>("menu-retry").disabled = this.busy;
        this.el<HTMLButtonElement>("menu-inspect").disabled = this.busy || !this.hooks.ready();
        this.el("menu-create").hidden = !this.creating;
        this.el("menu-company-info").hidden = this.creating;
        this.el("menu-continue").hidden = this.creating;
        this.el("menu-create").querySelector("h2")!.textContent = this.creatingMode === "challenge" ? "New challenge ·30 days" : "New career";
        this.el<HTMLFieldSetElement>("menu-create").querySelectorAll<HTMLButtonElement | HTMLInputElement>("input,button")
            .forEach(control => { control.disabled = this.busy; });
        this.el("menu-replace-label").hidden = !chosen;
        this.el("menu-heading").textContent = this.creating ? `New company ${this.selected + 1}` : "Choose your company";
        this.el("menu-company-info").textContent = "";
        if (chosen) {
            const summary = this.summary(this.selected, chosen);
            const name = document.createElement("strong"), detail = document.createElement("span");
            name.className = "menu-company-name"; name.textContent = chosen.name; name.title = chosen.name;
            detail.className = "menu-save-details";
            detail.textContent = `Slot ${this.selected + 1} / ${summary.mode}${this.selected === this.hooks.active() ? " / Current" : ""}\n${summary.date}\n${summary.cash} cash\n${summary.location}`;
            this.el("menu-company-info").replaceChildren(name, detail);
        } else {
            this.el("menu-company-info").textContent = `Slot ${this.selected + 1} is empty.\n\nChoose New career or 30-day challenge to start a company here.`;
        }
        const recovering = Boolean(this.error && this.hooks.blocked());
        this.el("menu-new").hidden = recovering; this.el("menu-challenge").hidden = recovering;
        this.el("menu-status").textContent = this.busy ? "Saving company…" : this.error ||
            (this.hooks.blocked() || !this.hooks.ready() ? "Loading game…" : "Progress saves automatically. Select a company, then LOAD GAME.");
        this.el("menu-retry").hidden = !this.error || !this.hooks.blocked();
        this.el("menu-inspect").hidden = !this.error || !this.hooks.blocked();
    }
}

import { UPGRADES, STAFF, ADS } from "../content/management";
import { ITEMS, ITEM_KEYS } from "../content/catalog";
import { icon } from "./icons";
import { LOCATIONS, LOCATION_IDS } from "../content/locations";

export const markup = `
<header class="masthead"><h1>${icon("lemon")} Willow Lane Lemonade</h1><span class="edition">Willow Lane</span></header>
<section class="resource-bar" aria-label="Supplies and cash">
 ${ITEM_KEYS.map((item) => `<span><span class="sr-only">${ITEMS[item].name}: </span>${icon(item)}<strong id="inventory-${item}">0</strong></span>`).join("")}
 <strong id="cash" aria-label="Cash on hand"></strong>
</section>
<div class="control-row">
 <nav class="toolbar" aria-label="Business screens">
 ${(["results", "rent", "upgrades", "staff", "marketing", "recipe", "supplies"] as const).map((page) => `<button data-page="${page}" aria-pressed="${page === "recipe"}" aria-controls="${page === "results" ? "results" : `${page}-page`}">${icon(page === "marketing" ? "price" : page === "upgrades" ? "supplies" : page === "staff" ? "happy" : page)}${page[0].toUpperCase() + page.slice(1)}</button>`).join("")}
 </nav>
 <section class="forecast" aria-label="Forecast">
  <div class="forecast-weather"><strong class="date-line">Year 1 · Day <span id="day">01</span></strong><span class="label" id="weather-label">Weather forecast</span><div class="weather-reading"><span id="weather-art"></span><strong id="weather"></strong></div><span id="weather-advice" class="weather-advice"></span></div>
  <div class="forecast-news"><p id="forecast-news"></p><div class="day-clock">${icon("clock")}<span id="world-status"></span></div><span id="progress-text"></span><progress id="day-progress" max="1" value="0" aria-label="Day progress"></progress></div>
 </section>
</div>
<main class="layout">
 <section class="management-column" aria-label="Business controls">
  <section class="daily-strip" aria-label="Today's performance"><h2>Performance</h2><div><span>Cups sold</span><strong id="sold">0</strong></div><div><span>Revenue</span><strong id="revenue">$0.00</strong></div><div><span>Profit</span><strong id="profit">$0.00</strong></div><div class="reactions" aria-label="Customer reactions"><span title="Customers served">${icon("happy")}<strong id="reaction-bought">0</strong><small>Served</small></span><span title="Left because of the price">${icon("expensive")}<strong id="reaction-price">0</strong><small>Price</small></span><span title="Passersby who did not buy">${icon("passing")}<strong id="reaction-passed">0</strong><small>Passed</small></span><span title="Could not buy: empty stock">${icon("empty")}<strong id="reaction-sold-out">0</strong><small>Empty</small></span><span title="Left after waiting">${icon("clock")}<strong id="reaction-abandoned">0</strong><small>Wait</small></span></div><p id="feedback" class="live-news" aria-live="off"></p></section>
  <section class="panel" aria-labelledby="panel-title">
   <h2 id="panel-title">Recipe</h2>
   <div id="preparation">
    <div id="rent-page" class="control-page" hidden>
     <div class="location-list" aria-label="Locations">${LOCATION_IDS.map(id => `<button data-location="${id}" aria-pressed="false"><img id="thumbnail-${id}" alt="" hidden><span>${LOCATIONS[id].name}<small id="location-state-${id}"></small></span></button>`).join("")}</div>
     <p id="rent-description" class="hint"></p><dl id="rent-details" class="rent-details"></dl>
     <p id="rent-unlock" class="hint"></p><p id="rent-reservation" class="hint" role="status"></p>
     <div class="purchase-actions"><button id="cancel-rent">CANCEL RESERVATION</button><button id="confirm-rent">CONFIRM LOCATION</button></div>
    </div>
    <div id="upgrades-page" class="control-page" hidden>${Object.entries(UPGRADES).map(([id, item]) => `<div class="management-choice"><strong>${item.name}</strong><span id="upgrade-effect-${id}"></span><button data-upgrade="${id}">BUY</button></div>`).join("")}</div>
    <div id="staff-page" class="control-page" hidden><p class="hint">One employee at a time. Wages charged at opening.</p>${Object.entries(STAFF).map(([id, item]) => `<button class="management-option" data-staff="${id}">${item.name} ? $${(item.wage / 100).toFixed(2)}/day<br>${item.speed ? "Service 2 ticks faster" : item.patience ? "Customers wait 12 ticks longer" : "No daily wage"}</button>`).join("")}</div>
    <div id="recipe-page" class="control-page"><p class="intro">Adjust your recipe to the forecast.<br>Add ice on warm days.<br>Balance the ingredients for better sales.</p>
     <fieldset id="recipe-controls"><legend class="sr-only">Pitcher recipe</legend>
     ${(["lemon", "sugar", "ice"] as const).map((item) => `<div class="recipe-row"><label for="${item}">${icon(item)}<span>${ITEMS[item].name}</span></label><div class="spinner"><button type="button" data-adjust="${item}" data-direction="-1" aria-label="Decrease ${item}">−</button><input id="${item}" type="number" min="${item === "ice" ? 0 : 1}" max="${item === "sugar" ? 4 : item === "ice" ? 7 : 6}" step="1" value="${item === "sugar" ? 1 : 2}"><button type="button" data-adjust="${item}" data-direction="1" aria-label="Increase ${item}">+</button></div></div>`).join("")}
     </fieldset><p class="hint">Lemons and sugar per pitcher · ice per cup. <strong id="pitcher-yield"></strong></p><p class="hint" id="recipe-hint"></p></div>
    <div id="marketing-page" class="control-page" hidden><p class="intro">Set your price for a cup of lemonade.<br>Charge too much and customers will walk away.</p><fieldset id="price-controls"><legend>Price per cup</legend><label>${icon("price")}Selling price ($)<input id="price" type="number" min="0.25" max="5" step="0.01" value="1.50"></label></fieldset><p id="management-bill" class="hint"></p><div class="advertising-options">${Object.entries(ADS).map(([id, item]) => `<button data-advertising="${id}">${item.name} $${(item.cost / 100).toFixed(2)} ? +${Math.round((item.traffic - 1) * 100)}%</button>`).join("")}</div><p class="hint">Compare your selling price with the ingredient cost below.</p></div>
    <div id="supplies-page" class="control-page" hidden><p class="intro">Choose your supplies, then BUY to confirm.<br>Leftovers stay in stock for tomorrow.</p><fieldset id="supply-controls"><legend class="sr-only">Buy supplies</legend>
     <nav class="supply-tabs" aria-label="Supply categories">${ITEM_KEYS.map((item) => `<button data-supply="${item}" aria-pressed="${item === "lemon"}">${icon(item)}<span>${ITEMS[item].name}</span><small id="stock-${item}"></small></button>`).join("")}</nav>
     <div id="supplies"></div><p id="order-summary" class="hint"></p><div class="order-total"><span>Order total</span><strong id="order-total"></strong></div><div class="purchase-actions"><button id="cancel-order">CANCEL</button><button id="buy-order">BUY</button></div>
    </fieldset></div>
   </div>
   <div id="selling" hidden><dl class="settings-table"><dt>Location</dt><dd id="setting-location"></dd><dt>Rent / moving</dt><dd id="setting-rent"></dd><dt>Cup price</dt><dd id="setting-price"></dd><dt>Pitcher / ice per cup</dt><dd class="setting-recipe">${(["lemon", "sugar", "ice"] as const).map((item) => `<span>${icon(item)}<b id="setting-${item}"></b></span>`).join("")}</dd><dt>In pitcher</dt><dd id="pitcher-cups"></dd><dt>Ready to serve</dt><dd id="setting-capacity"></dd></dl><p class="hint">Today's recipe and price stay fixed until closing.</p></div>
   <div id="results" hidden><nav class="report-tabs" aria-label="Report period"><button data-report="daily" aria-pressed="true">${icon("calendar")}Last day</button><button data-report="ledger" aria-pressed="false">${icon("results")}Profit &amp; loss</button></nav><p class="intro" id="result-intro"></p><div class="report-content"><dl id="result-values"></dl><aside id="report-commentary"><span id="report-face"></span><strong id="report-verdict"></strong><p id="report-response"></p></aside></div><p class="hint">Profit subtracts ingredients, rent and moving. Cash change subtracts purchases, rent and moving.</p></div>
   <div id="day-actions"><div class="cost-line"><span>Average cost / cup</span><strong id="unit-cost"></strong></div><div class="capacity"><span>Ready to serve</span><strong id="capacity"></strong></div><button id="open" class="primary">Start day <span>▶</span></button></div>
   <button id="next" class="primary" hidden>Prepare next day <span>▶</span></button>
   <p id="business-warning" class="hint" role="status" hidden></p><p id="message" role="status" aria-live="polite"></p>
  </section>
 </section>
 <section class="world-column" aria-label="Willow Lane stand">
  <div class="world-frame"><div class="scene-window"><div id="game-container"></div><div id="scene-controls" hidden><button id="speed" class="scene-speed"><span aria-hidden="true">▶▶</span> <span id="speed-label">Speed: 1×</span></button><button id="skip" class="scene-skip" title="Finish the remaining visits now">SKIP</button></div><span id="closed-sign" hidden>DAY COMPLETE</span></div>
   <div class="location-heading"><h2 id="location-name">The Neighborhood</h2><span id="location-rent" class="rent-tag">Rent: FREE</span></div>
   <p id="location-description" class="location-description"></p>
   <div class="location-ratings"><div><div class="rating-line"><label for="reputation-meter">Popularity</label><strong id="reputation"></strong></div><meter id="reputation-meter" min="0" max="100" value="50">50%</meter></div><div><div class="rating-line"><label for="satisfaction-meter">Satisfaction</label><strong id="location-satisfaction"></strong></div><meter id="satisfaction-meter" min="0" max="100" value="50">50%</meter></div></div>
  </div>
 </section>
</main>
<footer><button id="help-open" class="text-button">Help / Sound</button><span id="goal"></span><button id="restart" class="text-button">New business</button><button id="export-save" class="text-button">Export save</button><button id="import-save" class="text-button">Import save</button><input id="save-file" class="sr-only" type="file" accept=".json,application/json"><a href="./legacy.html">Legacy game</a><small id="save-status" role="status">Saved on this device</small></footer>
<dialog id="help-dialog" aria-labelledby="help-title"><h2 id="help-title">Willow Lane ? Help and sound</h2>
<p>1. Supplies: select ingredient bundles and press BUY. Start with lemons, sugar, ice and cups.</p>
<p>2. Recipe: use 2 lemons / 1 sugar per pitcher. Match ice to the forecast: 1 below 21 degrees C, 2 at 21-24 degrees C, 3 at 25-29 degrees C, 4 at 30 degrees C or warmer. More ice reduces pitcher yield.</p>
<p>3. Marketing: enter your price directly. Try $1.75 first. Ads bring more visitors, but charge every day. Extra traffic needs enough stock and fast service.</p>
<p>4. START DAY sells automatically. Speed and SKIP change waiting time, not the outcome. Results separates ingredient costs from supply cash purchases.</p>
<p>5. NEXT DAY keeps leftover supplies; ice melts unless refrigerated. Earn Park after 3 days/$45 sales/55% rating; Downtown after 7 days/$120/65%. Rent and wages charge at opening.</p>
<p>Equipment is permanent. A server speeds service; a host extends patience. Owner only dismisses staff. Ice makers purchase 60/120 ice automatically at normal supply cost. Choose affordable investments.</p>
<p>Saves are automatic before opening and after results. Closing during sales replays the paid opening without another fee. Export a backup before updating. New business requires a second confirmation.</p>
<p>Keyboard: Tab / Shift+Tab to move, Enter or Space to activate, Escape closes this help. All feedback is available with sound muted. English is the initial supported language.</p>
<label>Music <input id="music-volume" type="range" min="0" max="100" value="25"></label>
<label>Effects <input id="effects-volume" type="range" min="0" max="100" value="35"></label>
<label><input id="mute-audio" type="checkbox"> Mute all sound</label>
<p>Original code-generated music and effects. Art drawn for this project. Oswald font: SIL Open Font License. Phaser: MIT. Electron and Chromium license notices accompany the Windows package.</p>
<button id="fullscreen">Toggle fullscreen</button><button id="export-diagnostics" hidden>Export diagnostics</button><button id="quit-game" hidden>Save and quit</button><button id="help-close">CLOSE</button></dialog>`;

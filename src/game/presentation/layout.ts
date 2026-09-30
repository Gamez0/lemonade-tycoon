import { ITEMS, ITEM_KEYS } from "../content/catalog";
import { icon } from "./icons";

export const markup = `
<header class="masthead"><h1>${icon("lemon")} Lemonade Tycoon</h1><span class="edition">Willow Lane</span></header>
<section class="resource-bar" aria-label="Supplies and cash">
 ${ITEM_KEYS.map((item) => `<span><span class="sr-only">${ITEMS[item].name}: </span>${icon(item)}<strong id="inventory-${item}">0</strong></span>`).join("")}
 <strong id="cash" aria-label="Cash on hand"></strong>
</section>
<div class="control-row">
 <nav class="toolbar" aria-label="Business screens">
 ${(["results", "price", "recipe", "supplies"] as const).map((page) => `<button data-page="${page}" aria-pressed="${page === "recipe"}" aria-controls="${page === "results" ? "results" : `${page}-page`}">${icon(page)}${page[0].toUpperCase() + page.slice(1)}</button>`).join("")}
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
    <div id="recipe-page" class="control-page"><p class="intro">Adjust your recipe to the forecast.<br>Add ice on warm days.<br>Balance the ingredients for better sales.</p>
     <fieldset id="recipe-controls"><legend class="sr-only">Recipe per cup</legend>
     ${(["lemon", "sugar", "ice"] as const).map((item) => `<div class="recipe-row"><label for="${item}">${icon(item)}<span>${ITEMS[item].name}</span></label><div class="spinner"><button type="button" data-adjust="${item}" data-direction="-1" aria-label="Decrease ${item}">−</button><input id="${item}" type="number" min="${item === "ice" ? 0 : 1}" max="${item === "sugar" ? 4 : 6}" step="1" value="${item === "sugar" ? 1 : 2}"><button type="button" data-adjust="${item}" data-direction="1" aria-label="Increase ${item}">+</button></div></div>`).join("")}
     </fieldset><p class="hint" id="recipe-hint"></p></div>
    <div id="price-page" class="control-page" hidden><p class="intro">Set your price for a cup of lemonade.<br>Charge too much and customers will walk away.</p><fieldset id="price-controls"><legend>Price per cup</legend><label>${icon("price")}Selling price ($)<input id="price" type="number" min="0.25" max="5" step="0.01" value="1.50"></label></fieldset><p class="hint">Compare your selling price with the ingredient cost below.</p></div>
    <div id="supplies-page" class="control-page" hidden><p class="intro">Choose your supplies, then BUY to confirm.<br>Leftovers stay in stock for tomorrow.</p><fieldset id="supply-controls"><legend class="sr-only">Buy supplies</legend>
     <nav class="supply-tabs" aria-label="Supply categories">${ITEM_KEYS.map((item) => `<button data-supply="${item}" aria-pressed="${item === "lemon"}">${icon(item)}<span>${ITEMS[item].name}</span><small id="stock-${item}"></small></button>`).join("")}</nav>
     <div id="supplies"></div><p id="order-summary" class="hint"></p><div class="order-total"><span>Order total</span><strong id="order-total"></strong></div><div class="purchase-actions"><button id="cancel-order">CANCEL</button><button id="buy-order">BUY</button></div>
    </fieldset></div>
   </div>
   <div id="selling" hidden><dl class="settings-table"><dt>Location</dt><dd>The Neighborhood</dd><dt>Rent</dt><dd>FREE</dd><dt>Cup price</dt><dd id="setting-price"></dd><dt>Recipe / cup</dt><dd class="setting-recipe">${(["lemon", "sugar", "ice"] as const).map((item) => `<span>${icon(item)}<b id="setting-${item}"></b></span>`).join("")}</dd><dt>Ready to serve</dt><dd id="setting-capacity"></dd></dl><p class="hint">Today's recipe and price stay fixed until closing.</p></div>
   <div id="results" hidden><nav class="report-tabs" aria-label="Report period"><button data-report="daily" aria-pressed="true">${icon("calendar")}Last day</button><button data-report="ledger" aria-pressed="false">${icon("results")}Profit &amp; loss</button></nav><p class="intro" id="result-intro"></p><div class="report-content"><dl id="result-values"></dl><aside id="report-commentary"><span id="report-face"></span><strong id="report-verdict"></strong><p id="report-response"></p></aside></div><p class="hint">Profit subtracts ingredients used. Cash change subtracts supplies bought. Leftovers carry over.</p></div>
   <div id="day-actions"><div class="cost-line"><span>Ingredients / cup</span><strong id="unit-cost"></strong></div><div class="capacity"><span>Ready to serve</span><strong id="capacity"></strong></div><button id="open" class="primary">Start day <span>▶</span></button></div>
   <button id="next" class="primary" hidden>Prepare next day <span>▶</span></button>
   <p id="message" role="status" aria-live="polite"></p>
  </section>
 </section>
 <section class="world-column" aria-label="Willow Lane stand">
  <div class="world-frame"><div class="scene-window"><div id="game-container"></div><div id="scene-controls" hidden><button id="speed" class="scene-speed"><span aria-hidden="true">▶▶</span> <span id="speed-label">Speed: 1×</span></button><button id="skip" class="scene-skip" title="Finish the remaining visits now">SKIP</button></div><span id="closed-sign" hidden>DAY COMPLETE</span></div>
   <div class="location-heading"><h2>The Neighborhood</h2><span class="rent-tag">Rent: FREE</span></div>
   <p class="location-description">A quiet street and a few thirsty neighbors. The perfect place to start your lemonade empire.</p>
   <div class="location-ratings"><div><div class="rating-line"><label for="reputation-meter">Reputation</label><strong id="reputation"></strong></div><meter id="reputation-meter" min="0" max="100" value="50">50%</meter></div><div><div class="rating-line"><label for="satisfaction-meter">Satisfaction</label><strong id="location-satisfaction"></strong></div><meter id="satisfaction-meter" min="0" max="100" value="0">No buyers yet</meter></div></div>
  </div>
 </section>
</main>
<footer><span id="goal"></span><button id="restart" class="text-button">New business</button><button id="export-save" class="text-button">Export save</button><button id="import-save" class="text-button">Import save</button><input id="save-file" class="sr-only" type="file" accept=".json,application/json"><a href="./legacy.html">Legacy game</a><small id="save-status" role="status">Saved on this device</small></footer>`;

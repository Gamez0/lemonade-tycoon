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
 <section class="forecast" aria-label="Forecast"><div><strong>Year 1 · Day <span id="day">01</span></strong><span class="label">Today's weather</span><strong id="weather"></strong></div><p id="forecast-news">A new lemonade stand opens on Willow Lane!</p></section>
</div>
<main class="layout">
 <section class="management-column" aria-label="Business controls">
  <section class="daily-strip" aria-label="Today's performance"><h2>Performance</h2><div><span>Cups sold</span><strong id="sold">0</strong></div><div><span>Revenue</span><strong id="revenue">$0.00</strong></div><div><span>Profit</span><strong id="profit">$0.00</strong></div></section>
  <section class="panel" aria-labelledby="panel-title">
   <h2 id="panel-title">Recipe</h2>
   <div id="preparation">
    <div id="recipe-page" class="control-page"><p class="intro">Mix your lemonade to suit the weather.<br>A good recipe brings customers back!</p>
     <fieldset id="recipe-controls"><legend class="sr-only">Recipe per cup</legend>
     ${(["lemon", "sugar", "ice"] as const).map((item) => `<div class="recipe-row"><label for="${item}">${icon(item)}<span>${ITEMS[item].name}</span></label><div class="spinner"><button type="button" data-adjust="${item}" data-direction="-1" aria-label="Decrease ${item}">−</button><input id="${item}" type="number" min="${item === "ice" ? 0 : 1}" max="${item === "sugar" ? 4 : 6}" step="1" value="${item === "sugar" ? 1 : 2}"><button type="button" data-adjust="${item}" data-direction="1" aria-label="Increase ${item}">+</button></div></div>`).join("")}
     </fieldset><p class="hint" id="recipe-hint"></p></div>
    <div id="price-page" class="control-page" hidden><p class="intro">Set your price for a cup of lemonade.<br>Charge too much and customers will walk away.</p><fieldset id="price-controls"><legend>Price per cup</legend><label>${icon("price")}Selling price ($)<input id="price" type="number" min="0.25" max="5" step="0.01" value="1.50"></label></fieldset><p class="hint">Compare your selling price with the ingredient cost below.</p></div>
    <div id="supplies-page" class="control-page" hidden><p class="intro">Choose your supplies, then BUY to confirm.<br>Leftovers stay in stock for tomorrow.</p><fieldset id="supply-controls"><legend class="sr-only">Buy supplies</legend>
     <nav class="supply-tabs" aria-label="Supply categories">${ITEM_KEYS.map((item) => `<button data-supply="${item}" aria-pressed="${item === "lemon"}">${icon(item)}<span>${ITEMS[item].name}</span><small id="stock-${item}"></small></button>`).join("")}</nav>
     <div id="supplies"></div><p id="order-summary" class="hint"></p><div class="order-total"><span>Order total</span><strong id="order-total"></strong></div><div class="purchase-actions"><button id="cancel-order">CANCEL</button><button id="buy-order">BUY</button></div>
    </fieldset></div>
   </div>
   <div id="selling" hidden><div class="sale-summary" id="sale-summary"></div><p class="hint">Recipe and price are fixed until closing.</p><dl id="live-feedback"></dl></div>
   <div id="results" hidden><nav class="report-tabs" aria-label="Report period"><button data-report="daily" aria-pressed="true">Last day</button><button data-report="ledger" aria-pressed="false">Profit &amp; loss</button></nav><p class="intro" id="result-intro"></p><dl id="result-values"></dl><p class="hint">Profit subtracts ingredients used. Cash change subtracts supplies bought. Leftovers carry over.</p></div>
   <div id="day-actions"><div class="cost-line"><span>Ingredients / cup</span><strong id="unit-cost"></strong></div><div class="capacity"><span>Ready to serve</span><strong id="capacity"></strong></div><button id="open" class="primary">Start day <span>▶</span></button></div>
   <button id="next" class="primary" hidden>Prepare next day <span>▶</span></button>
   <p id="message" role="status" aria-live="polite"></p>
  </section>
 </section>
 <section class="world-column" aria-label="Willow Lane stand">
  <div class="world-frame"><div id="game-container"></div>
   <div class="location-heading"><h2>The Neighborhood</h2><span class="rent-tag">Rent: FREE</span></div>
   <p class="location-description">A quiet street and a few thirsty neighbors. The perfect place to start your lemonade empire.</p>
   <div class="rating-line"><label for="reputation-meter">Reputation</label><strong id="reputation"></strong></div><meter id="reputation-meter" min="0" max="100" value="50">50%</meter>
   <div class="world-caption"><span id="world-status"></span><span id="progress-text"></span></div><progress id="day-progress" max="1" value="0" aria-label="Day progress"></progress>
   <div class="world-controls"><span id="feedback" aria-live="off"></span><button id="speed" class="secondary" hidden>Speed: 1×</button></div>
  </div>
 </section>
</main>
<footer><span id="goal"></span><button id="restart" class="text-button">New business</button><a href="./legacy.html">Legacy game</a><small>Session only</small></footer>`;

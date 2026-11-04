const {test,expect}=require('../helpers/browser-game.cjs');
const game=require('../../.test-build/simulation/game.js');
const {withInventoryCosts}=require('../../.test-build/simulation/inventory-costs.js');
const {encodeSave}=require('../../.test-build/simulation/save.js');
const {stock}=require('../helpers/business.cjs');
const key='lemonade-tycoon.reboot.save';
test('forecast range and three accessible icons fit English/Korean narrow screens without changing the save',async({page},info)=>{
 const state=withInventoryCosts(stock(game.withWeatherForecast(game.newGame(1))));
 await page.addInitScript(({key,raw})=>{if(!localStorage.getItem(key))localStorage.setItem(key,raw);},{key,raw:encodeSave(state,[])});
 await page.goto('/');
 const before=await page.evaluate(key=>localStorage.getItem(key),key);
 for(const language of ['en','ko']){
  await page.locator('#help-open').click(); await page.locator('#language').selectOption(language);await page.locator('#help-close').click();
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('#weather')).toHaveText('18–32°C');
  await expect(page.locator('#forecast-periods [role=img]')).toHaveCount(3);
  for(const [width,height] of [[1280,1000],[800,600],[683,465],[512,350],[375,667]]){
   await page.setViewportSize({width,height});
   expect(await page.evaluate(()=>{
    const parent=document.querySelector('.forecast-weather').getBoundingClientRect();
    return document.documentElement.scrollWidth<=innerWidth && [...document.querySelectorAll('.forecast-period')].every(node=>{
     const r=node.getBoundingClientRect();return r.left>=parent.left-1&&r.right<=parent.right+1&&r.bottom<=parent.bottom+1;
    });
   })).toBe(true);
  }
  await expect(page.locator('#forecast-period-0')).toHaveAttribute('aria-label',language==='ko'?'1구간 예보: 맑음, 32°C':'Forecast period 1: Sunny, 32°C');
 }
 expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe(before);
 await page.screenshot({path:info.outputPath('forecast-korean-narrow.png'),fullPage:true});
});
test('a legacy paid day shows its saved weather without inventing a three-period forecast',async({page})=>{
 const fixture=require('../fixtures/alpha13-customer-model.json').cases[0];
 await page.goto('/');
 await page.locator('#save-file').setInputFiles({name:'old-paid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture.document))});
 await expect(page.locator('#save-status')).toContainText('Imported save');
 await expect(page.locator('#forecast-periods')).toBeHidden();
 await expect(page.locator('#weather-art')).toBeVisible();
 await expect(page.locator('#weather-label')).toHaveText('Saved opening weather');
 await page.locator('#open').click(); await page.locator('#skip').click();
 await expect(page.locator('#results')).toBeVisible();
 const expected=require('../helpers/stand-schema.cjs').withBasicStand(fixture.expected);
 await expect.poll(async()=>JSON.parse(await page.evaluate(key=>localStorage.getItem(key),key)).history[0]).toEqual(expected);
});

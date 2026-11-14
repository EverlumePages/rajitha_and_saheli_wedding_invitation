import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { startServer } from './serve.mjs';
import { launchBrowser } from './browser.mjs';
const server=await startServer(0);let browser;
const base=`http://127.0.0.1:${server.address().port}`;
try{
 await mkdir('artifacts',{recursive:true});browser=await launchBrowser();
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForFunction(()=>document.querySelector('#schedule').children.length===3);
 assert.equal(await page.locator('#intro').isVisible(),false,'Reduced-motion skips intro');
 assert.equal(await page.locator('#send-rsvp').isDisabled(),true,'Sample cannot send RSVP');
 assert.match(await page.locator('#couple-title').innerText(),/Rajitha/);
 await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
 await page.locator('input[value=no]').check();assert.equal(await page.locator('#party-size').isDisabled(),true);assert.equal(await page.locator('#party-field').isVisible(),false);
 await page.locator('input[value=yes]').check();assert.equal(await page.locator('#party-size').isEnabled(),true);
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`No overflow at ${width}`);}
 const url=await page.evaluate(async()=>{const {whatsappURL}=await import('./app.js');return whatsappURL({name:'රජිත',attendance:'yes',guests:2,message:'සුබ පැතුම් & love'},'+94 77 123 4567');});
 assert.ok(url.startsWith('https://wa.me/94771234567?text='));assert.match(decodeURIComponent(url),/රජිත/);assert.match(decodeURIComponent(url),/Guests.*2/);assert.match(decodeURIComponent(url),/සුබ පැතුම් & love/);
 assert.equal(await page.evaluate(async()=>{const {whatsappURL}=await import('./app.js');return whatsappURL({name:'A',attendance:'no',message:''},'invalid');}),null);
 const decline=await page.evaluate(async()=>{const {whatsappURL}=await import('./app.js');return whatsappURL({name:'A',attendance:'no',guests:5,message:''},'94771234567');});assert.ok(!decodeURIComponent(decline).includes('Guests'));
 const configured=await browser.newPage({reducedMotion:'reduce'});const source=await readFile('invitation.config.js','utf8');await configured.route('**/invitation.config.js',route=>route.fulfill({contentType:'text/javascript',body:source.replace("number: ''","number: '94771234567'")}));await configured.goto(base);await configured.waitForFunction(()=>!document.querySelector('#send-rsvp').disabled);
 await configured.evaluate(()=>{window.open=(url)=>{window.testURL=url;return null;};});await configured.locator('#send-rsvp').click();assert.equal(await configured.evaluate(()=>window.testURL),undefined,'Empty name blocked');await configured.locator('#guest-name').fill('   ');await configured.locator('#send-rsvp').click();assert.equal(await configured.evaluate(()=>window.testURL),undefined,'Whitespace name blocked');await configured.locator('#guest-name').fill('Test Guest');await configured.locator('#party-size').fill('0');await configured.locator('#send-rsvp').click();assert.equal(await configured.evaluate(()=>window.testURL),undefined,'Zero party blocked');await configured.locator('#party-size').fill('2');await configured.locator('#send-rsvp').click();assert.match(await configured.evaluate(()=>window.testURL),/^https:\/\/wa.me\//);await configured.close();
 const motion=await browser.newPage({viewport:{width:390,height:844}});await motion.goto(base);await motion.waitForFunction(()=>!document.querySelector('#intro').hidden);await motion.waitForFunction(()=>document.querySelector('video').readyState>=2);assert.equal(await motion.locator('#page').evaluate(el=>el.inert),true);await motion.screenshot({path:'artifacts/intro.png'});await motion.keyboard.press('Escape');assert.equal(await motion.locator('#intro').isVisible(),false);assert.equal(await motion.locator('#page').evaluate(el=>el.inert),false);await motion.close();
 const blocked=await browser.newPage();await blocked.addInitScript(()=>{HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Blocked','NotAllowedError'));});await blocked.goto(base);await blocked.locator('#play-intro').waitFor({state:'visible'});await blocked.locator('#play-intro').click();assert.equal(await blocked.locator('#intro').isVisible(),false);await blocked.close();
 const missing=await browser.newPage();await missing.route('**/media/localized-opening.mp4',route=>route.abort());await missing.goto(base);await missing.waitForFunction(()=>document.querySelector('#intro').hidden);assert.equal(await missing.locator('#page').evaluate(el=>el.inert),false);await missing.close();
 assert.deepEqual(errors,[]);console.log('Passed: responsive layout, reduced motion, intro playback/replay/end/error, autoplay fallback, RSVP validation, Sinhala WhatsApp encoding, sample sending disabled. Screenshots: artifacts/.');
}finally{await browser?.close();server.close();}

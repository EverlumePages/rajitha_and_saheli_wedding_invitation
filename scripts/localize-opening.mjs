import { mkdir,writeFile } from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {startServer} from './serve.mjs';
import {launchBrowser} from './browser.mjs';
const server=await startServer(0);let browser;
try{await mkdir('media',{recursive:true});browser=await launchBrowser();const page=await browser.newPage({viewport:{width:720,height:1280},deviceScaleFactor:1});await page.goto(`http://127.0.0.1:${server.address().port}/localized-video-scene.html`);await page.waitForFunction(()=>window.sceneReady);await page.screenshot({path:'media/localized-card.jpg',type:'jpeg',quality:97});await page.evaluate(()=>window.prepareRender());
 const encoder=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-vcodec','mjpeg','-framerate','24','-i','pipe:0','-i','assests/opening.mp4','-map','0:v:0','-map','1:a?','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-shortest','-movflags','+faststart','media/localized-opening.mp4'],{stdio:['pipe','inherit','inherit']});const completed=once(encoder,'close');encoder.stdin.on('error',()=>{});
 for(let i=0;i<240;i++){await page.evaluate(t=>window.renderFrame(t),i/24);const frame=await page.screenshot({type:'jpeg',quality:96});if(i===0)await writeFile('media/localized-opening-poster.jpg',frame);if([48,72,96,120,216].includes(i))await writeFile(`artifacts/localized-frame-${i}.jpg`,frame);if(!encoder.stdin.write(frame))await once(encoder.stdin,'drain');if(i%48===0)console.log(`Localized ${i}/240 frames`);}
 encoder.stdin.end();const[code]=await completed;if(code!==0)throw Error(`FFmpeg exited ${code}`);console.log('Created localized opening video with original animation and Sinhala sample details.');
}finally{await browser?.close();server.close();}

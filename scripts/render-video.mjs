import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { startServer } from './serve.mjs';
import { launchBrowser } from './browser.mjs';
const server=await startServer(0);let browser;
try{
 await mkdir('media',{recursive:true});browser=await launchBrowser();const page=await browser.newPage({viewport:{width:720,height:1280},deviceScaleFactor:1});await page.goto(`http://127.0.0.1:${server.address().port}/video-scene.html`);await page.waitForFunction(()=>window.sceneReady);await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>window.renderFrame(9));await page.screenshot({path:'media/opening-poster.jpg',type:'jpeg',quality:94});
 const encoder=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-vcodec','mjpeg','-framerate','24','-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart','media/opening.mp4'],{stdio:['pipe','inherit','inherit']});const completed=once(encoder,'close');encoder.stdin.on('error',()=>{});
 for(let i=0;i<240;i++){await page.evaluate(t=>window.renderFrame(t),i/24);const frame=await page.screenshot({type:'jpeg',quality:94});if(!encoder.stdin.write(frame))await once(encoder.stdin,'drain');if(i%48===0)console.log(`Rendered ${i}/240 frames`);}
 encoder.stdin.end();const [code]=await completed;if(code!==0)throw Error(`FFmpeg exited ${code}`);await writeFile('media/video-build.json',JSON.stringify({generatedAt:new Date().toISOString(),source:'video-scene.html',duration:10,width:720,height:1280},null,2));console.log('Created media/opening.mp4 and poster.');
}finally{await browser?.close();server.close();}

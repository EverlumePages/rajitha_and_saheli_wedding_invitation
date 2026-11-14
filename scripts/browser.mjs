import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
export function launchBrowser(){const candidates=[process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean);const executablePath=candidates.find(existsSync);return chromium.launch({headless:true,...(executablePath?{executablePath}:{})});}

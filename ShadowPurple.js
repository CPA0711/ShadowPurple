#!/usr/bin/env node
import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'process';
import { URL } from 'url';

const rl = readline.createInterface({ input: stdin, output: stdout });

// Default setting
let DELAY_MIN = 1000;
let DELAY_MAX = 5000;
let GET_RATIO = 0.7;
let DURATION_SEC = 300;
let MAX_REQUESTS = 0;
let TARGET_HOST = 'target';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Android 14; SM-S918B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edge/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/118.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 Chrome/109.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 Version/16.6 Safari/605.1.15',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Android 12; SM-G998B) AppleWebKit/537.36 Chrome/117.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 Version/16.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 Chrome/108.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_7) AppleWebKit/605.1.15 Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 11; Redmi Note 10) AppleWebKit/537.36 Chrome/116.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:118.0) Gecko/20100101 Firefox/118.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_8 like Mac OS X) AppleWebKit/605.1.15 Version/15.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Android 10; SM-A505F) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117.0.0.0 Safari/537.36 OPR/103.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_7_10) AppleWebKit/605.1.15 Version/16.5 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 9; vivo 1902) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0',
  'Mozilla/5.0 (iPad; CPU OS 16_7 like Mac OS X) AppleWebKit/605.1.15 Version/16.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:119.0) Gecko/20100101 Firefox/119.0',
  'Mozilla/5.0 (Android 8.0.0; SM-G950F) AppleWebKit/537.36 Chrome/113.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/116.0.0.0 Safari/537.36 Brave/116.0.0.0'
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function randomMethod() {
  return Math.random() < GET_RATIO? 'GET' : 'POST';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
  return Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN;
}

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString('id-ID', { hour12: false });
}

function colorTime(ms) {
  if (ms < 1000) return `\x1b[32m${ms}ms\x1b[0m`; // hijau <1s
  if (ms < 2000) return `\x1b[33m${ms}ms\x1b[0m`; // kuning 1-2s
  if (ms < 4000) return `\x1b[91m${ms}ms\x1b[0m`; // merah muda 2-4s
  return `\x1b[31m${ms}ms\x1b[0m`; // merah >4s
}

async function runTest(url) {
  let count = 0;
  let alive = 0;
  let dead = 0;
  let totalTime = 0;
  const startTime = Date.now();
  const endTime = startTime + DURATION_SEC * 1000;

  console.log(`\x1b[90mShadow Purple Running... Max: ${MAX_REQUESTS||'∞'} req | ${DURATION_SEC}s | Ctrl+C to stop\x1b[0m`);
  console.log(`\x1b[90mColor: \x1b[32m<1s\x1b[0m | \x1b[33m1-2s\x1b[0m | \x1b[91m2-4s\x1b[0m | \x1b[31m>4s\x1b[0m\n`);

  while (true) {
    if (MAX_REQUESTS > 0 && count >= MAX_REQUESTS) break;
    if (Date.now() >= endTime) break;

    count++;
    const reqStart = Date.now();
    const ua = randomUA();
    const method = randomMethod();
    const timestamp = getTime();

    const options = {
      method: method,
      headers: { 'User-Agent': ua },
      signal: AbortSignal.timeout(5000)
    };

    if (method === 'POST') {
      options.body = JSON.stringify({ shadow: 'ping', ts: Date.now(), req: count });
      options.headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(url, options);
      const time = Date.now() - reqStart;
      totalTime += time;
      if (res.ok) alive++; else dead++;
      const status = res.ok? `\x1b[32m✅ ${res.status}\x1b[0m` : `\x1b[33m⚠️ ${res.status}\x1b[0m`;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[${timestamp}] [${TARGET_HOST}] ${status} | ${method} | ${colorTime(time)} | ${elapsed}s`);
    } catch (err) {
      const time = Date.now() - reqStart;
      totalTime += time;
      dead++;
      console.log(`[${timestamp}] [${TARGET_HOST}] \x1b[31m❌ FAIL\x1b[0m | ${method} | \x1b[31m${time}ms\x1b[0m | ${err.name}`);
    }

    if ((MAX_REQUESTS === 0 || count < MAX_REQUESTS) && Date.now() < endTime) {
      await delay(randomDelay());
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  return { count, alive, dead, avgTime: count > 0? Math.round(totalTime / count) : 0, duration };
}

function showBanner() {
  console.log('\x1b[35m');
  console.log(' ╔═╝║ ║╔═║╔═ ╔═║║║║  ╔═║║ ║╔═║╔═║║  ╔═╝');
  console.log(' ══║╔═║╔═║║ ║║ ║║║║  ╔═╝║ ║╔╔╝╔═╝║  ╔═╝');
  console.log(' ══╝╝ ╝╝ ╝══ ══╝══╝  ╝  ══╝╝ ╝╝  ══╝══╝');
  console.log(' v1.0 CPA Stealth URL Flooder');
  console.log('\x1b[0m');
}

function showResult(result, url) {
  console.log('\n' + '='.repeat(40));
  console.log('\x1b[1m🌑 SHADOW PURPLE SUMMARY\x1b[0m');
  console.log('='.repeat(40));
  console.log(`Target : ${url}`);
  console.log(`Limit : ${MAX_REQUESTS||'Unlimited'} req | ${DURATION_SEC}s`);
  console.log(`Total Requests : ${result.count}`);
  console.log(`ALIVE : \x1b[32m${result.alive}\x1b[0m | DEAD : \x1b[31m${result.dead}\x1b[0m`);
  console.log(`Avg Response : ${colorTime(result.avgTime)}`);
  console.log(`Actual Duration : ${result.duration}s`);
  console.log(`Method : ${Math.round(GET_RATIO*100)}% GET / ${Math.round((1-GET_RATIO)*100)}% POST`);
  console.log('='.repeat(40) + '\n');
}

async function ask(question, defaultVal) {
  const ans = await rl.question(`\x1b[35m${question} \x1b[0m`);
  return ans.trim() === ''? defaultVal : ans.trim();
}

async function setup() {
  showBanner();

  const urlInput = await ask('Target URL > ', '');
  if (!urlInput) {
    console.log('URL kosong. Exit.');
    rl.close();
    return null;
  }
  const url = urlInput.startsWith('http')? urlInput : `https://${urlInput}`;

  try {
    TARGET_HOST = new URL(url).hostname;
  } catch {
    TARGET_HOST = url.replace(/^https?:\/\//, '').split('/')[0];
  }

  const dur = await ask('Durasi detik [60] > ', '60');
  DURATION_SEC = parseInt(dur);

  const req = await ask('Max Requests [0=unlimited] > ', '0');
  MAX_REQUESTS = parseInt(req);

  const dMin = await ask('Delay Min ms > ', '1000');
  DELAY_MIN = parseInt(dMin);

  const dMax = await ask('Delay Max ms > ', '5000');
  DELAY_MAX = parseInt(dMax);

  const ratio = await ask('Rasio GET 0-1 [0.7] > ', '0.7');
  GET_RATIO = parseFloat(ratio);

  return url;
}

async function main() {
  const url = await setup();
  if (!url) return;

  await delay(randomDelay());
  const result = await runTest(url);
  showResult(result, url);
  rl.close();
}

main();

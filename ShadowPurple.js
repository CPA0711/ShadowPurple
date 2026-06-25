#!/usr/bin/env node
import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'process';

const rl = readline.createInterface({ input: stdin, output: stdout });

// Default setting
let DELAY_MIN = 1000;
let DELAY_MAX = 5000;
let GET_RATIO = 0.7;
let TOTAL_REQUESTS = 1;
let DURATION_MODE = false;
let DURATION_SEC = 60;

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
  'Mozilla/5.0 (Android 10; SM-A505F) AppleWebKit/537.36 Chrome/115.0.0.0 Mobile Safari/537.36',
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

async function testUrl(url, count) {
  let alive = 0;
  let dead = 0;
  let totalTime = 0;

  for (let i = 1; i <= count; i++) {
    const start = Date.now();
    const ua = randomUA();
    const method = randomMethod();

    const options = {
      method: method,
      headers: { 'User-Agent': ua },
      signal: AbortSignal.timeout(8000)
    };

    if (method === 'POST') {
      options.body = JSON.stringify({ shadow: 'ping', ts: Date.now(), req: i });
      options.headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(url, options);
      const time = Date.now() - start;
      totalTime += time;
      if (res.ok) alive++; else dead++;
      const status = res.ok? `\x1b[32m✅ ${res.status}\x1b[0m` : `\x1b[33m⚠️ ${res.status}\x1b[0m`;
      console.log(`[${i}/${count}] ${status} | ${method} | ${time}ms`);
    } catch (err) {
      const time = Date.now() - start;
      totalTime += time;
      dead++;
      console.log(`[${i}/${count}] \x1b[31m❌ FAIL\x1b[0m | ${method} | ${time}ms | ${err.name}`);
    }

    if (i < count) await delay(randomDelay());
  }

  return { alive, dead, avgTime: Math.round(totalTime / count), count };
}

async function testDuration(url, durationSec) {
  let count = 0;
  let alive = 0;
  let dead = 0;
  let totalTime = 0;
  const endTime = Date.now() + durationSec * 1000;

  console.log(`\x1b[90m[Shadow] Running for ${durationSec} seconds... Ctrl+C to stop\x1b[0m\n`);

  while (Date.now() < endTime) {
    count++;
    const start = Date.now();
    const ua = randomUA();
    const method = randomMethod();

    const options = {
      method: method,
      headers: { 'User-Agent': ua },
      signal: AbortSignal.timeout(8000)
    };

    if (method === 'POST') {
      options.body = JSON.stringify({ shadow: 'ping', ts: Date.now(), req: count });
      options.headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(url, options);
      const time = Date.now() - start;
      totalTime += time;
      if (res.ok) alive++; else dead++;
      const status = res.ok? `\x1b[32m✅ ${res.status}\x1b[0m` : `\x1b[33m⚠️ ${res.status}\x1b[0m`;
      console.log(`[${count}] ${status} | ${method} | ${time}ms`);
    } catch (err) {
      const time = Date.now() - start;
      totalTime += time;
      dead++;
      console.log(`[${count}] \x1b[31m❌ FAIL\x1b[0m | ${method} | ${time}ms | ${err.name}`);
    }

    await delay(randomDelay());
  }

  return { count, alive, dead, avgTime: count > 0? Math.round(totalTime / count) : 0 };
}

function showBanner() {
  console.log('\x1b[35m');
  console.log(' ____ _ ____ _ ');
  console.log(' / ___| |__ ___ _ __ ___ | _ \\ _ __ |');
  console.log('| | \'_ \\ / _ \\| \'_ \\ / _ \\| |_) | \'_ \\ |');
  console.log('| |___| | (_) |_) | (_) | __/| |_| | ||_|');
  console.log(' \\____|_| |_|\\___/|.__/ \\___/|_| |_| \\__,_| |_(_)');
  console.log(' |_| ');
  console.log(' v1.2 | Stealth URL Checker + Flooder');
  console.log('\x1b[0m');
}

function showResult(result, url) {
  console.log('\n' + '='.repeat(40));
  console.log('\x1b[1m🌑 SHADOW PURPLE SUMMARY\x1b[0m');
  console.log('='.repeat(40));
  console.log(`Target : ${url}`);
  console.log(`Total Requests : ${result.count}`);
  console.log(`ALIVE : \x1b[32m${result.alive}\x1b[0m | DEAD : \x1b[31m${result.dead}\x1b[0m`);
  console.log(`Avg Response : ${result.avgTime}ms`);
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

  const mode = await ask('Mode [1] Jumlah Request / [2] Durasi Detik [1] > ', '1');

  if (mode === '2') {
    DURATION_MODE = true;
    const dur = await ask('Durasi dalam detik [60] > ', '60');
    DURATION_SEC = parseInt(dur);
  } else {
    const req = await ask('Jumlah Request [1] > ', '1'); // FIX: tambah > dan spasi
  }

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

  console.log('\x1b[90m[Shadow] Entering stealth mode...\x1b[0m');
  await delay(randomDelay());

  let result;
  if (DURATION_MODE) {
    result = await testDuration(url, DURATION_SEC);
  } else {
    result = await testUrl(url, TOTAL_REQUESTS);
  }

  showResult(result, url);
  rl.close();
}

main();

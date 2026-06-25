#!/usr/bin/env node
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:stdin';

const rl = readline.createInterface({ input, output });

// ShadowPurple v1.0 - Stealth URL Flooder
const DELAY_MIN = 1000;
const DELAY_MAX = 5000;
const GET_RATIO = 0.7; // 70% GET, 30% POST

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

async function testUrl(url) {
  const start = Date.now();
  const ua = randomUA();
  const method = randomMethod();

  const options = {
    method: method,
    headers: { 'User-Agent': ua },
    signal: AbortSignal.timeout(8000)
  };

  if (method === 'POST') {
    options.body = JSON.stringify({ shadow: 'ping', ts: Date.now() });
    options.headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, options);
    const time = Date.now() - start;
    const status = res.ok? `\x1b[32m✅ ${res.status}\x1b[0m` : `\x1b[33m⚠️ ${res.status}\x1b[0m`;
    console.log(`${status} | ${method} | ${time}ms | ${url}`);
    return { ok: res.ok, status: res.status, time, method };
  } catch (err) {
    const time = Date.now() - start;
    console.log(`\x1b[31m❌ FAIL\x1b[0m | ${method} | ${time}ms | ${url} | ${err.name}`);
    return { ok: false, status: 'ERR', time, method };
  }
}

function showResult(result) {
  console.log('\n' + '='.repeat(40));
  console.log('\x1b[1m🌑 SHADOW PURPLE RESULT\x1b[0m');
  console.log('='.repeat(40));
  console.log(`Target : ${result.url}`);
  console.log(`Method : ${result.method} 70/30`);
  console.log(`Status : ${result.ok? '\x1b[32mALIVE\x1b[0m' : '\x1b[31mDEAD\x1b[0m'}`);
  console.log(`HTTP Code : ${result.status}`);
  console.log(`Response Time : ${result.time}ms`);
  console.log('='.repeat(40) + '\n');
}

function showBanner() {
  console.log('\x1b[35m');
  console.log(' ____ _ _ ____ _ ');
  console.log(' / ___| |__ ___ _ __ ___ | _ \\ _ _ __ |');
  console.log('| | | \'_ \\ / _ \\| \'_ \\ / _ \\| |_) | \'_ \\ |');
  console.log('| |___| | (_) |_) | (_) | __/| |_| | ||_|');
  console.log(' \\____|_| |_|\\___/|.__/ \\___/|_| |_| \\__,_| |_(_)');
  console.log(' |_| ');
  console.log(' v1.0 | Stealth URL Flooder');
  console.log('\x1b[0m');
  console.log(`Fitur: 30 UA Random | Delay ${DELAY_MIN/1000}-${DELAY_MAX/1000}s | 70% GET 30% POST\n`);
}

async function main() {
  showBanner();

  const jawaban = await rl.question('\x1b[35mTarget URL > \x1b[0m');

  if (!jawaban.trim()) {
    console.log('URL kosong. Exit.');
    rl.close();
    return;
  }

  const fullUrl = jawaban.startsWith('http')? jawaban : `https://${jawaban}`;

  console.log('\x1b[90m[Shadow] Entering stealth mode...\x1b[0m');
  await delay(randomDelay());

  const result = await testUrl(fullUrl);
  result.url = fullUrl;

  showResult(result);
  rl.close();
}

main();

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const targetUrl = 'http://localhost:5173/Workouts';
const screenshotPath = path.resolve(__dirname, 'screenshot_workouts_full.png');

console.log('Testing full height Workouts page...');
const edgeProc = spawn(edgePath, [
  '--headless',
  '--disable-gpu',
  '--window-size=1280,1100',
  '--screenshot=' + screenshotPath,
  targetUrl
], { stdio: 'inherit' });

setTimeout(() => {
  try { edgeProc.kill(); } catch (e) {}
  if (fs.existsSync(screenshotPath)) {
    console.log('SUCCESS: Full screenshot generated at', screenshotPath);
  }
  process.exit(0);
}, 6000);

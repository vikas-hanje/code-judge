#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Direct path to Next.js binary
const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');

console.log('Starting Next.js build...');
console.log('Next.js binary path:', nextBin);

const buildProcess = spawn('node', [nextBin, 'build'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, NODE_ENV: 'production' }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
  } else {
    console.error('❌ Build failed with code:', code);
    process.exit(code);
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build error:', error);
  process.exit(1);
});

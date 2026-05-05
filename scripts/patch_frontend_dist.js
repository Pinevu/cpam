#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || '/frontend/dist/assets';
let patched = [];

for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith('.js')) continue;
  const file = path.join(dir, name);
  let s = fs.readFileSync(file, 'utf8');
  const before = s;

  // Mobile full-screen sheet: use small viewport height so iOS Safari bottom bar
  // does not cover modal footer. Keep desktop modal behavior through sm:* rules.
  s = s.replaceAll('h-[100dvh] max-h-[100dvh]', 'h-[100svh] max-h-[100svh]');

  // Header should not shrink inside full-screen sheets.
  s = s.replaceAll(
    'flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-neutral-800',
    'shrink-0 flex items-start justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95'
  );

  // Footer should be part of the flex layout rather than stuck at visual bottom.
  // This avoids iOS Safari toolbar overlay. The scroll body carries extra pb.
  s = s.replaceAll('sticky bottom-0 z-30', 'shrink-0 z-30');
  s = s.replaceAll('sticky bottom-0 z-20', 'shrink-0 z-20');
  s = s.replace(/,style:\{bottom:\/iPad\|iPhone\|iPod\/.test\(navigator\.userAgent\)\?"calc\(env\(safe-area-inset-bottom\) \+ 5\.5rem\)":"env\(safe-area-inset-bottom\)"\}/g, '');
  s = s.replaceAll('pb-[calc(env(safe-area-inset-bottom)+1rem)]', 'pb-[calc(env(safe-area-inset-bottom)+1.25rem)]');

  // Keep modal body scrollable with enough bottom room for fixed/shrink footer.
  s = s.replaceAll('px-5 py-4 pb-32 sm:pb-4', 'px-5 py-4 pb-44 sm:pb-4');

  // AI provider form: taller mobile body + iOS-friendly touch scrolling.
  s = s.replaceAll('bodyHeightClassName:"max-h-[74vh]"', 'bodyHeightClassName:"max-h-[82svh] sm:max-h-[74vh]"');
  s = s.replaceAll('bodyHeightClassName:"max-h-[82vh] sm:max-h-[74vh]"', 'bodyHeightClassName:"max-h-[82svh] sm:max-h-[74vh]"');
  s = s.replaceAll('bodyClassName:"!px-0 !py-0"', 'bodyClassName:"!px-0 !py-0 overscroll-contain touch-pan-y"');
  s = s.replaceAll('className:"px-5 py-4"', 'className:"px-5 py-4 pb-40 sm:pb-6"');

  // Logs page: avoid oversized initial fetch on constrained devices.
  s = s.replaceAll('J=5e4,Qe=2e3', 'J=2e3,Qe=500');
  s = s.replaceAll('J=2e3,Qe=500', 'J=2e3,Qe=500');

  // Mobile sidebar width consistency.
  s = s.replaceAll('fixed inset-y-0 left-0 z-40 w-56', 'fixed inset-y-0 left-0 z-40 w-64 max-w-[82vw]');
  s = s.replaceAll('"flex h-full w-56 flex-col"', '"flex h-full w-64 max-w-[82vw] flex-col"');

  if (s !== before) {
    fs.writeFileSync(file, s);
    patched.push(name);
  }
}

console.log('patched frontend assets:', patched.join(', ') || 'none');

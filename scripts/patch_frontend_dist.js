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

  // iOS Safari compact modal: smaller sheet above bottom toolbar.
  s = s.replaceAll('h-[100dvh] max-h-[100dvh]', 'h-[68svh] max-h-[68svh] mb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:mb-0');
  s = s.replaceAll('h-[100svh] max-h-[100svh]', 'h-[68svh] max-h-[68svh] mb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:mb-0');
  s = s.replaceAll('h-[78svh] max-h-[78svh] mb-[calc(env(safe-area-inset-bottom)+5.25rem)] sm:mb-0', 'h-[68svh] max-h-[68svh] mb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:mb-0');

  // Compact header; hide long description on mobile.
  s = s.replaceAll(
    'flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-neutral-800',
    'shrink-0 flex items-start justify-between gap-2 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95'
  );
  s = s.replaceAll(
    'shrink-0 flex items-start justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95',
    'shrink-0 flex items-start justify-between gap-2 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95'
  );
  s = s.replaceAll('mt-1 text-sm text-slate-600 dark:text-white/65', 'hidden sm:block mt-1 text-sm text-slate-600 dark:text-white/65');

  // Footer participates in flex layout; compact padding and safe-area room.
  s = s.replaceAll('sticky bottom-0 z-30', 'shrink-0 z-30');
  s = s.replaceAll('sticky bottom-0 z-20', 'shrink-0 z-20');
  s = s.replace(/,style:\{bottom:\/iPad\|iPhone\|iPod\/.test\(navigator\.userAgent\)\?"calc\(env\(safe-area-inset-bottom\) \+ 5\.5rem\)":"env\(safe-area-inset-bottom\)"\}/g, '');
  s = s.replaceAll('px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]', 'px-4 py-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]');
  s = s.replaceAll('px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]', 'px-4 py-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]');

  // Body owns all scrolling. Force scroll on iOS Safari and enable touch momentum.
  s = s.replaceAll('px-5 py-4 pb-32 sm:pb-4', 'min-h-0 flex-1 overflow-y-scroll overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] px-4 py-2 pb-4 sm:px-5 sm:py-4 sm:pb-4');
  s = s.replaceAll('px-5 py-4 pb-44 sm:pb-4', 'min-h-0 flex-1 overflow-y-scroll overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] px-4 py-2 pb-4 sm:px-5 sm:py-4 sm:pb-4');
  s = s.replaceAll('min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-5 py-3 pb-6 sm:pb-4', 'min-h-0 flex-1 overflow-y-scroll overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] px-4 py-2 pb-4 sm:px-5 sm:py-4 sm:pb-4');

  // AI provider modal: compact inner form and scrollable body.
  s = s.replaceAll('bodyHeightClassName:"max-h-[74vh]"', 'bodyHeightClassName:"max-h-[54svh] sm:max-h-[74vh]"');
  s = s.replaceAll('bodyHeightClassName:"max-h-[82vh] sm:max-h-[74vh]"', 'bodyHeightClassName:"max-h-[54svh] sm:max-h-[74vh]"');
  s = s.replaceAll('bodyHeightClassName:"max-h-[82svh] sm:max-h-[74vh]"', 'bodyHeightClassName:"max-h-[54svh] sm:max-h-[74vh]"');
  s = s.replaceAll('bodyHeightClassName:"max-h-[62svh] sm:max-h-[74vh]"', 'bodyHeightClassName:"max-h-[54svh] sm:max-h-[74vh]"');
  s = s.replaceAll('bodyClassName:"!px-0 !py-0"', 'bodyClassName:"!px-0 !py-0 overflow-y-scroll overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]"');
  s = s.replaceAll('bodyClassName:"!px-0 !py-0 overscroll-contain touch-pan-y"', 'bodyClassName:"!px-0 !py-0 overflow-y-scroll overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]"');
  s = s.replaceAll('className:"sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"', 'className:"sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-1.5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"');
  s = s.replaceAll('className:"px-5 py-4"', 'className:"px-4 py-2 pb-3 sm:px-5 sm:py-4"');
  s = s.replaceAll('className:"px-5 py-4 pb-28 sm:pb-6"', 'className:"px-4 py-2 pb-3 sm:px-5 sm:py-4"');
  s = s.replaceAll('className:"px-5 py-4 pb-40 sm:pb-6"', 'className:"px-4 py-2 pb-3 sm:px-5 sm:py-4"');
  s = s.replaceAll('className:"px-4 py-3 pb-6 sm:px-5 sm:py-4"', 'className:"px-4 py-2 pb-3 sm:px-5 sm:py-4"');
  s = s.replaceAll('className:"space-y-4"', 'className:"space-y-2"');
  s = s.replaceAll('className:"mt-2"', 'className:"mt-1"');
  s = s.replaceAll('className:"mt-2 text-xs text-slate-500 dark:text-white/55"', 'className:"hidden"');

  // Logs page: avoid oversized initial fetch on constrained devices.
  s = s.replaceAll('J=5e4,Qe=2e3', 'J=2e3,Qe=500');

  // Mobile sidebar width consistency.
  s = s.replaceAll('fixed inset-y-0 left-0 z-40 w-56', 'fixed inset-y-0 left-0 z-40 w-64 max-w-[82vw]');
  s = s.replaceAll('"flex h-full w-56 flex-col"', '"flex h-full w-64 max-w-[82vw] flex-col"');

  if (s !== before) {
    fs.writeFileSync(file, s);
    patched.push(name);
  }
}

console.log('patched frontend assets:', patched.join(', ') || 'none');

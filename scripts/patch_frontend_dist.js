#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || '/frontend/dist/assets';
const distRoot = path.dirname(dir);
let patched = [];

// Patch generated manage.html as well as hashed assets.
const manageHtml = path.join(distRoot, 'manage.html');
if (fs.existsSync(manageHtml)) {
  let html = fs.readFileSync(manageHtml, 'utf8');
  const beforeHtml = html;
  html = html.replace(
    /<meta name=\"viewport\" content=\"[^\"]*\"\s*\/>/,
    '<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover\" />'
  );
  const mobileGuard = `<style id="cpam-mobile-viewport-guard">
html,body,#root{width:100%;max-width:100%;overflow-x:hidden;overscroll-behavior:none;}
#root>div{width:100%;max-width:100%;overflow-x:hidden;overscroll-behavior:none;}
main,[class*="overflow-y-auto"],[class*="overflow-y-scroll"]{overscroll-behavior-y:contain;}
*{box-sizing:border-box;}
@media (max-width:640px){input,textarea,select{font-size:16px!important;line-height:1.5!important;} input::placeholder,textarea::placeholder{font-size:16px!important;}}
</style><script id="cpam-mobile-scroll-guard">
(function(){function a(){return !!document.querySelector('aside')&&!/\/manage\/login(?:$|[?#/])/.test(location.pathname)}function r(y){try{document.documentElement.scrollLeft=0;document.body.scrollLeft=0;if(y||a()){window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0}}catch(e){}};
window.addEventListener('pageshow',function(){r(true)},{passive:true});window.addEventListener('resize',function(){r(true)},{passive:true});window.addEventListener('orientationchange',function(){setTimeout(function(){r(true)},50)},{passive:true});window.addEventListener('scroll',function(){if(a())r(true)},{passive:true});window.addEventListener('touchend',function(){if(a())setTimeout(function(){r(true)},0)},{passive:true});
new MutationObserver(function(){r(false)}).observe(document.documentElement,{childList:true,subtree:true});setTimeout(function(){r(true)},0);setTimeout(function(){r(true)},300);})();
</script>`;
  if (!html.includes('cpam-mobile-viewport-guard')) {
    html = html.replace('</head>', mobileGuard + '</head>');
  }
  if (html !== beforeHtml) {
    fs.writeFileSync(manageHtml, html);
    patched.push('manage.html');
  }
}

for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith('.js')) continue;
  const file = path.join(dir, name);
  let s = fs.readFileSync(file, 'utf8');
  const before = s;

  // --- Global modal mobile layout ---
  // Keep dialogs taller on mobile, reserve safe-area space for iOS bottom toolbar,
  // and let only the body scroll so footer actions stay visible.
  s = s.replaceAll(
    'relative z-10 w-full ${S} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950',
    'relative z-10 w-full ${S} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950 flex h-[89svh] max-h-[calc(100svh-env(safe-area-inset-bottom)-0.35rem)] flex-col sm:max-h-[92dvh]'
  );
  s = s.replaceAll(
    'relative z-10 flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden rounded-none border-0 border-slate-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950 sm:h-auto sm:max-h-[92dvh]',
    'relative z-10 flex h-[89svh] max-h-[calc(100svh-env(safe-area-inset-bottom)-0.35rem)] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950 sm:h-auto sm:max-h-[92dvh]'
  );
  s = s.replaceAll(
    'h-[100svh] max-h-[100svh]',
    'h-[89svh] max-h-[calc(100svh-env(safe-area-inset-bottom)-0.35rem)]'
  );
  s = s.replaceAll(
    'h-[78svh] max-h-[78svh] mb-[calc(env(safe-area-inset-bottom)+5.25rem)] sm:mb-0',
    'h-[89svh] max-h-[calc(100svh-env(safe-area-inset-bottom)-0.35rem)] sm:h-auto sm:max-h-[92dvh]'
  );

  // Outer overlay: center the dialog and reserve bottom safe-area padding.
  s = s.replaceAll('fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4', 'fixed inset-0 z-[200] flex items-center justify-center px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] sm:p-4');
  s = s.replaceAll('fixed inset-0 z-[200] flex items-center justify-center p-4', 'fixed inset-0 z-[200] flex items-center justify-center px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] sm:p-4');

  // Header/footer stay fixed within the modal; body scrolls independently.
  s = s.replaceAll(
    'flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-neutral-800',
    'shrink-0 flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-neutral-800 sm:px-5 sm:py-4'
  );

  // Body owns all scrolling. Do not rely on page or panel scrolling.
  s = s.replaceAll('const at=D??"max-h-[70vh]",P=C??"overflow-y-auto",Ht=typeof window!="undefined"&&window.matchMedia("(max-width: 640px)").matches,mt=Ht?"flex-1 min-h-0 max-h-none":at;', 'const at=D??"max-h-[70vh]",P=C??"overflow-y-auto",Ht=typeof window!="undefined"&&window.matchMedia("(max-width: 640px)").matches,mt=Ht?"min-h-0 flex-1 max-h-none":at;');
  s = s.replaceAll('min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-5 py-3 pb-6 sm:pb-4', 'min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] px-4 py-3 sm:px-5 sm:py-4');

  // Footer compact and always visible above iOS safe area.
  s = s.replaceAll('className:"flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-neutral-800"', 'className:"shrink-0 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] dark:border-neutral-800 sm:px-5 sm:py-4 sm:pb-4"');
  s = s.replaceAll('sticky bottom-0 z-30', 'shrink-0 z-30');
  s = s.replaceAll('sticky bottom-0 z-20', 'shrink-0 z-20');

  // AI provider modal: keep full scrolling body on mobile.
  s = s.replaceAll('bodyHeightClassName:"max-h-[74vh]"', 'bodyHeightClassName:"min-h-0 flex-1 max-h-none sm:max-h-[74vh]"');
  s = s.replaceAll('bodyHeightClassName:"max-h-[82vh] sm:max-h-[74vh]"', 'bodyHeightClassName:"min-h-0 flex-1 max-h-none sm:max-h-[74vh]"');
  s = s.replaceAll('bodyHeightClassName:"max-h-[82svh] sm:max-h-[74vh]"', 'bodyHeightClassName:"min-h-0 flex-1 max-h-none sm:max-h-[74vh]"');
  s = s.replaceAll('bodyHeightClassName:"max-h-[62svh] sm:max-h-[74vh]"', 'bodyHeightClassName:"min-h-0 flex-1 max-h-none sm:max-h-[74vh]"');
  s = s.replaceAll('bodyClassName:"!px-0 !py-0"', 'bodyClassName:"!px-0 !py-0 min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]"');
  s = s.replaceAll('bodyClassName:"!px-0 !py-0 overscroll-contain touch-pan-y"', 'bodyClassName:"!px-0 !py-0 min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]"');
  s = s.replaceAll('className:"sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"', 'className:"sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"');
  s = s.replaceAll('className:"px-5 py-4"', 'className:"px-4 py-3 sm:px-5 sm:py-4"');
  s = s.replaceAll('className:"px-5 py-4 pb-28 sm:pb-6"', 'className:"px-4 py-3 sm:px-5 sm:py-4"');
  s = s.replaceAll('className:"px-5 py-4 pb-40 sm:pb-6"', 'className:"px-4 py-3 sm:px-5 sm:py-4"');
  s = s.replaceAll('className:"px-4 py-3 pb-6 sm:px-5 sm:py-4"', 'className:"px-4 py-2.5 pb-3 sm:px-5 sm:py-4"');
  s = s.replaceAll('className:"space-y-4"', 'className:"space-y-2.5"');
  s = s.replaceAll('className:"mt-2"', 'className:"mt-1.5"');
  s = s.replaceAll('className:"mt-2 text-xs text-slate-500 dark:text-white/55"', 'className:"hidden sm:block"');

  // Hide Switch import from sidebar navigation only; keep page/route available for later.
  s = s.replaceAll('{to:"/ccswitch-import-settings",i18nKey:"shell.nav_ccswitch_import_settings",icon:Q},', '');

  // Text-only navigation wording customizations.
  s = s.replaceAll('nav_api_keys:"API Keys"', 'nav_api_keys:"API Key"');
  s = s.replaceAll('nav_ccswitch_import_settings:"CC Switch 导入"', 'nav_ccswitch_import_settings:"Switch导入"');

  // Update modal: make current-version commit labels clickable too.
  s = s.replaceAll('j.current_commit?d.jsxs("p",{className:ct,children:[M("auto_update.commit"),": ",xl(j.current_commit)]}):null', 'j.current_commit?j.current_commit_url?d.jsxs("a",{href:j.current_commit_url,target:"_blank",rel:"noreferrer",className:I?"mt-1 block truncate text-xs text-emerald-700 hover:underline dark:text-emerald-200":"mt-1 block truncate text-xs text-indigo-600 hover:underline dark:text-indigo-300",children:[M("auto_update.commit"),": ",xl(j.current_commit)]}):d.jsxs("p",{className:ct,children:[M("auto_update.commit"),": ",xl(j.current_commit)]}):null');
  s = s.replaceAll('j.current_ui_commit?d.jsxs("p",{className:ct,children:[M("auto_update.commit"),": ",xl(j.current_ui_commit)]}):null', 'j.current_ui_commit?j.current_ui_commit_url?d.jsxs("a",{href:j.current_ui_commit_url,target:"_blank",rel:"noreferrer",className:I?"mt-1 block truncate text-xs text-emerald-700 hover:underline dark:text-emerald-200":"mt-1 block truncate text-xs text-indigo-600 hover:underline dark:text-indigo-300",children:[M("auto_update.commit"),": ",xl(j.current_ui_commit)]}):d.jsxs("p",{className:ct,children:[M("auto_update.commit"),": ",xl(j.current_ui_commit)]}):null');

  // Logs page: avoid oversized initial fetch.
  s = s.replaceAll('J=5e4,Qe=2e3', 'J=2e3,Qe=500');

  // Mobile page fit: keep authenticated pages inside the visual viewport.
  s = s.replaceAll('className:"flex min-h-full flex-col p-4 focus-visible:outline-none sm:p-6"', 'className:"flex min-h-full w-full min-w-0 max-w-full flex-col overflow-x-hidden overscroll-contain p-4 focus-visible:outline-none sm:p-6"');
  s = s.replaceAll('className:"flex-1 overflow-y-auto overflow-x-hidden"', 'className:"flex-1 overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]"');
  s = s.replaceAll('relative min-h-[100dvh] overflow-hidden bg-zinc-50', 'relative w-full max-w-full min-h-[100dvh] overflow-hidden bg-zinc-50');
  s = s.replaceAll('scrollbar-hidden relative inline-flex max-w-full gap-0.5 overflow-x-auto whitespace-nowrap', 'scrollbar-hidden relative flex w-full min-w-0 max-w-full gap-0.5 overflow-x-auto whitespace-nowrap');
  s = s.replaceAll('className:"space-y-6"', 'className:"min-w-0 max-w-full space-y-6 overflow-x-hidden"');

  // Mobile sidebar width consistency.
  s = s.replaceAll('fixed inset-y-0 left-0 z-40 w-56', 'fixed inset-y-0 left-0 z-40 w-64 max-w-[82vw]');
  s = s.replaceAll('"flex h-full w-56 flex-col"', '"flex h-full w-64 max-w-[82vw] flex-col"');

  if (s !== before) {
    fs.writeFileSync(file, s);
    patched.push(name);
  }
}

console.log('patched frontend assets:', patched.join(', ') || 'none');

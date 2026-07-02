// ============================================================
// Aura interactions — framework-agnostic behaviour layer.
//
// State lives in the DOM: [data-state="open|closed"]. This module
// only flips that attribute and adds a11y niceties. It is OPTIONAL:
//   • Vanilla: load interactions.auto.js (auto-wires data-* triggers).
//   • React/Vue/etc: bind data-state yourself; ignore this, or import
//     open/close/trapFocus as pure helpers.
//
// Nothing here is tied to the library name — see configure({prefix}).
// ============================================================

let PFX = '';
const A = (name) => `data-${PFX}${name}`;   // trigger attribute name
const C = (name) => `${PFX}${name}`;        // class name (matches SCSS $prefix)

/** Optional: namespace the trigger attributes, e.g. prefix:'ui' → data-ui-open. */
export function configure(opts = {}) {
  if (opts.prefix != null) PFX = opts.prefix ? opts.prefix + '-' : '';
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const cleanups = new WeakMap(); // element -> teardown fn
let scrollLocks = 0;

const resolve = (t) => (!t ? null : typeof t === 'string' ? document.querySelector(t) : t);
const stateEl = (el) => (el ? el.closest('[data-state]') : null);

export function lockScroll() {
  if (scrollLocks++ === 0) document.documentElement.style.overflow = 'hidden';
}
export function unlockScroll() {
  if (--scrollLocks <= 0) { scrollLocks = 0; document.documentElement.style.overflow = ''; }
}

export function trapFocus(el) {
  const nodes = el.querySelectorAll(FOCUSABLE);
  (nodes[0] || el).focus?.();
  const onKey = (e) => {
    if (e.key !== 'Tab' || !nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  el.addEventListener('keydown', onKey);
  return () => el.removeEventListener('keydown', onKey);
}

function activate(el) {
  const teardown = [];
  const onEsc = (e) => { if (e.key === 'Escape') close(el); };
  document.addEventListener('keydown', onEsc);
  teardown.push(() => document.removeEventListener('keydown', onEsc));

  if (el.hasAttribute('data-overlay')) {
    // modal: backdrop click, scroll lock, focus trap
    const onClick = (e) => { if (e.target === el) close(el); };
    el.addEventListener('click', onClick);
    teardown.push(() => el.removeEventListener('click', onClick));
    lockScroll();
    teardown.push(unlockScroll);
    const prev = document.activeElement;
    teardown.push(trapFocus(el));
    teardown.push(() => prev && prev.focus && prev.focus());
  } else {
    // popover/dropdown: outside click closes; reflect aria-expanded;
    // arrow-key navigation over the menu items.
    const trg = el.querySelector('[' + A('toggle') + ']');
    if (trg) {
      trg.setAttribute('aria-expanded', 'true');
      teardown.push(() => { trg.setAttribute('aria-expanded', 'false'); trg.focus(); });
    }
    const items = () => [...el.querySelectorAll(FOCUSABLE)].filter((n) => !n.hasAttribute(A('toggle')));
    const list = items();
    if (list.length) setTimeout(() => list[0].focus(), 0);
    const onNav = (e) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      const l = items(); if (!l.length) return;
      e.preventDefault();
      const i = l.indexOf(document.activeElement);
      let n;
      if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = l.length - 1;
      else if (e.key === 'ArrowDown') n = i < 0 ? 0 : (i + 1) % l.length;
      else n = i <= 0 ? l.length - 1 : i - 1;
      l[n].focus();
    };
    el.addEventListener('keydown', onNav);
    teardown.push(() => el.removeEventListener('keydown', onNav));
    const onDoc = (e) => { if (!el.contains(e.target)) close(el); };
    setTimeout(() => document.addEventListener('click', onDoc), 0);
    teardown.push(() => document.removeEventListener('click', onDoc));
  }
  cleanups.set(el, () => teardown.forEach((fn) => fn()));
}

export function open(target) {
  const el = resolve(target);
  if (!el || el.getAttribute('data-state') === 'open') return;
  el.setAttribute('data-state', 'open');
  el.dispatchEvent(new CustomEvent('ui:open', { bubbles: true }));
  activate(el);
}
export function close(target) {
  const el = resolve(target);
  if (!el || el.getAttribute('data-state') !== 'open') return;
  el.setAttribute('data-state', 'closed');
  el.dispatchEvent(new CustomEvent('ui:close', { bubbles: true }));
  const t = cleanups.get(el);
  if (t) { t(); cleanups.delete(el); }
}
export function toggle(target) {
  const el = resolve(target);
  if (!el) return;
  el.getAttribute('data-state') === 'open' ? close(el) : open(el);
}

/** Imperatively show a toast. Returns a dismiss() fn. */
export function toast(message, opts = {}) {
  const { type = '', timeout = 4000, position = 'top-right' } = opts;
  let c = document.querySelector('[data-toast-container]');
  if (!c) {
    c = document.createElement('div');
    c.className = C('toast-container') + (position.includes('bottom') ? ' ' + C('toast-container--bottom') : '');
    c.setAttribute('data-toast-container', '');
    c.setAttribute('role', 'region');
    c.setAttribute('aria-live', 'polite');
    c.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(c);
  }
  const el = document.createElement('div');
  el.className = C('toast') + (type ? ' ' + C('toast--' + type) : '');
  el.setAttribute('data-state', 'closed');
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.innerHTML =
    '<div class="' + C('toast__body') + '">' + message + '</div>' +
    '<button class="' + C('toast__close') + '" aria-label="Dismiss">&times;</button>';
  c.appendChild(el);
  requestAnimationFrame(() => el.setAttribute('data-state', 'open'));
  const dismiss = () => { el.setAttribute('data-state', 'closed'); setTimeout(() => el.remove(), 250); };
  el.querySelector('.' + C('toast__close')).addEventListener('click', dismiss);
  if (timeout) setTimeout(dismiss, timeout);
  return dismiss;
}

/** Activate a tab: mark it active and show its panel (data-tab="#id"), hide siblings. */
export function activateTab(tab) {
  const bar = tab.closest('.' + C('tabs'));
  if (!bar) return;
  bar.querySelectorAll('.' + C('tab')).forEach((t) => {
    const on = t === tab;
    t.classList.toggle(C('tab--active'), on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
    t.tabIndex = on ? 0 : -1;
    const sel = t.getAttribute(A('tab'));
    if (sel) { const p = document.querySelector(sel); if (p) p.hidden = !on; }
  });
}

let mounted = false;
/** Install delegated listeners for data-open / data-close / data-toggle and tabs. */
export function mount(root = document) {
  if (mounted) return; mounted = true;
  root.addEventListener('click', (e) => {
    const tabEl = e.target.closest('.' + C('tab'));
    if (tabEl && tabEl.hasAttribute(A('tab'))) return activateTab(tabEl);
    const o = e.target.closest('[' + A('open') + ']');
    if (o) { e.preventDefault(); return open(o.getAttribute(A('open'))); }
    const c = e.target.closest('[' + A('close') + ']');
    if (c) { const t = c.getAttribute(A('close')); return close(t || stateEl(c)); }
    const t = e.target.closest('[' + A('toggle') + ']');
    if (t) { e.preventDefault(); const v = t.getAttribute(A('toggle')); return toggle(v || stateEl(t)); }
  });

  // Arrow-key navigation across a .tabs bar (moves focus + activates).
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const tab = e.target.closest('.' + C('tab'));
    if (!tab) return;
    const bar = tab.closest('.' + C('tabs'));
    if (!bar) return;
    const tabs = [...bar.querySelectorAll('.' + C('tab'))];
    const i = tabs.indexOf(tab);
    e.preventDefault();
    const n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    tabs[n].focus();
    if (tabs[n].hasAttribute(A('tab'))) activateTab(tabs[n]);
  });
}

export default { configure, mount, open, close, toggle, toast, activateTab, trapFocus, lockScroll, unlockScroll };

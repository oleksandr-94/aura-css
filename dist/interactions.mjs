// src/js/interactions.js
var PFX = "";
var A = (name) => `data-${PFX}${name}`;
var C = (name) => `${PFX}${name}`;
function configure(opts = {}) {
  if (opts.prefix != null) PFX = opts.prefix ? opts.prefix + "-" : "";
}
var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
var cleanups = /* @__PURE__ */ new WeakMap();
var scrollLocks = 0;
var resolve = (t) => !t ? null : typeof t === "string" ? document.querySelector(t) : t;
var stateEl = (el) => el ? el.closest("[data-state]") : null;
function lockScroll() {
  if (scrollLocks++ === 0) document.documentElement.style.overflow = "hidden";
}
function unlockScroll() {
  if (--scrollLocks <= 0) {
    scrollLocks = 0;
    document.documentElement.style.overflow = "";
  }
}
function trapFocus(el) {
  const nodes = el.querySelectorAll(FOCUSABLE);
  (nodes[0] || el).focus?.();
  const onKey = (e) => {
    if (e.key !== "Tab" || !nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  el.addEventListener("keydown", onKey);
  return () => el.removeEventListener("keydown", onKey);
}
function activate(el) {
  const teardown = [];
  const onEsc = (e) => {
    if (e.key === "Escape") close(el);
  };
  document.addEventListener("keydown", onEsc);
  teardown.push(() => document.removeEventListener("keydown", onEsc));
  if (el.hasAttribute("data-overlay")) {
    const onClick = (e) => {
      if (e.target === el) close(el);
    };
    el.addEventListener("click", onClick);
    teardown.push(() => el.removeEventListener("click", onClick));
    lockScroll();
    teardown.push(unlockScroll);
    const prev = document.activeElement;
    teardown.push(trapFocus(el));
    teardown.push(() => prev && prev.focus && prev.focus());
  } else {
    const trg = el.querySelector("[" + A("toggle") + "]");
    if (trg) {
      trg.setAttribute("aria-expanded", "true");
      teardown.push(() => {
        trg.setAttribute("aria-expanded", "false");
        trg.focus();
      });
    }
    const items = () => [...el.querySelectorAll(FOCUSABLE)].filter((n) => !n.hasAttribute(A("toggle")));
    const list = items();
    if (list.length) setTimeout(() => list[0].focus(), 0);
    const onNav = (e) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
      const l = items();
      if (!l.length) return;
      e.preventDefault();
      const i = l.indexOf(document.activeElement);
      let n;
      if (e.key === "Home") n = 0;
      else if (e.key === "End") n = l.length - 1;
      else if (e.key === "ArrowDown") n = i < 0 ? 0 : (i + 1) % l.length;
      else n = i <= 0 ? l.length - 1 : i - 1;
      l[n].focus();
    };
    el.addEventListener("keydown", onNav);
    teardown.push(() => el.removeEventListener("keydown", onNav));
    const onDoc = (e) => {
      if (!el.contains(e.target)) close(el);
    };
    setTimeout(() => document.addEventListener("click", onDoc), 0);
    teardown.push(() => document.removeEventListener("click", onDoc));
  }
  cleanups.set(el, () => teardown.forEach((fn) => fn()));
}
function open(target) {
  const el = resolve(target);
  if (!el || el.getAttribute("data-state") === "open") return;
  el.setAttribute("data-state", "open");
  el.dispatchEvent(new CustomEvent("ui:open", { bubbles: true }));
  activate(el);
}
function close(target) {
  const el = resolve(target);
  if (!el || el.getAttribute("data-state") !== "open") return;
  el.setAttribute("data-state", "closed");
  el.dispatchEvent(new CustomEvent("ui:close", { bubbles: true }));
  const t = cleanups.get(el);
  if (t) {
    t();
    cleanups.delete(el);
  }
}
function toggle(target) {
  const el = resolve(target);
  if (!el) return;
  el.getAttribute("data-state") === "open" ? close(el) : open(el);
}
function toast(message, opts = {}) {
  const { type = "", timeout = 4e3, position = "top-right" } = opts;
  let c = document.querySelector("[data-toast-container]");
  if (!c) {
    c = document.createElement("div");
    c.className = C("toast-container") + (position.includes("bottom") ? " " + C("toast-container--bottom") : "");
    c.setAttribute("data-toast-container", "");
    c.setAttribute("role", "region");
    c.setAttribute("aria-live", "polite");
    c.setAttribute("aria-label", "Notifications");
    document.body.appendChild(c);
  }
  const el = document.createElement("div");
  el.className = C("toast") + (type ? " " + C("toast--" + type) : "");
  el.setAttribute("data-state", "closed");
  el.setAttribute("role", type === "error" ? "alert" : "status");
  el.innerHTML = '<div class="' + C("toast__body") + '">' + message + '</div><button class="' + C("toast__close") + '" aria-label="Dismiss">&times;</button>';
  c.appendChild(el);
  requestAnimationFrame(() => el.setAttribute("data-state", "open"));
  const dismiss = () => {
    el.setAttribute("data-state", "closed");
    setTimeout(() => el.remove(), 250);
  };
  el.querySelector("." + C("toast__close")).addEventListener("click", dismiss);
  if (timeout) setTimeout(dismiss, timeout);
  return dismiss;
}
function activateTab(tab) {
  const bar = tab.closest("." + C("tabs"));
  if (!bar) return;
  bar.querySelectorAll("." + C("tab")).forEach((t) => {
    const on = t === tab;
    t.classList.toggle(C("tab--active"), on);
    t.setAttribute("aria-selected", on ? "true" : "false");
    t.tabIndex = on ? 0 : -1;
    const sel = t.getAttribute(A("tab"));
    if (sel) {
      const p = document.querySelector(sel);
      if (p) p.hidden = !on;
    }
  });
}
var mounted = false;
function mount(root = document) {
  if (mounted) return;
  mounted = true;
  root.addEventListener("click", (e) => {
    const tabEl = e.target.closest("." + C("tab"));
    if (tabEl && tabEl.hasAttribute(A("tab"))) return activateTab(tabEl);
    const o = e.target.closest("[" + A("open") + "]");
    if (o) {
      e.preventDefault();
      return open(o.getAttribute(A("open")));
    }
    const c = e.target.closest("[" + A("close") + "]");
    if (c) {
      const t2 = c.getAttribute(A("close"));
      return close(t2 || stateEl(c));
    }
    const t = e.target.closest("[" + A("toggle") + "]");
    if (t) {
      e.preventDefault();
      const v = t.getAttribute(A("toggle"));
      return toggle(v || stateEl(t));
    }
  });
  root.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const tab = e.target.closest("." + C("tab"));
    if (!tab) return;
    const bar = tab.closest("." + C("tabs"));
    if (!bar) return;
    const tabs = [...bar.querySelectorAll("." + C("tab"))];
    const i = tabs.indexOf(tab);
    e.preventDefault();
    const n = e.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    tabs[n].focus();
    if (tabs[n].hasAttribute(A("tab"))) activateTab(tabs[n]);
  });
}
var interactions_default = { configure, mount, open, close, toggle, toast, activateTab, trapFocus, lockScroll, unlockScroll };
export {
  activateTab,
  close,
  configure,
  interactions_default as default,
  lockScroll,
  mount,
  open,
  toast,
  toggle,
  trapFocus,
  unlockScroll
};

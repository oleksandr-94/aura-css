import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Fresh module per test — interactions.js keeps module-level state
// (mounted flag, prefix, scroll-lock counter).
async function load() {
  vi.resetModules();
  return await import("../src/js/interactions.js");
}

beforeEach(() => {
  document.body.innerHTML = "";
  document.documentElement.style.overflow = "";
});

describe("open / close / toggle", () => {
  it("open sets data-state=open and dispatches ui:open", async () => {
    const { open } = await load();
    document.body.innerHTML = '<div id="d" data-state="closed"></div>';
    const el = document.getElementById("d");
    let fired = false;
    el.addEventListener("ui:open", () => (fired = true));
    open("#d");
    expect(el.getAttribute("data-state")).toBe("open");
    expect(fired).toBe(true);
  });

  it("close sets data-state=closed and dispatches ui:close", async () => {
    const { open, close } = await load();
    document.body.innerHTML = '<div id="d" data-state="closed"></div>';
    const el = document.getElementById("d");
    open(el);
    let fired = false;
    el.addEventListener("ui:close", () => (fired = true));
    close(el);
    expect(el.getAttribute("data-state")).toBe("closed");
    expect(fired).toBe(true);
  });

  it("toggle flips the state", async () => {
    const { toggle } = await load();
    document.body.innerHTML = '<div id="d" data-state="closed"></div>';
    const el = document.getElementById("d");
    toggle(el);
    expect(el.getAttribute("data-state")).toBe("open");
    toggle(el);
    expect(el.getAttribute("data-state")).toBe("closed");
  });

  it("open is a no-op if already open (no duplicate event)", async () => {
    const { open } = await load();
    document.body.innerHTML = '<div id="d" data-state="open"></div>';
    const el = document.getElementById("d");
    let count = 0;
    el.addEventListener("ui:open", () => count++);
    open(el);
    expect(count).toBe(0);
  });
});

describe("mount() delegation", () => {
  it("data-open opens the target on click", async () => {
    const { mount } = await load();
    document.body.innerHTML =
      '<button data-open="#m">Open</button><div id="m" data-state="closed" data-overlay></div>';
    mount();
    document.querySelector("[data-open]").click();
    expect(document.getElementById("m").getAttribute("data-state")).toBe("open");
  });

  it("data-close closes the nearest [data-state] ancestor", async () => {
    const { mount, open } = await load();
    document.body.innerHTML =
      '<div id="m" data-state="closed" data-overlay><button data-close>X</button></div>';
    mount();
    open("#m");
    document.querySelector("[data-close]").click();
    expect(document.getElementById("m").getAttribute("data-state")).toBe("closed");
  });

  it("data-toggle toggles the nearest dropdown", async () => {
    const { mount } = await load();
    document.body.innerHTML =
      '<div class="dropdown" data-state="closed"><button data-toggle>Menu</button></div>';
    mount();
    const btn = document.querySelector("[data-toggle]");
    btn.click();
    expect(document.querySelector(".dropdown").getAttribute("data-state")).toBe("open");
    btn.click();
    expect(document.querySelector(".dropdown").getAttribute("data-state")).toBe("closed");
  });
});

describe("activateTab", () => {
  it("switches the active tab and shows its panel", async () => {
    const { activateTab } = await load();
    document.body.innerHTML = `
      <div class="tabs">
        <button class="tab tab--active" data-tab="#p1">A</button>
        <button class="tab" data-tab="#p2">B</button>
      </div>
      <div id="p1"></div>
      <div id="p2" hidden></div>`;
    const [a, b] = document.querySelectorAll(".tab");
    activateTab(b);
    expect(b.classList.contains("tab--active")).toBe(true);
    expect(a.classList.contains("tab--active")).toBe(false);
    expect(b.getAttribute("aria-selected")).toBe("true");
    expect(document.getElementById("p1").hidden).toBe(true);
    expect(document.getElementById("p2").hidden).toBe(false);
  });
});

describe("scroll lock (ref-counted)", () => {
  it("stays locked until every lock is released", async () => {
    const { lockScroll, unlockScroll } = await load();
    lockScroll();
    lockScroll();
    expect(document.documentElement.style.overflow).toBe("hidden");
    unlockScroll();
    expect(document.documentElement.style.overflow).toBe("hidden");
    unlockScroll();
    expect(document.documentElement.style.overflow).toBe("");
  });
});

describe("toast()", () => {
  afterEach(() => vi.useRealTimers());

  it("creates an aria-live container + toast, then auto-dismisses", async () => {
    vi.useFakeTimers();
    const { toast } = await load();
    toast("Saved", { type: "error", timeout: 1000 });

    const c = document.querySelector("[data-toast-container]");
    expect(c).toBeTruthy();
    expect(c.getAttribute("aria-live")).toBe("polite");

    const t = c.querySelector(".toast");
    expect(t).toBeTruthy();
    expect(t.className).toContain("toast--error");
    expect(t.getAttribute("role")).toBe("alert"); // errors are assertive

    vi.advanceTimersByTime(1000); // auto-dismiss fires
    vi.advanceTimersByTime(300); // removal after the exit transition
    expect(c.querySelector(".toast")).toBeNull();
  });
});

describe("configure({ prefix })", () => {
  it("namespaces the trigger attributes", async () => {
    const { configure, mount } = await load();
    configure({ prefix: "ui" });
    document.body.innerHTML =
      '<button data-ui-open="#m">Open</button><div id="m" data-state="closed" data-overlay></div>';
    mount();
    document.querySelector("[data-ui-open]").click();
    expect(document.getElementById("m").getAttribute("data-state")).toBe("open");
  });
});

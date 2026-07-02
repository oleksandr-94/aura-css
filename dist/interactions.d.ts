// Type definitions for Aura's optional behaviour layer.
// Hand-maintained to match src/js/interactions.js.

export type Target = string | Element;

export interface ConfigureOptions {
  /** Namespace for trigger attributes AND class names, e.g. "ui" → data-ui-open / .ui-toast. */
  prefix?: string;
}

export type ToastType = "success" | "warning" | "error" | "info" | "";

export interface ToastOptions {
  type?: ToastType;
  /** Auto-dismiss after ms (0 to disable). Default 4000. */
  timeout?: number;
  /** "top-right" (default) or any string containing "bottom". */
  position?: string;
}

/** Namespace the trigger attributes and generated class names. */
export function configure(opts?: ConfigureOptions): void;

/** Install delegated listeners for data-open / data-close / data-toggle and tab roving. */
export function mount(root?: Document | Element): void;

/** Open a stateful component (sets data-state="open" + a11y behaviours). */
export function open(target: Target): void;

/** Close a stateful component. */
export function close(target: Target): void;

/** Toggle a stateful component. */
export function toggle(target: Target): void;

/** Show a toast; returns a dismiss() function. */
export function toast(message: string, opts?: ToastOptions): () => void;

/** Trap Tab focus within an element; returns a cleanup function. */
export function trapFocus(el: Element): () => void;

/** Lock / unlock document scroll (ref-counted). */
export function lockScroll(): void;
export function unlockScroll(): void;

declare const _default: {
  configure: typeof configure;
  mount: typeof mount;
  open: typeof open;
  close: typeof close;
  toggle: typeof toggle;
  toast: typeof toast;
  trapFocus: typeof trapFocus;
  lockScroll: typeof lockScroll;
  unlockScroll: typeof unlockScroll;
};
export default _default;

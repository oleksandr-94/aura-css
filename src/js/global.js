// Global (IIFE) build entry: exposes the API on a window global and
// auto-wires triggers. For <script src> without type="module".
// The global name is set at build time (--global-name), so it is not
// hard-tied to the library name.
export * from './interactions.js';
import { mount } from './interactions.js';
mount();

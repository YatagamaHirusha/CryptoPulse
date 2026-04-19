/**
 * Re-export bundled plugin. Resolves ../dist from this real directory (scoped npm symlinks break "main": "../dist/index.js").
 */
export { default } from "../dist/index.js";
export * from "../dist/index.js";

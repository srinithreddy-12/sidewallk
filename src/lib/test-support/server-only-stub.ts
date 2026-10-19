// Vitest runs server code directly under Node, not through Next's bundler —
// the real `server-only` package unconditionally throws outside that
// bundler's special-cased build step. This stub stands in for it in tests
// only (see vitest.config.mts), so files importing "server-only" for its
// real production guard against client bundling stay testable.
export {};

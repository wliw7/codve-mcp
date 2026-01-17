// src/demo/parseTimeout.ts
// Intentionally unsafe function to demo Codve CI catching failures.
// Many random inputs will crash because JSON.parse throws.

export function parseTimeout(json: string): number {
  const cfg = JSON.parse(json) as { timeout: number };

  // Also unsafe: may return undefined, but typed as number.
  return cfg.timeout;
}

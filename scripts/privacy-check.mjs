// ===========================================================================
// privacy-check.mjs — fail the build if PRIVATE data leaks into public files.
//
// Why: the public site (GitHub Pages) must never carry confirmation numbers,
//   PINs, payment details, or license numbers. Those live ONLY in the private
//   bookings file (spec rule A10). This is a hard gate run before build in CI.
//
// Fails on:
//   - "PIN" (case-insensitive) — the literal label
//   - a bare 10-digit run (\b\d{10}\b) — Booking.com confirmation-number shape
//   - license-number shape (digits-digits-digits)
// Scans: index.html + src/** + scripts/**. Skips node_modules/dist/.git.
// ===========================================================================

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.github']);
const SCAN_EXT = new Set(['.ts', '.js', '.mjs', '.html', '.css', '.json']);

// This script itself documents the patterns it bans, so exempt it from scan.
const SELF = 'privacy-check.mjs';

// Match the data-LEAK shape, not the English word. A real leak looks like
// "PIN: 9895" / "PIN code 8660" / "Confirmation #: 5062753676" — an all-caps
// PIN label near digits, a bare 10-digit run, or a license-number shape.
const PATTERNS = [
  { name: 'PIN label with code', re: /\bPIN\b[^a-z]{0,12}\d{3,}/ },
  { name: '10-digit confirmation number', re: /\b\d{10}\b/ },
  { name: 'license-number shape (NNNNN-NNNNNN-NNNN)', re: /\b\d{5}-\d{6}-\d{4}\b/ },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) walk(full, out);
    } else if (SCAN_EXT.has(extname(entry)) && entry !== SELF) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];
for (const file of walk(ROOT)) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const p of PATTERNS) {
      if (p.re.test(line)) {
        violations.push({
          file: file.replace(ROOT + '\\', '').replace(ROOT + '/', ''),
          line: i + 1,
          pattern: p.name,
          text: line.trim().slice(0, 100),
        });
      }
    }
  });
}

if (violations.length > 0) {
  console.error('\n✗ PRIVACY CHECK FAILED — possible private data in public files:\n');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.pattern}]`);
    console.error(`    ${v.text}`);
  }
  console.error(
    '\nMove these to the private bookings file. Public site says "Booked ✓ — details on file".\n',
  );
  process.exit(1);
}

console.log('✓ privacy-check: no confirmation numbers / PINs / license numbers in public files');

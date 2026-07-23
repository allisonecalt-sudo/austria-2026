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
  // Added 2026-07-23. The audit sweep decrypted the LIVE private page using a
  // password that had been left as a DEFAULT VALUE in seal-trip-info.mjs and
  // pushed to the public repo — sitting right next to the PBKDF2 salt and the
  // Supabase anon key. The crypto was fine; the key material was published.
  // This gate makes the same mistake fail the build instead of shipping.
  {
    name: 'hardcoded password / secret literal',
    // The real shape is a password-ish NAME, then an assignment or fallback
    // operator, then a quoted literal — which catches `= "x"`, `?? "x"`,
    // `|| "x"` and `password: "x"`. The gap allows the env-var read that sits
    // between them in `process.env.TRIP_INFO_PASSWORD ?? "..."`, which is
    // exactly the line that leaked and which a tighter pattern missed.
    re: /\b(PASSWORD|PASSPHRASE|PASSCODE|SECRET)\b[^\n'"`]{0,60}(\?\?|\|\||=|:)\s*["'`][^"'`\n]{3,}["'`]/i,
  },
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

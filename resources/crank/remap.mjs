#!/usr/bin/env node
// crank v8-shadow remap: raw V8 block coverage + shadow-cljs source maps -> IR hit records.
//
// Port of the validated moonlander join prototype (moonlander-crap-feasibility report,
// Appendix A), parameterized but semantically unchanged:
//   - each V8 block is attributed by its START offset (basic-block entry semantics)
//   - gap-tolerant forward scan to the next mapped segment, bounded by the block's
//     own end offset (shadow-cljs maps have gaps between segments)
//   - one IR record per V8 range, per run; dedup/counting happens downstream in
//     crank.core (records sharing a line are counted separately, by design)
//
// usage: node remap.mjs --pair <v8-dir>=<runtime-dir> [--pair ...] --include <regex>
//
// Output: JSONL on stdout, one {"file","line","hits"} record per remapped block,
// then a final {"summary": ...} line with skip counters. A coverage entry whose url
// matches --include but cannot be resolved to exactly one file under its paired
// runtime dir is a hard error (exit 1): silently dropping it would fabricate
// "never loaded" for the defns it covers.

import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

// Resolve trace-mapping from the CALLER's project (cwd), not from this script's
// location: crank is consumed as a git dep, so the pinned @jridgewell/trace-mapping
// lives in the adopting repo's node_modules.
const require = createRequire(path.join(process.cwd(), 'package.json'));
const {TraceMap, originalPositionFor} = require('@jridgewell/trace-mapping');

const usage = 'usage: remap.mjs --pair <v8-dir>=<runtime-dir> [--pair ...] --include <regex>';
const fail = (msg) => { console.error(`remap: ${msg}`); process.exit(1); };

// ---- args -------------------------------------------------------------------
const pairs = [];
let include = null;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--pair') {
    const spec = args[++i] ?? fail(usage);
    const eq = spec.indexOf('=');
    if (eq <= 0) fail(`--pair expects <v8-dir>=<runtime-dir>, got ${spec}`);
    pairs.push({v8Dir: spec.slice(0, eq), runtimeDir: spec.slice(eq + 1)});
  } else if (args[i] === '--include') {
    include = new RegExp(args[++i] ?? fail(usage));
  } else fail(usage);
}
if (!pairs.length || !include) fail(usage);

// ---- runtime file resolution -------------------------------------------------
// A coverage url is resolved by basename under the paired runtime dir; when
// several builds hold the same basename, the candidate sharing the longest
// path suffix with the url wins. A tie or a miss is a hard error.
const indexRuntime = (dir) => {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, {withFileTypes: true})) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) out.push(p);
    }
  };
  walk(dir);
  return out;
};
const segments = (p) => p.split('/').filter(Boolean);
const commonSuffix = (a, b) => {
  const as = segments(a), bs = segments(b);
  let n = 0;
  while (n < as.length && n < bs.length && as[as.length - 1 - n] === bs[bs.length - 1 - n]) n++;
  return n;
};
const resolveUrl = (url, runtimeFiles) => {
  const urlPath = url.replace(/^file:\/\//, '');
  const base = path.basename(urlPath);
  const candidates = runtimeFiles.filter((f) => path.basename(f) === base);
  if (!candidates.length) return {error: `no file named ${base} under runtime dir`};
  const scored = candidates.map((f) => ({f, n: commonSuffix(urlPath, f)}));
  scored.sort((x, y) => y.n - x.n || x.f.localeCompare(y.f));
  if (scored.length > 1 && scored[0].n === scored[1].n)
    return {error: `ambiguous runtime file for ${base}: ${scored[0].f} | ${scored[1].f}`};
  return {file: scored[0].f};
};

// ---- offset -> line/column + gap-tolerant remap (Appendix A, verbatim) -------
const offsetToLineCol = (code) => {
  const starts = [0];
  for (let i = 0; i < code.length; i++) if (code[i] === '\n') starts.push(i + 1);
  return (off) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= off) lo = mid; else hi = mid - 1; }
    return {line: lo + 1, column: off - starts[lo]};
  };
};
let CODE = '';
const remapWithFallback = (map, toLC, off, maxOff) => {   // shadow maps have gaps;
  for (let o = off; o <= Math.min(maxOff, off + 4000); o++) {  // scan to next segment
    const p = originalPositionFor(map, toLC(o));
    if (p.source) return p;
    const nl = CODE.indexOf('\n', o);
    if (nl === -1 || nl > maxOff) break;
    o = nl;
  }
  return null;
};

// ---- main --------------------------------------------------------------------
const counters = {records: 0, unmapped: 0, mapMissing: 0, outsideInclude: 0, entries: 0};
const emit = (rec) => { process.stdout.write(JSON.stringify(rec) + '\n'); counters.records++; };

for (const {v8Dir, runtimeDir} of pairs) {
  if (!fs.existsSync(runtimeDir)) fail(`runtime dir not found: ${runtimeDir}`);
  const runtimeFiles = indexRuntime(runtimeDir);
  const covFiles = fs.readdirSync(v8Dir).filter((x) => x.endsWith('.json'));
  for (const f of covFiles) {
    const raw = JSON.parse(fs.readFileSync(path.join(v8Dir, f), 'utf8'));
    for (const r of raw.result) {
      if (!include.test(r.url)) { counters.outsideInclude++; continue; }
      counters.entries++;
      const resolved = resolveUrl(r.url, runtimeFiles);
      if (resolved.error) fail(`${resolved.error} (url ${r.url})`);
      const jsPath = resolved.file;
      if (!fs.existsSync(jsPath + '.map')) { counters.mapMissing++; continue; }
      const code = fs.readFileSync(jsPath, 'utf8'); CODE = code;
      const map = new TraceMap(JSON.parse(fs.readFileSync(jsPath + '.map', 'utf8')));
      const toLC = offsetToLineCol(code);
      for (const fn of r.functions) for (const b of fn.ranges) {
        // attribute a block by its START position (basic-block entry semantics)
        const os = remapWithFallback(map, toLC, b.startOffset, b.endOffset);
        if (!os || !os.source) { counters.unmapped++; continue; }
        emit({file: os.source, line: os.line, hits: b.count});
      }
    }
  }
}
emit({summary: counters});

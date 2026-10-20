# Golden fixture: schairs-user-service lane (JVM Clojure, `:cloverage-lcov`)

**Provenance: CONSTRUCTED, not captured.** The schairs-user-service repository was
not available on the host where this fixture was built. These inputs were written
by hand to the *real formats* the design spec pins down, and they are the realest
inputs that could honestly be produced without the repository:

- `lcov.info` - real Cloverage LCOV format (`TN:` / `SF:` / `DA:` / `LF:` / `LH:` /
  `end_of_record`; Cloverage emits no `FN`/`BRDA` records), two `SF` sections, hits
  chosen so the fixture exercises: a fully-covered defn, a partially-covered defn,
  a never-called defn in a covered file (true 0%, warn band), and a never-called
  complex `-main` (gate breach).
- `kondo-analysis.json` - real clj-kondo analysis shape (`:analysis
  :var-definitions` entries with the key set kondo v2025.10.23 emits), line extents
  consistent with the `DA:` lines in `lcov.info`.
- `crapper.edn` - real `.metrics/crap.edn` shape emitted by crapper `9f1bead`
  (`{:name :namespace :complexity :coverage nil :crap nil}` entries, **no line
  numbers** - which is why this lane joins CC to extents by `(ns, name)`).

The namespace/file names (`schairs-user-service.users`, `.core`,
`src/main/schairs_user_service/…`) are plausible inventions, not knowledge about
the real repository. The CC values are assigned, not measured.

`expected.edn` pins the table crank must produce, hand-computed with the spec
formula `CRAP = CC^2 * (1-cov)^3 + CC` (line coverage; cov = covered `DA` /
total `DA` inside each defn's kondo extent).

**Not a differential test.** The spec (§11.2) calls for checking this lane
*differentially* against crapper's own CRAP output for the same coverage run.
That check requires the real schairs checkout and its real Cloverage run; it is a
schairs-side adoption step (design spec §10.1 step 5), not something this fixture
can perform. This fixture proves the parse + join + math on the real formats;
it does not prove agreement with crapper's internal join.

# Golden fixture: schairs-user-service lane (JVM Clojure, `:cloverage-lcov`)

**Provenance: MIXED - the crapper input is a real capture; the coverage and kondo
inputs remain CONSTRUCTED.** The schairs-user-service repository was not available
on the host where this fixture was built.

- `crapper.edn` - **CAPTURED from a real run.** Real crapper `9f1bead`
  (`pip install git+https://github.com/unclebob/crapper@9f1bead`) was run on
  2026-10-21 with `--no-coverage` against the Clojure tree under `src/` in this
  fixture directory (`src/main/schairs_user_service/{users,core}.clj`, written
  for this purpose - plausible inventions, not the real schairs code), and this
  file is its `.metrics/crap.edn` output copied verbatim, byte for byte. It is
  the real `{:entries [...]}` map shape crapper `9f1bead` emits (entries
  `{:name :namespace :complexity :coverage nil :crap nil}`, **no line numbers** -
  which is why this lane joins CC to extents by `(ns, name)`). The CC values in
  `expected.edn` are crapper's *measured* values from that run; an earlier
  version of this fixture was hand-constructed as a bare vector of entries with
  assigned CCs, a shape the real tool never writes - that drift is what this
  capture fixes.
- `lcov.info` - CONSTRUCTED. Real Cloverage LCOV format (`TN:` / `SF:` / `DA:` /
  `LF:` / `LH:` / `end_of_record`; Cloverage emits no `FN`/`BRDA` records), two
  `SF` sections, hits chosen so the fixture exercises: a fully-covered defn, a
  partially-covered defn, a never-called defn in a covered file (true 0%, warn
  band), and a never-called complex `-main` (gate breach).
- `kondo-analysis.json` - CONSTRUCTED. Real clj-kondo analysis shape (`:analysis
  :var-definitions` entries with the key set kondo v2025.10.23 emits), line extents
  consistent with the `DA:` lines in `lcov.info`.

The namespace/file names (`schairs-user-service.users`, `.core`,
`src/main/schairs_user_service/…`) are plausible inventions, not knowledge about
the real repository.

`expected.edn` pins the table crank must produce, hand-computed with the spec
formula `CRAP = CC^2 * (1-cov)^3 + CC` from the *measured* crapper CCs and the
constructed line coverage (cov = covered `DA` / total `DA` inside each defn's
kondo extent). The expectations that changed with the real capture:
`delete-user!` measures CC 4 (not the assigned 3), so its 0%-coverage CRAP is
20.00, and the `parse-port`/`find-user` tie at CRAP 2.00 orders by their real
entry order in the capture.

**Not a differential test.** The spec (§11.2) calls for checking this lane
*differentially* against crapper's own CRAP output for the same coverage run.
That check requires the real schairs checkout and its real Cloverage run; it is a
schairs-side adoption step (design spec §10.1 step 5), not something this fixture
can perform. This fixture proves the parse + join + math on the real formats;
it does not prove agreement with crapper's internal join.

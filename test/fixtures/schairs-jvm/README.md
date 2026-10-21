# Golden fixture: schairs-user-service lane (JVM Clojure, `:cloverage-lcov`)

**Provenance: CAPTURED - all three inputs are real tool output describing one
revision: the checked-in `src/` tree in this directory.** The
schairs-user-service repository was not available on the host where this fixture
was built, so the `src/main/schairs_user_service/{users,core}.clj` sources are
plausible inventions written for this purpose, not the real schairs code - but
every tool artifact below is the verbatim output of the real pinned tool run
against exactly those checked-in sources.

**Copy-out discipline (all three captures).** crapper `9f1bead`'s discovery
(`discover.py` `is_test_file`) excludes any file whose path contains a `test`
component, so running it in place against `test/fixtures/schairs-jvm/src`
reports "No source files to analyze". Every capture below was therefore run
against a byte-identical copy of this fixture's `src/` tree at a test-free
scratch path (e.g. `SCRATCH=$(mktemp -d); cp -R src "$SCRATCH/"`), with the
tool's working directory at the scratch root so artifact paths come out as
`src/main/...`, exactly as checked in.

- `crapper.edn` - **CAPTURED from a real run.** Real crapper `9f1bead`
  (`9f1bead298b5a9d576bdd6319289fcf426e5b18a`, `pip install
  git+https://github.com/unclebob/crapper@9f1bead`), run on 2026-10-21 with
  `crapper --no-coverage --root "$SCRATCH" src/main` against the copied tree;
  this file is its `.metrics/crap.edn` copied verbatim, byte for byte. It is
  the real `{:entries [...]}` map shape crapper `9f1bead` emits (entries
  `{:name :namespace :complexity :coverage nil :crap nil}`, **no line numbers** -
  which is why this lane joins CC to extents by `(ns, name)`). An earlier
  version of this fixture was hand-constructed as a bare vector of entries with
  assigned CCs, a shape the real tool never writes - that drift is what this
  capture fixes.
- `kondo-analysis.json` - **CAPTURED from a real run.** Real clj-kondo
  `2025.10.23`, run on 2026-10-21 from the scratch root as `clj-kondo --lint
  src/main --config '{:output {:analysis true :format :json}}'` (the same
  invocation crank's adapter uses), output copied verbatim, byte for byte. Its
  `var-definitions` extents are the real analysis of the checked-in sources
  (`delete-user!` rows 17-22, `create-user` 10-15, `parse-port` 5-8, `-main`
  10-18).
- `lcov.info` - **CAPTURED from a real run.** Real Cloverage `1.2.4`
  (`cloverage/cloverage` from Clojars), run on 2026-10-21 in the scratch copy
  as a minimal deps project (`:paths ["src/main" "test"]`) with the checked-in
  coverage check copied in as `test/schairs_user_service/coverage_check.clj`
  (kept in this fixture at `coverage-capture/coverage_check.clj`), via
  `clojure -M -m cloverage.coverage --lcov --no-html -o . -p src/main -s test`;
  `lcov.info` copied verbatim, byte for byte. The coverage check exercises
  `find-user` fully (both branches), `create-user` partially (valid call only;
  the `when-not` throw lines stay at 0 hits) and `parse-port` fully (called via
  its private var), and never calls `delete-user!` or `-main`. This is a real
  Cloverage run over the fixture sources - it is *not* coverage of the real
  schairs repository, and it demonstrates line coverage only.

**Reading the real coverage.** Real Cloverage counts each `(defn ...)` form
itself as covered once (the form is evaluated at namespace load), so the two
never-called defns are not literal 0%: `delete-user!` covers 1 of its 6 DA
lines (the defn line) and `-main` 1 of its 9. The fixture's teaching cases
survive as real behavior: `find-user` fully covered, `create-user` partially
covered, `delete-user!` a never-called defn in a covered file in the warn band
(CRAP 13.26), and `-main` a never-called complex defn breaching the 30 gate
(CRAP 31.28).

`expected.edn` pins the table crank must produce, hand-computed with the spec
formula `CRAP = CC^2 * (1-cov)^3 + CC` from the captured crapper CCs and the
captured line coverage (cov = covered `DA` / total `DA` inside each defn's
kondo extent): `-main` 36*(8/9)^3+6 = 31.28, `delete-user!` 16*(5/6)^3+4 =
13.26, `create-user` 16*(1/3)^3+4 = 4.59, and the `parse-port`/`find-user` tie
at 2.00 ordering by their real entry order in the crapper capture.

**Not a differential test.** The spec (§11.2) calls for checking this lane
*differentially* against crapper's own CRAP output for the same coverage run.
That check requires the real schairs checkout and its real Cloverage run; it is a
schairs-side adoption step (design spec §10.1 step 5), not something this fixture
can perform. This fixture proves the parse + join + math on the real formats
against one consistent revision of real sources; it does not prove agreement
with crapper's internal join.

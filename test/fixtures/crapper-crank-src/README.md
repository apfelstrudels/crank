# Parser fixture: real crapper 9f1bead output, captured against crank's own src

**Provenance: CAPTURED, not constructed.** `crap.edn` is a real
`.metrics/crap.edn` written by crapper `9f1bead`
(`9f1bead298b5a9d576bdd6319289fcf426e5b18a`, `pip install
git+https://github.com/unclebob/crapper@9f1bead`), run with `--no-coverage
--root <scratch outside the repo>` on 2026-10-21 against crank's own `src/`
tree at `1c61edf` (the tip of the branch that fixes the crapper-lane parser -
the tree the tests actually exercise). It was copied here verbatim, byte for
byte, and is *not* trimmed or excerpted: all 36 defns in that tree are present,
worst `crank.main/validate-config` CC 16.

**Why this fixture exists.** The original crapper-lane golden fixture
(`schairs-jvm/crapper.edn`) was hand-constructed as a bare vector of entries - a
shape real crapper never writes - so the parser shipped demanding that shape and
could not parse real crapper output at all (the schairs adoption blocker). This
fixture is the regression anchor for that class of drift (design spec §11: golden
fixtures are captured from real runs): `crank.crapper-test` parses this exact
file and pins the full parsed entry set, so any future parser change that stops
accepting real tool output fails loudly.

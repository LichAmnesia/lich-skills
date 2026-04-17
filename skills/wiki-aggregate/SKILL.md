---
name: wiki-aggregate
description: Use when you have N≥3 raw research artifacts (notes, podcast summaries, deep-research dumps, daily intel, paper analyses) on one topic and want to lift them into a single structured pack with cross-source claims and provenance — instead of one-shot summarization that loses 90% of intermediate evidence. Treats the N sources as an environment a lite aggregator agent navigates with `inspect` / `search` / `synthesize` tools, rather than concatenating into one prompt.
---

# Wiki Aggregate — N raw sources → 1 structured pack

A protocol for **agentic aggregation** of long-horizon research material. Inverts the standard "concat all → ask LLM to summarize" pipeline: instead, an aggregator agent navigates the N source files with three tools, building a notes scratchpad with full `path:line` provenance, and finally writes a structured pack (brief / findings / sources / aggregation log).

**Core principle**: don't read everything upfront. Don't merge final answers. Treat the N sources as a queryable environment.

## Why this exists

Three traditional ways to aggregate N parallel research outputs all fail on long-horizon, open-ended tasks:

```
  ❌ concat all sources into one prompt
       → 200K+ token explosion, attention collapse on long context

  ❌ summarize each, then merge summaries
       → ~90% of intermediate evidence (the "I noticed X but..." asides) is lost

  ❌ LLM-as-judge picks the single best source
       → discards the other N-1 sources' independent findings
```

These failure modes show up clearly on open-ended research tasks where there's no ground-truth `verifier`. The alternative: treat the N sources as an `environment`, send a `lite agent` in to `inspect / search / synthesize` on demand. Cost ≈ a single rollout, recall is materially higher, and cross-source contradictions get surfaced explicitly.

This skill is the protocol. No Python, no MCP — pure markdown protocol that any harness with `Read` + `Grep` can execute.

## When to Use

- You have 3-30 raw notes / transcripts / research dumps on one topic, scattered across files
- The current pack on this topic feels thin or you suspect raw evidence wasn't fully lifted
- You want claims with `path:line` provenance, not vibes
- You want cross-source contradictions surfaced, not buried

## When NOT to Use

- N < 3 sources — protocol overhead exceeds value, just write a summary by hand
- N > 30 — budget will be exhausted; narrow the scope or batch by sub-topic
- Sources are not yet collected — this is a synthesis tool, not a research tool. Run your collectors first.
- You only need a one-shot Q&A — use a reactive `wiki-ask`-style skill instead

## The Aggregation Loop

```
                    Trajectories-as-environment
            ╔════════════════════════════════════════╗
            ║                                        ║
            ║   src_1   src_2   src_3  ...   src_N   ║
            ║   [..]    [..]    [..]         [..]    ║
            ║   [..]    [..]    [..]         [..]    ║
            ║                                        ║
            ╚═══════════════════╤════════════════════╝
                                │
                                │  not concatenated.
                                │  not summarized.
                                │  navigated.
                                │
                                ▼
            ┌────────────────────────────────────────┐
            │       AGGREGATOR (lite agent)          │
            │  ┌──────────────────────────────────┐  │
            │  │  inspect_file / inspect_section  │  │
            │  │  search_sources                  │  │
            │  │  cross_pack_check                │  │
            │  └──────────────────────────────────┘  │
            │                                        │
            │  scratch state:                        │
            │   notes   = []   # {claim, evidence,   │
            │                  #  source, line_ref}  │
            │   budget  = 25   # tool calls          │
            │   subtopics = derived from skim pass   │
            │                                        │
            │  loop until: subtopic coverage met,    │
            │              OR budget = 0,            │
            │              OR 2 zero-info calls      │
            └───────────────────┬────────────────────┘
                                │
                                ▼
                ┌─────────────────────────────┐
                │   pack/                     │
                │     brief.md                │
                │     findings.md   ← claims  │
                │     sources.tsv   ← S-IDs   │
                │     _aggregation_log.md     │
                └─────────────────────────────┘
```

## Process

### Phase 1: Scope

1. Resolve the source glob. Count N.
2. **Hard stop if N < 3** — abort and tell the user to either collect more or summarize manually.
3. **Warn if N > 30** — suggest narrowing by sub-topic or batching across runs.
4. If updating an existing pack, locate it and read its current `brief.md` + `findings.md` so you know what already exists.

### Phase 2: Cheap-Pass (Skim)

For each source, do **one** cheap read:
- File ≤ 200 LOC: read the whole file.
- File > 200 LOC: read first 80 lines (frontmatter + intro + section headers).

Build an in-memory source map:

```
S1  | path/to/source_1.md  | what it covers (1-2 lines) | rough_topics
S2  | path/to/source_2.md  | ...                        | ...
```

This pass costs ~N reads, each bounded. **Do not skip** — the source map is what makes Phase 3 efficient.

### Phase 3: Aggregator Loop (budget = 25 by default)

**Tool inventory** (use whatever your harness provides — `Read`, `Grep` are sufficient):

| Verb | Implementation | When to use |
|---|---|---|
| `inspect_file(path)` | `Read` whole file | Source < 200 LOC and you need full content |
| `inspect_section(path, line_range)` | `Read` with `offset` + `limit` | Drilling into a specific span of a long source |
| `search_sources(pattern)` | `Grep` over the N source paths only | Finding a keyword / theme across sources |
| `cross_pack_check(pattern)` | `Grep` over your wider knowledge base, excluding the target pack and the raw sources | Avoiding duplicate claims with existing packs |

**Loop discipline**:

```
state.notes = []
state.budget = 25  (or user-specified)

while state.budget > 0:
    pick highest-value next action:
      drill         — a subtopic has a hot lead in one source
      cross_search  — a claim from S1 should be cross-checked against others
      dedup_check   — a claim looks novel; verify no existing pack covers it
      resolve       — two sources disagree; inspect both passages
      explore       — a subtopic has zero notes after Phase 2; broaden search
      DONE          — coverage threshold met

    record note → {claim, evidence_quote, source_id, line_ref, confidence}
    state.budget -= 1
```

**Stopping criteria** — declare DONE when ANY holds:
- ≥3 high-confidence notes per subtopic
- Budget exhausted
- Two consecutive tool calls returned no new info

**Hard rule**: every note MUST have a `source_id` + `line_ref` (path + line range).
**No provenance, no claim.** This is what makes the pack auditable.

### Phase 4: Write the Pack

Output location: `<pack-name>/`. If updating, merge with existing files (preserve original sources for existing claims, add new claims, flag superseded ones).

**Files**:

1. **`brief.md`** — 200-400 word executive overview. Subtopic skeleton. Reading order suggestion.

2. **`findings.md`** — claims, one block per finding, grouped under subtopic headers:

   ```markdown
   ## Claim: <one-line claim>
   Status: supported | contradicted | uncertain
   Confidence: high | medium | low
   Sources: S1, S3, S7
   Evidence:
   - "exact quote or paraphrase" — S1 (path/to/source.md:L120-128)
   - "..." — S3 (path/to/other.md:L45-50)
   Notes: <optional — e.g., "S3 contradicts S7 on date">
   ```

3. **`sources.tsv`** — S-ID mapping:

   ```tsv
   id   path                          type             captured_at   url_or_origin
   S1   path/to/source_1.md           podcast-notes    2026-04-12    https://...
   S2   path/to/source_2.md           daily-intel      2026-04-13    ...
   ```

4. **`_aggregation_log.md`** — always written. Audit trail:

   ```markdown
   # Aggregation Log
   Date: YYYY-MM-DD
   Topic: <topic>
   Sources: N=<N>
   Tool calls: X / budget Y
   Cross-pack overlaps: <list or "none">
   Subtopics covered: <list>
   Skipped sources (no relevant content): <list>
   Stopping criterion triggered: <which one>
   ```

### Phase 5: Index hint

Append a one-line entry to your pack index (do **not** trigger a full reindex — that's a different skill's job).

### Phase 6: Report

Print:

```
Pack written: <pack-name>/
Sources processed: N
Aggregator tool calls: X / budget Y
Subtopics: K
Claims extracted: M (high: a, medium: b, low: c)
Cross-pack overlaps: <list or "none">
Sources with low yield: <list>
Suggested next: <reindex command> && <lint command>
```

## Anti-rationalizations

| Excuse the agent will invent | Rebuttal |
|---|---|
| "I'll just read all N files in Phase 2 to be safe" | That's the V1 mistake this skill exists to fix. Long-context attention degrades; you'll lose information you "read." Stay disciplined: cheap-pass first, drill on demand. |
| "Skipping `cross_pack_check` — it's a small repo" | Repos grow. Duplicate claims accumulate silently. One `Grep` per novel claim costs almost nothing. |
| "I have a great quote but I don't remember the line number" | Then the note is invalid. Re-`Read` to get `path:L<lines>`. **No provenance, no claim** — refuse to write `findings.md` if any note is missing. |
| "Only 2 sources matched the glob — I'll proceed anyway" | No. Hard stop at N < 3. Either collect more or write a summary by hand. The protocol overhead is wasted on small N. |
| "All sources got 'low yield' — I'll write findings from my prior knowledge" | No. The pack is supposed to reflect what's in the sources. If yield is low, the brief is empty + log says so. Don't fabricate. |
| "I'll skip writing `_aggregation_log.md`, it's just paperwork" | No. The log is what makes the next run reproducible. It's also the audit trail when someone questions a claim months later. |

## Verification

A successfully completed run produces:

- [ ] `<pack-name>/brief.md` exists, ≤ 400 words, organized by subtopic
- [ ] `<pack-name>/findings.md` exists; **every** `## Claim:` block has ≥1 `Evidence:` line with `path:L<lines>` provenance
- [ ] `<pack-name>/sources.tsv` exists with N rows matching N sources
- [ ] `<pack-name>/_aggregation_log.md` exists with tool-call count and stopping reason
- [ ] Tool budget utilization ≥ 30% (if much lower, sources were too pre-digested or coverage was shallow — re-evaluate)
- [ ] Source utilization ≥ 80% (if much lower, glob was wrong or aggregator skipped sources — investigate)
- [ ] At least one cross-source signal: either ≥1 claim cites multiple sources, OR ≥1 contradiction is logged

If any checkbox fails, the run is incomplete — do not declare DONE.

## Related skills in this repo

- `debug-hypothesis` — same disciplined-loop pattern, applied to bug investigation rather than research synthesis
- `spec-driven-dev` — same explicit-exit-criteria philosophy, applied to building software end-to-end

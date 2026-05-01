---
name: subagent-brief
description: Use BEFORE invoking the Task or Agent tool to spawn a subagent. Anthropic does NOT share prefix cache across subagents — every subagent cold-starts and re-tokenizes its full prompt (system prompt + tool definitions + the context you handed it). Spawning N subagents with full context = N× token cost; a single fan-out can burn an entire Max-plan day. This skill enforces a pre-flight discipline: compress every subagent prompt into a ≤200-word brief before spawning. Triggers when the agent is about to call Task / Agent tool, especially with long files, full repo dumps, or N parallel subagents on similar work.
---

# Subagent Brief Discipline

Pre-flight checklist for spawning subagents in Claude Code. The single most
expensive mistake in multi-agent workflows is treating subagents as free
threads. They are not. Each subagent is an independent LLM call that
re-tokenizes the entire prompt you hand it.

There is **no prefix sharing across subagents** in Anthropic's serving stack
today. The multi-agent topology is a known optimization opportunity (see
arXiv 2604.25899 *Pythia: Predictability-Driven Agent-Native LLM Serving*,
2026-04) but has not yet shipped in production. Until it does, the burden
of compression falls on the orchestrating agent.

The math: 20 subagents × 50K shared context = ~1M tokens per fan-out. One
careless Task call exhausts a Max-plan daily quota.

## When to Use

- About to invoke the Task tool or any subagent-spawning tool
- About to fan out N parallel subagents on similar tasks
- Subagent prompt is shaping up longer than ~200 words
- About to embed a long file, full repo dump, or full PRD in a subagent prompt
- The user is on a metered plan (Max / Pro / API) and has not signaled "burn budget"

## When NOT to Use

- Spawning a single subagent with a one-line task ("read X and summarize")
- The subagent genuinely needs the full document (translation, full audit, line-by-line review)
- Throwaway exploration where token cost truly does not matter
- The orchestrator already received a compressed brief from the user — pass it through, do not re-compress

## The Discipline

For every subagent you are about to spawn, apply these five rules in order.

### 1. Strip your own context

The subagent gets its own system prompt, its own tool list, and its own
task framing automatically. Do **not** paste your own conversation history,
your TODO list, or your reasoning trail into the subagent prompt unless
the subagent literally needs them to do its job.

### 2. Replace files with paths

```
BAD:  Here is the full content of foo.py: <800 lines>
GOOD: Read /abs/path/to/foo.py and report the public API.
```

The subagent has Read access. One Read call is cheaper than re-tokenizing
800 lines on every spawn.

### 3. Replace context with summaries

```
BAD:  <entire 50K context window dump> — now look for X
GOOD: Project context: <3-line summary>. Look for X in <specific path>.
```

If you genuinely synthesized something useful from your context, summarize
it in 1-3 sentences and pass that summary. Never paste the raw window.

### 4. Compress to ≤200 words

The brief should fit in a tweet-length window. If it does not, you are
either dumping context the subagent can fetch itself, or handing over a
task too large for one subagent — split it.

### 5. Fan-out check

Before spawning N parallel subagents, ask: do they all share the same long
context? If yes, you are about to multiply cost by N. Either:

- Spawn **1 subagent** that handles all N items sequentially, **or**
- Pre-compute a shared brief once and hand each subagent only the *delta*
  (the per-item task), not the shared context.

## The Brief Template

```
ROLE:    <one line — what this subagent is>
GOAL:    <one line — what it should produce>
INPUTS:
  - <path or 1-line summary, never raw content>
  - <path or 1-line summary>
CONSTRAINTS:
  - <output format, what NOT to do>
RETURN:  <one line — what to report back>
```

Total ≤ 200 words. If it does not fit, the task is too large for one
subagent. Split it.

## Rationalizations to Reject

| Excuse | Reality |
|---|---|
| "Faster to just paste the whole file." | Faster for *you*. The subagent re-tokenizes 800 lines on every spawn. |
| "Parallelism will be 5× faster." | 5× faster wall-clock, 5× more tokens — and Max plan caps are *daily*, not hourly. The hourly speedup costs you the rest of the day. |
| "The subagent needs context." | It needs *information*. A summary is information. The raw window is dump. |
| "I'll just pass the whole repo, it's small." | "Small" repos compound across 10 subagents into a Max-plan kill. |
| "I don't have time to summarize." | Summarizing forces you to clarify what the subagent should do — which is 80% of why subagents fail anyway. |
| "The user wanted parallel." | The user wanted *fast*. Token-budget parallel ≠ wall-clock parallel. Default to sequential unless tasks are genuinely independent. |

## After the Brief

Spawn the subagent. Then evaluate:

- Returned with **hallucinated assumptions** → brief was too vague. Add a
  constraint and re-spawn (rare).
- Asked for **more context** → brief was too thin. Add the missing fact and
  re-spawn (rare).
- **Succeeded** → brief was right-sized. This is the common case if you
  followed the five rules.

Most "subagent failures" are brief failures, not subagent failures.

## Red Flags in Your Own Output

If you catch yourself writing any of these in a subagent prompt, stop and
re-compress:

- Three or more paragraphs of background before the actual task
- Verbatim file contents longer than 20 lines
- The phrase "for context, here is..."
- Lists of things the subagent "might want to know"
- More than one task per subagent (split into separate Task calls instead)

## Why This Skill Exists

Multi-agent serving is a 2026 research topic, not a shipped feature.
arXiv 2604.25899 (Pythia, 2026-04) demonstrates that exposing multi-agent
topology to the serving layer can recover 3-5× of wasted tokens via prefix
sharing — but no production LLM provider has shipped this yet. Anthropic,
OpenAI, Codex: every subagent today is a cold-start, full-prefix
re-tokenization.

Until that changes, **the brief is the only knob you have.** Use it.

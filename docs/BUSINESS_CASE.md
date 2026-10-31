# Business case: PostAssist

**A researched, fact-checked LinkedIn post about a machine-learning paper, drafted by a team of agents.**

## Who buys this

The buyer is a marketing or developer-relations lead at an AI company, research lab or consultancy that wants a steady stream of posts about research. The users are writers and engineers who publish under their own names.

## The problem and what it costs

Writing a good post about a paper needs two skills: understanding the paper and writing for LinkedIn. That takes an expert's time. LLMs can draft, but unchecked drafts can get the technical facts wrong. PostAssist adds a checking team before a human sees the draft. Gartner predicted that at least 30% of generative AI projects would be abandoned after proof of concept by the end of 2025 ([Gartner, 2024](https://www.gartner.com/en/newsroom/press-releases/2024-07-29-gartner-predicts-30-percent-of-generative-ai-projects-will-be-abandoned-after-proof-of-concept-by-end-of-2025)), so a narrow, measurable use like this is a better bet than a broad one.

## How the repo solves it

| Need | What in the repo does it |
|---|---|
| Research | A LangGraph team that looks up the paper (Tavily web search) |
| Write | A writing agent that drafts the LinkedIn post |
| Check | A second team that checks technical accuracy and style before returning the post |
| Run asynchronously | `/generate-post` returns a `task_id`, and the UI polls `/status/{task_id}`. Tasks live in Redis for 2 hours, with an in-memory fallback. |
| UI | A Next.js frontend |

## Use-case scenarios

All of these organisations are fictional.

1. **An AI consultancy's founder** turns one new paper a week into a post, then edits it in ten minutes.
2. **A university lab's comms officer** drafts posts about the lab's own papers and has the authors check them.
3. **A developer-relations team** keeps a weekly "paper of the week" series going.

## ROI: a worked model (illustrative)

These figures are **illustrative assumptions** unless a source is linked.

| Input | Value | Basis |
|---|---|---|
| Posts a month | 8 | Assumption |
| Hours per post by hand (read, write, check) | 2 | Assumption |
| Hours per post with a checked draft | 0.5 | Assumption |
| Expert loaded cost an hour | US$83 | BLS May 2024 median for software developers, $63.98 an hour ([BLS OEWS](https://www.bls.gov/news.release/archives/ocwage_04022025.pdf)), multiplied by an assumed 1.3 for overhead |

Saving: 8 × 1.5 h × 12 × $83 ≈ **US$12,000 a year**, minus model and search API costs.

## Path to production

1. Measure edit time and factual errors on 20 real papers before relying on it.
2. Add the paper text itself (PDF) as a source, not just web search.
3. Keep a human approval step before anything is published.

## Risks and limits

- Model-written posts can sound generic, and audiences notice.
- Fact-checking by another model reduces errors but doesn't remove them.
- The repo's screenshots were taken without API keys, so no generated output is shown.

**Case strength:** **Weak to moderate.** The workflow is real, but the savings are small and the quality is unproven.

## Sources

- Gartner (2024), 30% of GenAI projects abandoned after proof of concept: https://www.gartner.com/en/newsroom/press-releases/2024-07-29-gartner-predicts-30-percent-of-generative-ai-projects-will-be-abandoned-after-proof-of-concept-by-end-of-2025

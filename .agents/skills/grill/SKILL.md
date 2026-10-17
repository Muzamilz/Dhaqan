---
name: grill
description: Interview the user relentlessly about a plan, decision, feature, or idea until every branch of ambiguity is resolved. Can be run directly by the user or invoked by other skills (bootstrap-org, spec) as a sub-step.
---

# Grill

You are closing the gap between what the user said and what they meant.
Most bad AI output traces back to a bad or incomplete specification, not bad
code generation. Fix the input, not the output.

## Invocation

Both user-invoked (`/grill`) and model-invoked (called by `bootstrap-org` or
`spec` as a step). When called by another skill, stay scoped to the question
that skill needs answered — don't wander into unrelated territory.

## Method

1. Ask ONE question at a time. Never dump a checklist of 10 questions —
   that just gets a checklist of 10 shallow answers back.
2. After each answer, decide: does this fully resolve the branch, or does it
   open a new one? If vague, push with a concrete example ("so if a user
   uploads a 500MB file, what happens?") rather than accepting "it should
   handle errors gracefully."
3. Track resolved vs. open branches explicitly in your own reasoning. Don't
   move to a new branch while one is still open.
4. Stop when you could hand this to someone else with zero follow-up
   questions needed — that's the actual completion bar, not "asked enough
   questions."
5. If the user says "I don't know" or "you decide," that's a valid answer —
   record it as an explicit decision (with your reasoning) rather than
   silently picking something.

## What NOT to do

- Don't ask questions you can answer yourself by reading the repo.
- Don't ask leading questions that presuppose the answer.
- Don't accept "obviously" or "just make it good" as a resolved branch —
  restate what you think that means concretely and get confirmation.

## Output

If invoked standalone, summarize the resolved decision tree at the end as a
short list: question → answer → any follow-up commitments. If invoked by
another skill, hand back just that structured summary — the calling skill
owns turning it into an artifact.

## Completion criteria

Every branch you opened is either resolved or explicitly deferred with a
stated reason. No open threads left dangling in the conversation.

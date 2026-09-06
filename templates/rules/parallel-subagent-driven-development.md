# Parallel Subagent-Driven Development — Hardened Rule

## Principle

Parallel dispatch is safe only when tasks are independent in **state and contracts**, not merely in file paths. File collisions and Git commit races are only two of the possible failure modes.

Parallel writers can also collide through migration ordering, lockfiles, generated artifacts, schemas, ports, databases, queues, fixtures, caches and interfaces that one task changes while another consumes them.

## Task contract

Before forming waves, every task declares:

```text
ID:
Goal:
Files:
Resources:
Interfaces:
Depends-on:
Generated-artifacts:
Shared-state:
Verify:
Risk: normal | high
```

If the fields that determine independence are unknown, explore/plan first or run serially. Never guess a narrower scope to manufacture parallelism.

## Wave formation

Two tasks may share a wave only when all of these hold:

1. neither depends on the other, directly or transitively;
2. neither consumes an interface the other is modifying during the wave;
3. no mutable external resource is shared unless it has explicit isolation;
4. generated artifacts cannot collide in path, namespace, ordering or source;
5. write sets are disjoint, or each writer has a physically isolated worktree;
6. merge/integration order does not change their semantics.

When any condition is uncertain, serialize.

## Workspace isolation

- Read-only agents may share a checkout.
- A single writer may use the normal working tree.
- Two or more concurrent writers should prefer **separate worktrees, each on its own branch**, when the harness supports them.
- A branch name alone does not isolate a working directory or Git index.
- Shared external state that cannot be isolated means the tasks are not safe to execute concurrently.

With Claude Code, use its native worktree isolation mechanism when applicable rather than relying on prompt discipline alone.

## Per-wave loop

1. Validate task contracts and dependencies.
2. Prove semantic independence for tasks in the same wave.
3. Create isolated workspaces for concurrent writers.
4. Dispatch tasks.
5. Each task runs its `Verify` command/assertion and reports evidence.
6. Integrate/merge/cherry-pick results serially.
7. Run global validation against the integrated state.
8. Review the integrated diff proportional to risk.
9. Record evidence and unresolved concerns in the PR/issue.

If the integration exposes a hidden dependency, stop and re-plan; do not force the wave through.

## Commits

If writers somehow share a checkout, only one actor may own the Git index and commit serially. This reduces commit races but **does not make semantically coupled tasks independent**.

In isolated worktrees, each task may commit on its own branch. The integrator still combines results in a controlled order and validates the combined state.

## Review

Reviewers are read-only and may usually run concurrently. A multi-reviewer panel is reserved for risk surfaces where distinct specialist lenses materially improve coverage.

## Fallback

Serial execution is the safety default. Parallelism is an optimization that must earn its complexity through demonstrated independence or context isolation.

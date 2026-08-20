# ADR: S5 — Results Calculation, Ranking & Hackathon Completion

## Status
Accepted

## Context
AlmostHack requires an authoritative, deterministic, tamper-proof results calculation engine and lifecycle workflow to aggregate multi-judge evaluation scores, incorporate S4 integrity outcomes, resolve ties, create immutable versioned result snapshots, and safely publish official hackathon leaderboards.

## Non-Negotiable Core Principles & Invariants

### 1. Client Untrusted & Zero Direct Score/Rank Manipulation
- Clients NEVER submit or control scores, ranks, winner status, eligibility flags, or publication states.
- All scores and ranks are deterministically derived on the server from authoritative, finalized judge evaluations (`JudgeEvaluation.status = 'SUBMITTED'`) and criteria configurations.
- Mass-assignment attacks attempting to inject `{ score, rank, winner, isWinner, eligibilityStatus, status }` are strictly stripped and rejected.

### 2. S4 Integrity Boundary & Eligibility Policy
- S4 integrity analysis produces observational findings. S5 defines the authoritative eligibility and disqualification boundary:
  - `CONFIRMED` high-severity/high-similarity integrity findings $\implies$ Submission marked `INELIGIBLE` with an explicit reason; disqualified from ranking podium/awards.
  - `OPEN` or `UNDER_REVIEW` findings $\implies$ Marked `PENDING_REVIEW`; blocks organizer approval and leaderboard publication until human jury resolves or dismisses the finding.
  - `DISMISSED` findings $\implies$ Submission marked `ELIGIBLE`; evaluated strictly on merit.

### 3. Mathematical Precision & Determinism
- **Criteria Weighting**: Scores are calculated using criterion weights and normalized to percentage scale:
  $$\text{Score}_{\text{judge}} = \frac{\sum (s_i \times w_i)}{\sum (\text{maxScore}_i \times w_i)} \times 100$$
- **Aggregation**: Final score is the arithmetic mean across all independent judge evaluations for that submission:
  $$\text{FinalScore} = \frac{1}{J} \sum_{j=1}^J \text{Score}_j$$
- **Precision**: Rounded to 4 decimal places with exact floating-point arithmetic.
- **Reproducibility**: Running calculation multiple times over the same input data yields identical scores, ranks, and SHA-256 `inputFingerprint`.

### 4. Deterministic Competition Ranking & Multi-Tier Tie-Breaking
- Standard Competition Ranking (1224 ranking scheme):
  - If teams tie at rank 1, both share rank 1, and the next team receives rank 3.
- Deterministic Tie-Break Rules:
  - Tier 1: Final Weighted Score Average.
  - Tier 2: Unweighted Raw Criteria Score Sum.
  - Tier 3: Deterministic tie-break by submission ID.

### 5. Snapshot Versioning, Supersession & Immutability
- Results are saved in versioned `ResultSet` snapshots (`calculationVersion: 1, 2, ...`).
- When a recalculation occurs, previous calculated/under-review sets are marked `SUPERSEDED`.
- Published result sets are immutable. Any post-publication corrections require explicit recalculation, review, re-approval, and re-publication.

### 6. Staleness Protection & Authoritative Cryptographic Fingerprinting
- Result snapshots capture an SHA-256 `inputFingerprint` over:
  - Hackathon metadata and active judging criteria (names, weights, maxScores).
  - Submissions, commit SHAs, and finalized judge evaluations/scores.
  - S4 integrity findings, statuses, and severities.
- When an organizer attempts to **Approve** or **Publish** results, the live state is hashed and compared against the snapshot's fingerprint:
  - If any evaluation, score, or finding was modified after calculation $\implies$ Throws `409 Conflict: STALE_RESULTS`. Organizer must recalculate and re-review.

### 7. Information Hiding & Privacy Protection
- Prior to official publication (`status = 'PUBLISHED'`), the public leaderboard returns `isPublished: false` and empty entries (`[]`).
- Published leaderboard projections sanitize and omit private data:
  - No internal judge notes, reviewer comments, email addresses, tokens, or repository commit SHAs are exposed.
  - Only authorized organizers can view full score breakdowns and historical supersession snapshots.

## State Transition Machine

```
[ Incomplete Judging ]
         ↓ (All evaluations finalized & submitted)
   [ CALCULATED ] ← (Recalculate supersedes older drafts)
         ↓ (Organizer reviews & verifies integrity)
    [ APPROVED ]
         ↓ (Organizer publishes & staleness check passes)
   [ PUBLISHED ]
         ↓ (Public Leaderboard live & immutable)
```

## API Surface

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/hackathons/:id/results/calculate` | Organizer | Computes scores, evaluates eligibility, creates versioned snapshot. |
| `GET` | `/api/v1/hackathons/:id/results` | Organizer | Retrieves latest active result set with full criterion breakdown. |
| `GET` | `/api/v1/hackathons/:id/results/history` | Organizer | Lists historical result set snapshots. |
| `POST` | `/api/v1/hackathons/:id/results/approve` | Organizer | Approves calculated results; verifies staleness & pending reviews. |
| `POST` | `/api/v1/hackathons/:id/results/publish` | Organizer | Publishes approved results to the public leaderboard. |
| `GET` | `/api/v1/hackathons/:id/leaderboard` | Public | Public sanitized leaderboard projection (returns empty if unpublished). |

# ADR: S4 — Integrity, Plagiarism & Submission Forensics

## Status
Accepted

## Context
AlmostHack requires a dedicated, observational integrity-analysis engine and reviewer workflow to detect potential code similarity, suspicious repository overlap, copied files, and structural code fragments across hackathon submissions.

## Non-Negotiable Principle: DETECTION $\ne$ GUILT
1. **Algorithmic Signal vs. Disciplinary Decision**:
   - The integrity engine generates **observational evidence**, NOT guilt.
   - The engine produces signals of the form: *"Potential similarity detected (87%)"*.
   - It is strictly forbidden from stating: *"Team cheated"*.
2. **Strict Disciplinary Isolation**:
   - The detection engine and finding review transitions **MUST NEVER**:
     - Disqualify a team
     - Invalidate or reject a submission
     - Modify, reduce, or alter judge evaluation scores
     - Ban a participant or remove a team
     - Automatically execute any disciplinary punishment
   - Only authorized human organizers/admins can evaluate findings, mark false positives (`DISMISSED`), or confirm potential similarity (`CONFIRMED`).

## Architectural Decisions & Invariants

### 1. Authoritative & Immutable Snapshot
- Integrity analysis operates strictly on the immutable Git commit SHA snapshot captured during submission finalization (`Submission.commitSha`).
- Findings and evidence permanently retain provenance: `submissionId`, `repositoryId`, `commitSha`, `engineVersion`, `configurationVersion`, `startedAt`, `completedAt`.

### 2. Zero Code Execution & Hostile Input Defense
- Repository source code is treated strictly as untrusted data.
- **Zero Execution**: No `eval`, `exec`, shell scripts, build tools (`npm`, `pip`, `make`, `cargo`), or tests are ever executed.
- **Resource Bounds**: Max 500 files per repository, max 500 KB per file, max 10 MB total repository size.
- **Zip-Slip Defense**: Path normalization strictly rejects `..`, absolute paths, and null bytes.

### 3. Explainable Similarity & Deterministic Fingerprinting
- **Normalization**: Strips language-specific comments (C-style, Python/Ruby `#`, docstrings), collapses whitespace, normalizes line endings (`\r\n` $\rightarrow$ `\n`).
- **Token Fingerprinting**: Rolling k-gram (k=4) SHA-256 token hashing.
- **Jaccard & Overlap Similarity**:
  $$S = 0.4 \times \frac{|F_A \cap F_B|}{|F_A \cup F_B|} + 0.6 \times \frac{|F_A \cap F_B|}{\min(|F_A|, |F_B|)}$$
- **Severity Mapping**:
  - $\ge 0.85 \implies \text{HIGH}$
  - $\ge 0.65 \implies \text{MEDIUM}$
  - $\ge 0.45 \implies \text{LOW}$

### 4. Baseline Exclusion & Isolation Rules
- **Cross-Hackathon Isolation**: Code comparison is strictly restricted to submissions within the same hackathon. Submissions across different hackathons/organizations are never compared.
- **Self-Comparison Exclusion**: A submission is never compared to itself ($A \ne A$), nor to submissions from the same team.
- **Baseline Template Exclusion**: Common boilerplate and starter template fingerprints are filtered from similarity calculations.

### 5. Reviewer Workflow & Auditability
- **State Machine**: `OPEN` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `CONFIRMED` or `DISMISSED`.
- **False-Positive Handling**: Dismissing a finding requires a mandatory explanatory reason ($\ge 5$ chars) and does not delete historical evidence.
- **Transactional Audit Trail**: All state transitions (`integrity.analysis_started`, `integrity.analysis_completed`, `integrity.finding_created`, `integrity.finding_confirmed`, `integrity.finding_dismissed`) are transactionally recorded in PostgreSQL.

## Out-of-Scope (Strict S4/S5 Boundary)
- Automated disciplinary actions, team disqualification, participant banning, score reductions, automated sandboxing, leaderboards, rankings, appeals, and prize distributions are strictly out of scope for S4.

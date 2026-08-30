# 👥 Team Development Workflow, Standards & CI/CD Lifecycle

This document defines the collaboration protocols, coding standards, branch management, automated testing requirements, and deployment procedures for contributors to the **AI-Powered Cyber Threat Detection System**.

---

## 🌿 Git Branching Strategy & Workflow

We follow a **Trunk-Based / Feature-Branching Model**:

```mermaid
gitGraph
    commit id: "Init Repo"
    branch feature/realistic-threat-data
    checkout feature/realistic-threat-data
    commit id: "feat(data): DGArchive algorithms"
    commit id: "feat(features): 84-feature extractor"
    checkout main
    merge feature/realistic-threat-data id: "PR #1 (Merged)"
    branch feature/backend-streaming
    checkout feature/backend-streaming
    commit id: "feat(backend): Redis stream consumer"
    checkout main
    merge feature/backend-streaming id: "PR #2 (Merged)"
```

### 1. Branch Naming Conventions
- `feature/<subsystem>-<short-description>`: New functional capabilities (e.g., `feature/beaconing-bot-lstm`, `feature/supabase-realtime`).
- `fix/<subsystem>-<bug-description>`: Bug fixes (e.g., `fix/metadata-string-parsing`, `fix/redis-socket-timeout`).
- `docs/<topic>`: Documentation updates (e.g., `docs/bot-hyperparameters`).
- `chore/<tooling>`: Tooling, dependency updates, and CI configs (e.g., `chore/alembic-migrations`).

### 2. Commit Message Standards (Conventional Commits)
Use imperative, present-tense messages prefixed by module tags:
```text
feat(ai_models): implement isolation forest beaconing detector
fix(features): handle string metadata in nfstream extractor safely
docs(architecture): add sequence diagram for score fusion
test(data): verify 84-feature vector integrity on synthetic flows
```

---

## 🛠️ Code Style & Quality Standards

### Python Standards (Backend & AI Models)
- **Formatting**: Adhere to PEP 8 using `black --line-length 120` and `isort`.
- **Type Annotations**: Mandatory type hints on all public functions (`typing.Dict`, `typing.List`, `typing.Optional`).
- **Data Validation**: Use **Pydantic v2** models for all API request/response payloads (`backend/app/schemas/`).
- **Database Access**: Use **SQLAlchemy 2.0** style queries with explicit dependency injection (`get_db`).

### TypeScript / React Standards (Frontend)
- **Language**: Strict TypeScript (`tsconfig.json` with `"strict": true`).
- **Component Architecture**: Functional components with custom hooks (`useAlerts.ts`, `useThroughput.ts`).
- **Styling**: Tailwind CSS utility classes; avoid inline styles.

---

## 🧪 Pre-Commit Verification Checklist

Before submitting a Pull Request, verify all local checks pass:

### 1. Validate Datasets & Schema Integrity
```bash
# Must pass with 0 errors across all 48 files
python3 data/validate_datasets.py
```

### 2. Verify Feature Extraction Pipeline
```bash
python3 -c "
import sys, csv; sys.path.insert(0, '.')
from ai_models.features.extractor import UnifiedFeatureExtractor
ext = UnifiedFeatureExtractor()
assert len(ext.get_feature_names()) == 84, 'Feature count mismatch!'
print('[✓] 84-feature pipeline verified.')
"
```

### 3. Run Unit & Integration Tests
```bash
# Run pytest across backend and ML models
pytest backend/tests/ ai_models/tests/ -v
```

---

## 🔐 Environment & Secrets Management

- **NEVER commit `.env` files or API keys** (enforced by `.gitignore`).
- When introducing a new configuration variable:
  1. Add a dummy placeholder in `.env.example` and `backend/.env.example`.
  2. Document the variable in the [Alert & Database Schema manual](alert_schema.md).

```bash
# Common required variables
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
REDIS_URL=redis://localhost:6379
WEB3_PROVIDER_URI=https://rpc-amoy.polygon.technology
CONTRACT_ADDRESS=0x3F91A39b2B86f8f537EcE09426c117bE9717D559
PRIVATE_KEY=0x...
```

---

## 🚀 Pull Request & Merge Guidelines

1. **Pull Latest Main**: Always rebase or merge `origin/main` before opening a PR to avoid merge conflicts:
   ```bash
   git fetch origin
   git merge origin/main
   ```
2. **Review Requirements**: At least 1 peer approval required before merging.
3. **No Direct Pushes to Main**: All code enters `main` exclusively through tested Pull Requests.

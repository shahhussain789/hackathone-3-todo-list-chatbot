<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 1.0.0 → 2.0.0 (MAJOR - Architectural shift to AI Chatbot paradigm)

  Modified principles:
    - I. Spec-Driven Development → Retained (unchanged)
    - II. Security-First Design → Retained (updated for AI context)
    - III. Deterministic Reproducibility → Replaced with III. Statelessness
    - IV. Zero Manual Coding → Replaced with IV. AI Action Accuracy
    - V. Separation of Concerns → Replaced with V. Modularity (MCP Tools)
    - VI. Authentication & Authorization → Retained (unchanged)
    - VII. Data Integrity & Isolation → Replaced with VII. Reproducibility (Conversation History)

  Added sections:
    - III. Statelessness (server holds no in-memory state)
    - IV. AI Action Accuracy (AI reflects user intent)
    - V. Modularity - MCP Tools Only (AI interacts only via MCP)
    - VI. Clarity (responses understandable and friendly)
    - VII. Reproducibility - Conversation History (database persistence)
    - Updated Technology Stack for OpenAI Agents SDK, MCP SDK, ChatKit

  Removed sections:
    - III. Deterministic Reproducibility (replaced with Statelessness)
    - IV. Zero Manual Coding (replaced with AI Action Accuracy)
    - V. Separation of Concerns (replaced with Modularity)
    - VII. Data Integrity & Isolation (merged into Reproducibility)

  Templates requiring updates:
    - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section aligns)
    - .specify/templates/spec-template.md: ✅ Compatible (requirements format aligns)
    - .specify/templates/tasks-template.md: ✅ Compatible (phase structure supports principles)

  Follow-up TODOs: None
-->

# Todo AI Chatbot Constitution

## Core Principles

### I. Accuracy

AI actions MUST correctly reflect user intent at all times.

- All task operations (create, read, update, delete, mark complete) MUST be executed as the user intends
- AI MUST confirm understanding before executing ambiguous requests
- AI MUST NOT infer or assume task details not explicitly provided by the user
- Failed operations MUST be reported clearly with actionable error messages
- AI MUST validate the existence of tasks before attempting modifications

**Rationale**: Users trust the AI to manage their tasks. Incorrect actions erode trust and may cause data loss or confusion.

### II. Clarity

All AI responses MUST be understandable and friendly.

- Responses MUST use natural, conversational language
- Confirmations MUST be provided for every successful action
- Error messages MUST explain what went wrong and suggest remediation
- Task lists MUST be formatted for easy readability
- AI MUST NOT use technical jargon unless the user demonstrates technical proficiency
- Responses SHOULD acknowledge the user's request before presenting results

**Rationale**: A chatbot interface requires clear communication. Users should feel confident they understand what the AI has done.

### III. Statelessness

The server MUST hold no in-memory state between requests.

- Each API request MUST be self-contained and independently processable
- No session memory stored in server RAM between requests
- All conversation context MUST be retrieved from the database on each request
- Server restarts MUST NOT lose any user data or conversation history
- Horizontal scaling MUST be possible without session affinity

**Rationale**: Stateless architecture enables horizontal scaling, simplifies deployment, and ensures reliability under load.

### IV. Reproducibility

Conversation history MUST be persisted in the database for replay and continuity.

- All user messages MUST be stored with timestamps and user association
- All AI responses MUST be stored with timestamps and conversation linkage
- Conversation threads MUST be retrievable to provide context for follow-up interactions
- Message history MUST support pagination for long conversations
- Database MUST be the single source of truth for conversation state

**Rationale**: Persistent conversation history enables context-aware responses and allows users to review past interactions.

### V. Security

Authentication and user isolation MUST be enforced at all layers.

- All API endpoints (except signup/signin) MUST require valid JWT authentication
- Unauthorized requests MUST return HTTP 401 (Unauthorized)
- Cross-user access attempts MUST return HTTP 403 (Forbidden)
- JWT expiry MUST be enforced; expired tokens MUST be rejected
- All secrets MUST be environment-based via `.env` files (no hardcoded keys)
- Users MUST only access their own tasks and conversations
- Backend MUST validate ownership before any read, update, or delete operation

**Rationale**: Multi-user applications require strict isolation. Security vulnerabilities are costly to fix post-deployment.

### VI. Modularity

The AI agent MUST interact with the system only through MCP (Model Context Protocol) tools.

- All task operations (CRUD) MUST be performed through defined MCP tools
- AI MUST NOT directly access the database or bypass the tool layer
- Each MCP tool MUST have a single, well-defined responsibility
- Tool responses MUST be structured and parseable
- New functionality MUST be added by creating new MCP tools, not modifying AI behavior
- Tool failures MUST be gracefully handled with user-friendly error messages

**Rationale**: MCP tools provide a controlled interface between the AI and the system, ensuring predictability, testability, and security.

## Technology Stack Constraints

The following technology stack is FIXED and MUST NOT be changed without a formal amendment.

| Layer          | Technology                   | Version/Notes            |
|----------------|------------------------------|--------------------------|
| Frontend       | OpenAI ChatKit               | Chat interface           |
| Backend        | Python FastAPI               | Latest stable            |
| AI Framework   | OpenAI Agents SDK            | Agent orchestration      |
| Tool Protocol  | Official MCP SDK             | Model Context Protocol   |
| ORM            | SQLModel                     | Latest stable            |
| Database       | Neon Serverless PostgreSQL   | Serverless configuration |
| Authentication | Better Auth + JWT            | JWT for API auth         |

**Constraints**:
- Multi-user support is MANDATORY
- Persistent storage is REQUIRED (no in-memory data stores)
- All endpoints MUST be stateless; server holds no session memory
- JWT secret MUST be shared via `BETTER_AUTH_SECRET` environment variable
- API responses MUST be JSON-only
- Environment variables MUST be used for all configuration

## Security Constraints

These security requirements are NON-NEGOTIABLE.

| Scenario                        | Required Response        |
|---------------------------------|--------------------------|
| Missing/invalid JWT             | HTTP 401 Unauthorized    |
| Expired JWT                     | HTTP 401 Unauthorized    |
| User accessing another's data   | HTTP 403 Forbidden       |
| Invalid request format          | HTTP 400 Bad Request     |
| Resource not found              | HTTP 404 Not Found       |
| Server error                    | HTTP 500 Internal Error  |

**Additional Security Requirements**:
- Frontend MUST never trust client-side user identity alone
- Backend MUST validate JWT signature on every protected request
- User ID in JWT payload MUST be used to scope all database queries
- No secrets in client-side code or version control
- All passwords MUST be hashed (never stored in plaintext)

## Quality Standards

### API Standards
- All endpoints MUST be RESTful and follow standard HTTP conventions
- All endpoints MUST be documented via OpenAPI/Swagger annotations
- All inputs MUST be validated using Pydantic models
- Error responses MUST include meaningful error messages

### AI Response Standards
- Confirmations MUST be provided for every action (create, update, delete, complete)
- Error messages MUST be user-friendly, not technical stack traces
- Task lists MUST be formatted clearly (numbered or bulleted)
- AI MUST gracefully handle invalid or missing tasks
- AI MUST NOT hallucinate task data that does not exist

### Frontend Standards (ChatKit)
- Chat interface MUST display messages in real time
- User input MUST be clearly distinguished from AI responses
- Loading states MUST be shown during AI processing
- Error states MUST be visually communicated

### Database Standards
- All models MUST include `id`, `created_at`, `updated_at` fields
- UUID MUST be used for primary keys
- Foreign key relationships MUST be explicit
- Conversation and message history MUST be stored persistently
- All database queries MUST be user-scoped

## MCP Tool Requirements

All task operations MUST be implemented as MCP tools with the following structure:

| Tool Name       | Purpose                              | Required Parameters       |
|-----------------|--------------------------------------|---------------------------|
| `list_tasks`    | Retrieve user's tasks                | user_id, filters (optional)|
| `create_task`   | Create a new task                    | user_id, title, description|
| `get_task`      | Retrieve a specific task             | user_id, task_id          |
| `update_task`   | Modify task details                  | user_id, task_id, fields  |
| `delete_task`   | Remove a task                        | user_id, task_id          |
| `complete_task` | Mark task as complete                | user_id, task_id          |

**Tool Design Principles**:
- Each tool MUST validate user ownership before execution
- Each tool MUST return structured JSON responses
- Each tool MUST handle errors gracefully and return meaningful messages
- Tools MUST NOT perform multiple unrelated operations

## Governance

This constitution supersedes all other development practices for the Todo AI Chatbot project.

### Amendment Process
1. Propose amendment via Architecture Decision Record (ADR)
2. Document rationale, tradeoffs, and migration impact
3. Obtain stakeholder approval
4. Update constitution with new version number
5. Propagate changes to dependent templates and documentation

### Version Policy
- **MAJOR**: Backward-incompatible changes (principle removal/redefinition, architecture shift)
- **MINOR**: New principle or materially expanded guidance
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Verification
- All PRs MUST verify compliance with this constitution
- Spec reviews MUST check alignment with core principles
- MCP tools MUST be tested for correct behavior and error handling
- AI responses MUST be validated for clarity and accuracy

### Reference Documents
- Runtime guidance: `CLAUDE.md`
- Feature specifications: `specs/<feature>/spec.md`
- Implementation plans: `specs/<feature>/plan.md`
- Task breakdowns: `specs/<feature>/tasks.md`
- Prompt history: `history/prompts/`
- Architecture decisions: `history/adr/`

## Success Criteria

The project is successful when:

1. Users can interact with tasks via natural language chat interface
2. AI correctly executes all task operations through MCP tools
3. Each user can only see and modify their own tasks
4. Conversation history is persisted and provides context for follow-ups
5. All AI responses are clear, friendly, and actionable
6. JWT authentication works end-to-end (frontend to backend)
7. Server is stateless and horizontally scalable
8. Graceful error handling for all edge cases

**Version**: 2.0.0 | **Ratified**: 2026-01-10 | **Last Amended**: 2026-01-18

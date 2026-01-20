# Implementation Plan: Todo AI Chatbot

**Branch**: `001-ai-chatbot` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-chatbot/spec.md`

## Summary

Build an AI-powered chatbot interface that allows users to manage tasks via natural language. The AI agent uses OpenAI Agents SDK to interpret user messages and invokes MCP tools (add_task, list_tasks, complete_task, delete_task, update_task) to perform task operations. The architecture is stateless - all conversation context is persisted in the database and retrieved on each request.

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript/Next.js 15+ (Frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, MCP SDK, SQLModel, OpenAI ChatKit
**Storage**: Neon Serverless PostgreSQL (existing)
**Testing**: Manual testing (per spec constraints)
**Target Platform**: Web application (desktop + mobile responsive)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <5 seconds response time, 50 concurrent sessions
**Constraints**: Stateless architecture, JWT authentication, user data isolation
**Scale/Scope**: Multi-user, production-ready

## Constitution Check

*GATE: Must pass before implementation. Re-check after design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Accuracy | PASS | AI invokes MCP tools based on user intent; tools validate before execution |
| II. Clarity | PASS | AI provides friendly confirmations and error messages per spec |
| III. Statelessness | PASS | No in-memory state; conversation retrieved from DB on each request |
| IV. Reproducibility | PASS | All messages persisted in Conversation/Message tables |
| V. Security | PASS | JWT validation on all endpoints; user_id scoping on all queries |
| VI. Modularity | PASS | All task operations via MCP tools; AI cannot bypass tool layer |

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-chatbot/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology research
├── data-model.md        # Database schema additions
├── contracts/           # API contracts
│   └── chat-api.md      # Chat endpoint contract
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Task breakdown (via /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py              # FastAPI app (add chat router)
│   ├── models/
│   │   ├── task.py          # Existing Task model
│   │   ├── user.py          # Existing User model
│   │   ├── conversation.py  # NEW: Conversation model
│   │   └── message.py       # NEW: Message model
│   ├── schemas/
│   │   ├── chat.py          # NEW: Chat request/response schemas
│   │   └── ...
│   ├── routers/
│   │   ├── tasks.py         # Existing task routes
│   │   ├── auth.py          # Existing auth routes
│   │   └── chat.py          # NEW: Chat endpoint router
│   ├── mcp/                  # NEW: MCP tools module
│   │   ├── __init__.py
│   │   ├── server.py        # MCP server setup
│   │   └── tools/
│   │       ├── __init__.py
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── complete_task.py
│   │       ├── delete_task.py
│   │       └── update_task.py
│   └── agent/                # NEW: OpenAI Agent module
│       ├── __init__.py
│       └── chat_agent.py    # Agent configuration and execution

frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx         # Add chat panel alongside task list
│   └── chat/                # NEW: Dedicated chat page (optional)
│       └── page.tsx
├── components/
│   ├── chat/                # NEW: Chat components
│   │   ├── chat-panel.tsx   # ChatKit integration wrapper
│   │   └── chat-message.tsx # Message display component
│   └── tasks/
│       └── task-list.tsx    # Existing
└── lib/
    ├── api.ts               # Existing API utilities
    └── chat-api.ts          # NEW: Chat API client
```

**Structure Decision**: Web application structure with backend/ and frontend/ directories. New MCP and agent modules added to backend. ChatKit integration in frontend.

## Architecture Overview

### Request Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend       │     │   Database      │
│   (ChatKit)     │     │   (FastAPI)     │     │   (Neon PG)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ POST /api/chat        │                       │
         │ {message, conv_id}    │                       │
         │ + JWT token           │                       │
         ├──────────────────────>│                       │
         │                       │                       │
         │                       │ 1. Verify JWT         │
         │                       │ 2. Get/Create Conv    │
         │                       ├──────────────────────>│
         │                       │<──────────────────────┤
         │                       │                       │
         │                       │ 3. Fetch history      │
         │                       ├──────────────────────>│
         │                       │<──────────────────────┤
         │                       │                       │
         │                       │ 4. Store user msg     │
         │                       ├──────────────────────>│
         │                       │                       │
         │                       │ 5. Run AI Agent       │
         │                       │    (OpenAI SDK)       │
         │                       │    │                  │
         │                       │    ├─► Invoke MCP Tool│
         │                       │    │   (e.g. add_task)│
         │                       │    │        │         │
         │                       │    │        ├────────>│ DB write
         │                       │    │        │<────────┤
         │                       │    │<───────┘         │
         │                       │    │                  │
         │                       │<───┘                  │
         │                       │                       │
         │                       │ 6. Store AI response  │
         │                       ├──────────────────────>│
         │                       │                       │
         │ {response, conv_id,   │                       │
         │  tool_calls}          │                       │
         │<──────────────────────┤                       │
         │                       │                       │
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **ChatKit (Frontend)** | Render chat UI, handle user input, display AI responses |
| **Chat Router** | Receive messages, orchestrate agent, return responses |
| **OpenAI Agent** | Interpret natural language, decide which MCP tool to invoke |
| **MCP Tools** | Execute task operations, interact with database |
| **Conversation/Message Models** | Persist chat history in database |

## Key Design Decisions

### 1. Stateless Agent Invocation

Each chat request:
1. Retrieves conversation history from database
2. Passes history to OpenAI agent as context
3. Agent processes message and invokes tools
4. Response and tool calls stored in database
5. No state retained in server memory

### 2. MCP Tool Design

Each tool:
- Accepts `user_id` from JWT (not user input)
- Validates ownership before any operation
- Returns structured JSON with success/error status
- Includes user-friendly message for AI to relay

### 3. Conversation Context Window

- Last 20 messages loaded as context for agent
- Older messages available via pagination (future)
- Context window prevents token overflow

### 4. Error Handling Strategy

| Error Type | Handling |
|------------|----------|
| Task not found | Tool returns error; AI relays friendly message |
| Unauthorized | 401 response before agent runs |
| Invalid input | Pydantic validation; AI asked to clarify |
| Database error | 500 with generic message; log details |

## Dependencies

### New Backend Dependencies

```
# Add to requirements.txt
openai>=1.0.0           # OpenAI Agents SDK
mcp>=1.0.0              # Official MCP SDK
```

### New Frontend Dependencies

```json
// Add to package.json
{
  "@openai/chatkit": "^1.0.0"
}
```

### Environment Variables

```bash
# Backend (.env)
OPENAI_API_KEY=sk-...              # OpenAI API key for agent
# Existing: DATABASE_URL, BETTER_AUTH_SECRET

# Frontend (.env.local)
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=...  # ChatKit domain key
# Existing: NEXT_PUBLIC_API_URL
```

## Complexity Tracking

No constitution violations. Design follows all principles:
- Single responsibility MCP tools
- Stateless request handling
- JWT-based authentication
- User data isolation

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenAI API latency | Medium | Medium | Set timeout; show loading state |
| Token limit exceeded | Low | High | Limit context window to 20 messages |
| MCP tool errors | Medium | Medium | Comprehensive error handling; fallback messages |
| ChatKit integration issues | Medium | Medium | Fallback to custom chat UI if needed |

## Implementation Phases

### Phase 1: Database Models (Foundational)
- Add Conversation model
- Add Message model
- Run migrations

### Phase 2: MCP Tools (Core Functionality)
- Implement add_task tool
- Implement list_tasks tool
- Implement complete_task tool
- Implement delete_task tool
- Implement update_task tool

### Phase 3: Backend Chat Endpoint
- Create chat router
- Implement OpenAI agent integration
- Wire up MCP tools to agent
- Implement conversation persistence

### Phase 4: Frontend ChatKit Integration
- Install and configure ChatKit
- Create chat panel component
- Integrate with dashboard page
- Handle message sending/receiving

### Phase 5: Integration & Polish
- End-to-end testing
- Error handling refinement
- UI polish and loading states

## Next Steps

1. Run `/sp.tasks` to generate detailed task breakdown
2. Implement Phase 1 (Database Models)
3. Proceed through phases sequentially

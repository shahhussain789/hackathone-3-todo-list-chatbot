# Research: Todo AI Chatbot

**Feature**: 001-ai-chatbot
**Date**: 2026-01-18

## Technology Stack Research

### OpenAI Agents SDK

**Purpose**: Orchestrate AI agent that interprets natural language and invokes tools.

**Key Features**:
- Function calling for structured tool invocation
- Conversation context management
- Streaming responses (optional)
- Built-in error handling

**Integration Pattern**:
```python
from openai import OpenAI

client = OpenAI()

# Define tools as functions
tools = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Task title"}
                },
                "required": ["title"]
            }
        }
    }
]

# Run agent with tools
response = client.chat.completions.create(
    model="gpt-4o",
    messages=conversation_history,
    tools=tools,
    tool_choice="auto"
)
```

**Stateless Consideration**: Agent is instantiated fresh per request. No state retained. History loaded from database and passed as messages.

### MCP (Model Context Protocol) SDK

**Purpose**: Standardized protocol for AI tool invocation.

**Key Concepts**:
- **Tools**: Functions the AI can invoke
- **Resources**: Data sources the AI can read
- **Prompts**: Pre-defined interaction patterns

**Integration with OpenAI**: MCP tools can be exposed as OpenAI function definitions. The MCP server wraps database operations.

**Tool Structure**:
```python
from mcp.server import Server
from mcp.types import Tool

server = Server("todo-mcp")

@server.tool()
async def add_task(user_id: str, title: str) -> dict:
    """Create a new task."""
    # Database operation
    return {"success": True, "task_id": "...", "message": "Task created!"}
```

### OpenAI ChatKit

**Purpose**: Pre-built React chat UI components.

**Key Features**:
- Message list component
- Input field with send button
- Typing indicators
- Streaming support
- Customizable styling

**Integration**:
```tsx
import { Chat } from '@openai/chatkit';

function ChatPanel() {
  return (
    <Chat
      endpoint="/api/chat"
      headers={{ Authorization: `Bearer ${token}` }}
    />
  );
}
```

**Domain Configuration**: Requires `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` for production deployment.

## Existing Codebase Analysis

### Backend Structure

| Component | Status | Notes |
|-----------|--------|-------|
| FastAPI app | Exists | Add chat router |
| Task model | Exists | UUID pk, user_id fk, title, is_completed |
| User model | Exists | UUID pk, email, password_hash |
| JWT auth | Exists | get_current_user dependency |
| Database | Exists | Neon PostgreSQL, async SQLModel |

### Frontend Structure

| Component | Status | Notes |
|-----------|--------|-------|
| Next.js app | Exists | App Router |
| Dashboard | Exists | TaskList component |
| Auth pages | Exists | Login, Signup |
| API client | Exists | Fetch wrapper with JWT |

### Database Schema (Current)

```sql
-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Design Decisions

### Decision 1: Agent Model Selection

**Options**:
1. GPT-4o - Best reasoning, higher cost
2. GPT-4o-mini - Good balance, lower cost
3. GPT-3.5-turbo - Fast, cheapest

**Decision**: GPT-4o-mini
**Rationale**: Task CRUD operations are simple; mini model handles them well. Cost-effective for hackathon demo.

### Decision 2: Conversation Storage Granularity

**Options**:
1. Store full message history
2. Store only last N messages
3. Store summaries

**Decision**: Store full history, load last 20 for context
**Rationale**: Full history for audit/replay; limited context prevents token overflow.

### Decision 3: Tool Invocation Pattern

**Options**:
1. Direct database access in agent
2. MCP tools as middleware
3. REST API calls from agent

**Decision**: MCP tools as middleware
**Rationale**: Constitution requires modularity. Tools provide controlled interface with validation.

### Decision 4: Frontend Chat Placement

**Options**:
1. Separate chat page
2. Chat panel in dashboard (split view)
3. Chat overlay/modal

**Decision**: Chat panel in dashboard (split view)
**Rationale**: Users can see tasks update in real-time after AI actions. Best UX for task management.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| OpenAI rate limits | Implement retry with exponential backoff |
| Long AI response time | Show typing indicator; timeout after 30s |
| ChatKit customization limits | Fallback to custom chat UI if needed |
| Token costs | Use mini model; limit context window |

## References

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)
- [OpenAI ChatKit Docs](https://platform.openai.com/docs/chatkit)
- [FastAPI Async](https://fastapi.tiangolo.com/async/)

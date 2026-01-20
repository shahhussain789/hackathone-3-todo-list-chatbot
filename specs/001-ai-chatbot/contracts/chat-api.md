# API Contract: Chat Endpoint

**Feature**: 001-ai-chatbot
**Date**: 2026-01-18

## Endpoints

### POST /api/chat

Send a message to the AI chatbot and receive a response.

**Authentication**: Required (JWT Bearer token)

**Request**:

```json
{
  "message": "string",           // User's message (required)
  "conversation_id": "uuid"      // Optional; creates new conversation if omitted
}
```

**Response** (200 OK):

```json
{
  "response": "string",          // AI's response message
  "conversation_id": "uuid",     // Conversation ID (new or existing)
  "tool_calls": [                // Array of tools invoked (may be empty)
    {
      "tool": "add_task",
      "arguments": {
        "title": "buy groceries"
      },
      "result": {
        "success": true,
        "task_id": "uuid",
        "message": "Task created successfully"
      }
    }
  ]
}
```

**Error Responses**:

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Invalid request body | `{"detail": "Message is required"}` |
| 401 | Missing/invalid JWT | `{"detail": "Invalid or expired token"}` |
| 403 | Conversation belongs to another user | `{"detail": "Access forbidden"}` |
| 404 | Conversation not found | `{"detail": "Conversation not found"}` |
| 500 | Server/AI error | `{"detail": "An error occurred. Please try again."}` |

### GET /api/conversations

List user's conversations.

**Authentication**: Required (JWT Bearer token)

**Response** (200 OK):

```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "string or null",
      "created_at": "ISO datetime",
      "updated_at": "ISO datetime",
      "message_count": 5
    }
  ],
  "total": 10
}
```

### GET /api/conversations/{conversation_id}

Get a specific conversation with messages.

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `conversation_id` (UUID): Conversation ID

**Query Parameters**:
- `limit` (int, optional): Number of messages to return (default: 20, max: 100)
- `before` (UUID, optional): Return messages before this message ID (pagination)

**Response** (200 OK):

```json
{
  "conversation": {
    "id": "uuid",
    "title": "string or null",
    "created_at": "ISO datetime",
    "updated_at": "ISO datetime"
  },
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Add a task to buy groceries",
      "tool_calls": null,
      "created_at": "ISO datetime"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Got it! I've added 'buy groceries' to your tasks.",
      "tool_calls": [
        {
          "tool": "add_task",
          "arguments": {"title": "buy groceries"},
          "result": {"success": true, "task_id": "uuid"}
        }
      ],
      "created_at": "ISO datetime"
    }
  ],
  "has_more": false
}
```

**Error Responses**:

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Missing/invalid JWT | `{"detail": "Invalid or expired token"}` |
| 403 | Conversation belongs to another user | `{"detail": "Access forbidden"}` |
| 404 | Conversation not found | `{"detail": "Conversation not found"}` |

### DELETE /api/conversations/{conversation_id}

Delete a conversation and all its messages.

**Authentication**: Required (JWT Bearer token)

**Response** (204 No Content): Empty body

**Error Responses**:

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Missing/invalid JWT | `{"detail": "Invalid or expired token"}` |
| 403 | Conversation belongs to another user | `{"detail": "Access forbidden"}` |
| 404 | Conversation not found | `{"detail": "Conversation not found"}` |

## Pydantic Schemas

### Request Schemas

```python
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[UUID] = None

class ConversationQuery(BaseModel):
    """Query parameters for conversation messages."""
    limit: int = Field(default=20, ge=1, le=100)
    before: Optional[UUID] = None
```

### Response Schemas

```python
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class ToolCall(BaseModel):
    """Tool invocation details."""
    tool: str
    arguments: dict
    result: dict

class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    response: str
    conversation_id: UUID
    tool_calls: List[ToolCall] = []

class MessageResponse(BaseModel):
    """Single message in conversation."""
    id: UUID
    role: str
    content: str
    tool_calls: Optional[List[ToolCall]] = None
    created_at: datetime

class ConversationSummary(BaseModel):
    """Conversation summary for list view."""
    id: UUID
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: int

class ConversationListResponse(BaseModel):
    """Response for conversations list."""
    conversations: List[ConversationSummary]
    total: int

class ConversationDetailResponse(BaseModel):
    """Response for single conversation with messages."""
    conversation: ConversationSummary
    messages: List[MessageResponse]
    has_more: bool
```

## MCP Tool Contracts

### add_task

**Purpose**: Create a new task for the user.

**Input**:
```json
{
  "title": "string"  // Required, 1-500 chars
}
```

**Output (Success)**:
```json
{
  "success": true,
  "task_id": "uuid",
  "title": "string",
  "message": "Got it! I've added '{title}' to your tasks."
}
```

**Output (Error)**:
```json
{
  "success": false,
  "error": "Title is required",
  "message": "I need a title for the task. What would you like to add?"
}
```

### list_tasks

**Purpose**: Retrieve user's tasks.

**Input**:
```json
{
  "completed": "boolean or null"  // Optional filter
}
```

**Output (Success)**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": "uuid",
      "title": "string",
      "is_completed": false
    }
  ],
  "total": 5,
  "message": "Here are your tasks:\n1. [ ] buy groceries\n2. [x] call mom"
}
```

**Output (Empty)**:
```json
{
  "success": true,
  "tasks": [],
  "total": 0,
  "message": "You don't have any tasks yet. Would you like to add one?"
}
```

### complete_task

**Purpose**: Mark a task as complete.

**Input**:
```json
{
  "task_id": "uuid",      // Optional if title provided
  "title": "string"       // Optional if task_id provided
}
```

**Output (Success)**:
```json
{
  "success": true,
  "task_id": "uuid",
  "title": "string",
  "message": "Nice work! I've marked '{title}' as complete."
}
```

**Output (Not Found)**:
```json
{
  "success": false,
  "error": "Task not found",
  "message": "I couldn't find that task. Can you try again with the exact task name?"
}
```

### delete_task

**Purpose**: Remove a task.

**Input**:
```json
{
  "task_id": "uuid",      // Optional if title provided
  "title": "string"       // Optional if task_id provided
}
```

**Output (Success)**:
```json
{
  "success": true,
  "task_id": "uuid",
  "title": "string",
  "message": "Done! I've removed '{title}' from your tasks."
}
```

**Output (Not Found)**:
```json
{
  "success": false,
  "error": "Task not found",
  "message": "I couldn't find that task. Would you like me to show your current tasks?"
}
```

### update_task

**Purpose**: Update a task's title.

**Input**:
```json
{
  "task_id": "uuid",         // Optional if old_title provided
  "old_title": "string",     // Optional if task_id provided
  "new_title": "string"      // Required, 1-500 chars
}
```

**Output (Success)**:
```json
{
  "success": true,
  "task_id": "uuid",
  "old_title": "string",
  "new_title": "string",
  "message": "Updated! '{old_title}' is now '{new_title}'."
}
```

**Output (Not Found)**:
```json
{
  "success": false,
  "error": "Task not found",
  "message": "I couldn't find that task. Can you check the task name and try again?"
}
```

## Security Considerations

1. **User ID Source**: Always extracted from JWT, never from request body
2. **Ownership Validation**: Every operation validates user_id matches resource owner
3. **Input Validation**: Pydantic models enforce length limits and types
4. **SQL Injection**: Prevented by SQLModel parameterized queries
5. **Rate Limiting**: Consider adding for production (not in MVP scope)

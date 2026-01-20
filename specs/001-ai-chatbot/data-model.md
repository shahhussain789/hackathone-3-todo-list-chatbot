# Data Model: Todo AI Chatbot

**Feature**: 001-ai-chatbot
**Date**: 2026-01-18

## New Entities

### Conversation

Represents a chat session between a user and the AI.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default uuid4 | Unique identifier |
| user_id | UUID | FK → users.id, NOT NULL, INDEX | Owner of conversation |
| title | VARCHAR(255) | NULL | Optional conversation title |
| created_at | TIMESTAMP | default now() | Creation timestamp |
| updated_at | TIMESTAMP | default now() | Last update timestamp |

**Relationships**:
- Belongs to: User (many-to-one)
- Has many: Message (one-to-many)

**SQLModel Definition**:
```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Message

Represents a single message in a conversation.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default uuid4 | Unique identifier |
| conversation_id | UUID | FK → conversations.id, NOT NULL, INDEX | Parent conversation |
| role | VARCHAR(20) | NOT NULL | "user" or "assistant" |
| content | TEXT | NOT NULL | Message content |
| tool_calls | JSONB | NULL | Tool invocations (if any) |
| created_at | TIMESTAMP | default now() | Creation timestamp |

**Relationships**:
- Belongs to: Conversation (many-to-one)

**SQLModel Definition**:
```python
class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", index=True)
    role: str = Field(max_length=20)  # "user" or "assistant"
    content: str
    tool_calls: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

## Existing Entities (No Changes)

### User

No changes required. Conversations link via user_id.

### Task

No changes required. MCP tools operate on existing Task model.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │       │  Conversation   │       │   Message   │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)         │──┐    │ id (PK)     │
│ email       │  │    │ user_id (FK)  ◄─┼──┘    │ conv_id (FK)│◄──┐
│ password    │  │    │ title           │       │ role        │   │
│ created_at  │  │    │ created_at      │       │ content     │   │
│ updated_at  │  │    │ updated_at      │       │ tool_calls  │   │
└─────────────┘  │    └─────────────────┘       │ created_at  │   │
                 │                              └─────────────┘   │
                 │    ┌─────────────────┐                         │
                 │    │      Task       │                         │
                 │    ├─────────────────┤                         │
                 └───►│ user_id (FK)    │       1:N relationship  │
                      │ id (PK)         │       ─────────────────►│
                      │ title           │
                      │ is_completed    │
                      │ created_at      │
                      │ updated_at      │
                      └─────────────────┘
```

## Database Schema (SQL)

```sql
-- New table: conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- New table: messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

## Query Patterns

### Get User's Conversations

```python
async def get_user_conversations(db: AsyncSession, user_id: UUID):
    query = select(Conversation).where(
        Conversation.user_id == user_id
    ).order_by(Conversation.updated_at.desc())
    result = await db.execute(query)
    return result.scalars().all()
```

### Get Conversation Messages (Last 20)

```python
async def get_conversation_messages(
    db: AsyncSession,
    conversation_id: UUID,
    limit: int = 20
):
    query = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.desc()).limit(limit)
    result = await db.execute(query)
    # Reverse to chronological order
    return list(reversed(result.scalars().all()))
```

### Create Message

```python
async def create_message(
    db: AsyncSession,
    conversation_id: UUID,
    role: str,
    content: str,
    tool_calls: Optional[dict] = None
) -> Message:
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        tool_calls=tool_calls
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message
```

## Migration Strategy

SQLModel's `create_all` will handle table creation on app startup (existing pattern in codebase). For production, consider:

1. Generate migration with Alembic
2. Apply in staging first
3. Verify indexes created
4. Deploy to production

## Data Retention

Per constitution, all conversation data persisted indefinitely. Future consideration:
- Archive old conversations (>1 year)
- Implement soft delete if needed
- GDPR compliance for user deletion (cascade delete conversations)

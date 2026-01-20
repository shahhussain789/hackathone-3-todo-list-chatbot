"""Pydantic schemas for chat-related requests and responses."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# Request Schemas


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""

    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[UUID] = None


class ConversationQuery(BaseModel):
    """Query parameters for conversation messages."""

    limit: int = Field(default=20, ge=1, le=100)
    before: Optional[UUID] = None


# Response Schemas


class ToolCall(BaseModel):
    """Tool invocation details."""

    tool: str
    arguments: dict
    result: dict


class ChatResponse(BaseModel):
    """Response from chat endpoint."""

    response: str
    conversation_id: UUID
    tool_calls: list[ToolCall] = []


class MessageResponse(BaseModel):
    """Single message in conversation."""

    id: UUID
    role: str
    content: str
    tool_calls: Optional[list[ToolCall]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationSummary(BaseModel):
    """Conversation summary for list view."""

    id: UUID
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """Response for conversations list."""

    conversations: list[ConversationSummary]
    total: int


class ConversationDetailResponse(BaseModel):
    """Response for single conversation with messages."""

    conversation: ConversationSummary
    messages: list[MessageResponse]
    has_more: bool

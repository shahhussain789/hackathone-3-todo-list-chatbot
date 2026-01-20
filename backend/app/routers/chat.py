"""Chat router for AI chatbot endpoints."""
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.chat_agent import process_chat_message
from app.auth import get_current_user
from app.dependencies import get_db
from app.models import Conversation, Message
from app.schemas import (
    ChatRequest,
    ChatResponse,
    ConversationDetailResponse,
    ConversationListResponse,
    ConversationSummary,
    MessageResponse,
    ToolCall,
)

# Import MCP tools to ensure they are registered
from app.mcp import tools  # noqa: F401

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def send_chat_message(
    request: ChatRequest,
    current_user_id: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a message to the AI chatbot.

    Creates a new conversation if conversation_id is not provided.
    Stores the user message and AI response in the database.

    Returns:
        ChatResponse: AI response with conversation ID and any tool calls
    """
    conversation: Conversation | None = None

    # Get or create conversation
    if request.conversation_id:
        result = await db.execute(
            select(Conversation).where(Conversation.id == request.conversation_id)
        )
        conversation = result.scalar_one_or_none()

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        if conversation.user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden",
            )
    else:
        # Create new conversation
        conversation = Conversation(user_id=current_user_id)
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

    # Get conversation history (last 20 messages)
    history_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(20)
    )
    history_messages = list(reversed(history_result.scalars().all()))

    # Format history for agent
    conversation_history = [
        {"role": msg.role, "content": msg.content} for msg in history_messages
    ]

    # Store user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    await db.commit()

    # Process message with AI agent
    try:
        response_text, tool_calls_made = await process_chat_message(
            message=request.message,
            conversation_history=conversation_history,
            user_id=current_user_id,
            db=db,
        )
    except Exception as e:
        # Log error and return friendly message
        import traceback
        print(f"Error processing chat message: {e}")
        traceback.print_exc()
        # Return the error as a response instead of crashing
        response_text = f"Error: {str(e)}"
        tool_calls_made = []

    # Store AI response
    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=response_text,
        tool_calls=tool_calls_made if tool_calls_made else None,
    )
    db.add(assistant_message)

    # Update conversation timestamp
    conversation.updated_at = datetime.utcnow()

    await db.commit()

    return ChatResponse(
        response=response_text,
        conversation_id=conversation.id,
        tool_calls=[
            ToolCall(
                tool=tc["tool"],
                arguments=tc["arguments"],
                result=tc["result"],
            )
            for tc in tool_calls_made
        ],
    )


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    current_user_id: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List user's conversations.

    Returns:
        ConversationListResponse: List of conversation summaries
    """
    # Get conversations with message count
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user_id)
        .order_by(Conversation.updated_at.desc())
    )
    conversations = result.scalars().all()

    # Get message counts for each conversation
    summaries = []
    for conv in conversations:
        count_result = await db.execute(
            select(func.count(Message.id)).where(Message.conversation_id == conv.id)
        )
        message_count = count_result.scalar() or 0

        summaries.append(
            ConversationSummary(
                id=conv.id,
                title=conv.title,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                message_count=message_count,
            )
        )

    return ConversationListResponse(
        conversations=summaries,
        total=len(summaries),
    )


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: UUID,
    limit: int = Query(default=20, ge=1, le=100),
    current_user_id: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific conversation with messages.

    Args:
        conversation_id: The conversation UUID
        limit: Number of messages to return (default 20, max 100)

    Returns:
        ConversationDetailResponse: Conversation with messages
    """
    # Get conversation
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if conversation.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden",
        )

    # Get message count
    count_result = await db.execute(
        select(func.count(Message.id)).where(Message.conversation_id == conversation_id)
    )
    total_messages = count_result.scalar() or 0

    # Get messages (limited)
    messages_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit + 1)  # Get one extra to check if there are more
    )
    messages = list(reversed(messages_result.scalars().all()))

    # Check if there are more messages
    has_more = len(messages) > limit
    if has_more:
        messages = messages[1:]  # Remove the oldest if there are more

    # Format messages
    message_responses = [
        MessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            tool_calls=[
                ToolCall(tool=tc["tool"], arguments=tc["arguments"], result=tc["result"])
                for tc in (msg.tool_calls or [])
            ]
            if msg.tool_calls
            else None,
            created_at=msg.created_at,
        )
        for msg in messages
    ]

    return ConversationDetailResponse(
        conversation=ConversationSummary(
            id=conversation.id,
            title=conversation.title,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
            message_count=total_messages,
        ),
        messages=message_responses,
        has_more=has_more,
    )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: UUID,
    current_user_id: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a conversation and all its messages.
    """
    # Get conversation
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if conversation.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden",
        )

    # Delete all messages first (cascade would handle this, but being explicit)
    messages_result = await db.execute(
        select(Message).where(Message.conversation_id == conversation_id)
    )
    messages = messages_result.scalars().all()
    for msg in messages:
        await db.delete(msg)

    # Delete conversation
    await db.delete(conversation)
    await db.commit()

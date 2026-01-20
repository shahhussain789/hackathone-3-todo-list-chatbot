"""MCP tool for creating tasks."""
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.mcp.server import register_tool
from app.models import Task


@register_tool("add_task")
async def add_task(
    arguments: dict[str, Any],
    user_id: UUID,
    db: AsyncSession,
) -> dict[str, Any]:
    """Create a new task for the user.

    Args:
        arguments: Tool arguments containing "title" and optional "description"
        user_id: Authenticated user's ID
        db: Database session

    Returns:
        Result dict with task_id, status, title per MCP spec
    """
    title = arguments.get("title", "").strip()
    desc_raw = arguments.get("description")
    description = desc_raw.strip() if desc_raw else None

    if not title:
        return {
            "success": False,
            "error": "Title is required",
            "message": "I need a title for the task. What would you like to add?",
        }

    if len(title) > 500:
        return {
            "success": False,
            "error": "Title too long",
            "message": "That title is too long. Please keep it under 500 characters.",
        }

    # Create the task
    task = Task(
        title=title,
        description=description,
        user_id=user_id,
        is_completed=False,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Build response message
    if task.description:
        msg = f"Got it! I've added '{task.title}' to your tasks.\n📝 Description: {task.description}"
    else:
        msg = f"Got it! I've added '{task.title}' to your tasks."

    return {
        "success": True,
        "task_id": str(task.id),
        "status": "created",
        "title": task.title,
        "description": task.description,
        "message": msg,
    }

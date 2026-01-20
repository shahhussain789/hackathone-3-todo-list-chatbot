"""MCP tool for completing tasks."""
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.mcp.server import register_tool
from app.models import Task


@register_tool("complete_task")
async def complete_task(
    arguments: dict[str, Any],
    user_id: UUID,
    db: AsyncSession,
) -> dict[str, Any]:
    """Mark a task as complete.

    Args:
        arguments: Tool arguments containing "task_id" (required per spec)
        user_id: Authenticated user's ID
        db: Database session

    Returns:
        Result dict with task_id, status, title per MCP spec
    """
    task_id_str = arguments.get("task_id")
    title = arguments.get("title", "").strip()  # Allow title search as fallback

    if not task_id_str and not title:
        return {
            "success": False,
            "error": "Task ID or title required",
            "message": "I need to know which task to complete. Can you tell me the task name or ID?",
        }

    # Build query to find the task
    query = select(Task).where(Task.user_id == user_id)

    if task_id_str:
        try:
            task_id = UUID(task_id_str)
            query = query.where(Task.id == task_id)
        except ValueError:
            # Try as title search if not valid UUID
            query = query.where(Task.title.ilike(f"%{task_id_str}%"))
    else:
        # Search by title (case-insensitive partial match)
        query = query.where(Task.title.ilike(f"%{title}%"))

    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        return {
            "success": False,
            "error": "Task not found",
            "message": "I couldn't find that task. Would you like me to show your tasks?",
        }

    if task.is_completed:
        return {
            "success": True,
            "task_id": str(task.id),
            "status": "completed",
            "title": task.title,
            "message": f"'{task.title}' is already marked as complete!",
        }

    # Mark as complete
    task.is_completed = True
    await db.commit()
    await db.refresh(task)

    return {
        "success": True,
        "task_id": str(task.id),
        "status": "completed",
        "title": task.title,
        "message": f"Awesome! '{task.title}' is done! 🎉 Keep up the great work!",
    }

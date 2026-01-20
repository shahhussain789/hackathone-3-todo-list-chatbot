"""MCP tool for deleting tasks."""
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.mcp.server import register_tool
from app.models import Task


@register_tool("delete_task")
async def delete_task(
    arguments: dict[str, Any],
    user_id: UUID,
    db: AsyncSession,
) -> dict[str, Any]:
    """Delete a task.

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
            "message": "I need to know which task to delete. Can you tell me the task name or ID?",
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
            "message": "I couldn't find that task. Would you like me to show your current tasks?",
        }

    # Store task info before deletion
    task_title = task.title
    task_id_result = str(task.id)

    # Delete the task
    await db.delete(task)
    await db.commit()

    return {
        "success": True,
        "task_id": task_id_result,
        "status": "deleted",
        "title": task_title,
        "message": f"Done! I've removed '{task_title}' from your tasks.",
    }

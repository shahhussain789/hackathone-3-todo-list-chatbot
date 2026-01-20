"""MCP tool for updating tasks."""
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.mcp.server import register_tool
from app.models import Task


@register_tool("update_task")
async def update_task(
    arguments: dict[str, Any],
    user_id: UUID,
    db: AsyncSession,
) -> dict[str, Any]:
    """Update a task's title or description.

    Args:
        arguments: Tool arguments containing "task_id" (required),
                   "title" (optional), "description" (optional)
        user_id: Authenticated user's ID
        db: Database session

    Returns:
        Result dict with task_id, status, title per MCP spec
    """
    task_id_str = arguments.get("task_id")
    old_title = arguments.get("old_title", "").strip()  # For finding by title
    new_title = arguments.get("title", "").strip()
    new_description = arguments.get("description")

    if not task_id_str and not old_title:
        return {
            "success": False,
            "error": "Task ID or current title required",
            "message": "I need to know which task to update. Can you tell me the task name or ID?",
        }

    if not new_title and new_description is None:
        return {
            "success": False,
            "error": "Nothing to update",
            "message": "What would you like to change? You can update the title or description.",
        }

    if new_title and len(new_title) > 500:
        return {
            "success": False,
            "error": "Title too long",
            "message": "That title is too long. Please keep it under 500 characters.",
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
        query = query.where(Task.title.ilike(f"%{old_title}%"))

    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        return {
            "success": False,
            "error": "Task not found",
            "message": "I couldn't find that task. Can you check the task name and try again?",
        }

    # Store old title for response
    previous_title = task.title

    # Update the task
    if new_title:
        task.title = new_title
    if new_description is not None:
        task.description = new_description if new_description else None

    await db.commit()
    await db.refresh(task)

    return {
        "success": True,
        "task_id": str(task.id),
        "status": "updated",
        "title": task.title,
        "message": f"Updated! '{previous_title}' is now '{task.title}'.",
    }

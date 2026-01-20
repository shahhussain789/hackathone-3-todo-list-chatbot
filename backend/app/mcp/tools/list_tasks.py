"""MCP tool for listing tasks."""
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.mcp.server import register_tool
from app.models import Task


@register_tool("list_tasks")
async def list_tasks(
    arguments: dict[str, Any],
    user_id: UUID,
    db: AsyncSession,
) -> dict[str, Any]:
    """List user's tasks with optional status filter.

    Args:
        arguments: Tool arguments, optionally containing "status" filter
                   ("all", "pending", "completed")
        user_id: Authenticated user's ID
        db: Database session

    Returns:
        Result dict with array of task objects per MCP spec
    """
    # Build query
    query = select(Task).where(Task.user_id == user_id)

    # Apply status filter if provided
    status_filter = arguments.get("status", "all")
    if status_filter == "pending":
        query = query.where(Task.is_completed == False)
    elif status_filter == "completed":
        query = query.where(Task.is_completed == True)
    # "all" or no filter shows everything

    # Order by creation date
    query = query.order_by(Task.created_at.desc())

    # Execute query
    result = await db.execute(query)
    tasks = result.scalars().all()

    # Format tasks for response per spec
    task_list = [
        {
            "id": str(task.id),
            "title": task.title,
            "description": task.description,
            "completed": task.is_completed,
        }
        for task in tasks
    ]

    # Build message
    if not task_list:
        if status_filter == "pending":
            message = "You don't have any pending tasks. Great job! 🎉"
        elif status_filter == "completed":
            message = "You haven't completed any tasks yet. Let's get started!"
        else:
            message = "You don't have any tasks yet. Would you like to add one?"
    else:
        # Format as a readable list with checkboxes
        lines = []
        for i, task in enumerate(task_list, 1):
            checkbox = "✅" if task["completed"] else "⬜"
            line = f"{i}. {checkbox} {task['title']}"
            if task.get("description"):
                line += f"\n   📝 {task['description']}"
            lines.append(line)

        if status_filter == "pending":
            message = f"Here are your pending tasks:\n" + "\n".join(lines)
        elif status_filter == "completed":
            message = f"Here are your completed tasks:\n" + "\n".join(lines)
        else:
            message = f"Here are your tasks:\n" + "\n".join(lines)

    return {
        "success": True,
        "tasks": task_list,
        "total": len(task_list),
        "message": message,
    }

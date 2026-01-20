"""MCP Server setup for task management tools.

This module provides the tool definitions that are registered with the OpenAI agent.
Each tool follows the MCP contract defined in specs/001-ai-chatbot/contracts/chat-api.md.
"""
from typing import Any, Callable
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

# Tool registry - maps tool names to handler functions
_tool_registry: dict[str, Callable] = {}


def register_tool(name: str):
    """Decorator to register a tool handler."""

    def decorator(func: Callable):
        _tool_registry[name] = func
        return func

    return decorator


def get_tool_handler(name: str) -> Callable | None:
    """Get a registered tool handler by name."""
    return _tool_registry.get(name)


def get_registered_tools() -> list[str]:
    """Get list of all registered tool names."""
    return list(_tool_registry.keys())


async def execute_tool(
    tool_name: str,
    arguments: dict[str, Any],
    user_id: UUID,
    db: AsyncSession,
) -> dict[str, Any]:
    """Execute a registered MCP tool.

    Args:
        tool_name: Name of the tool to execute
        arguments: Tool arguments from the AI agent
        user_id: Authenticated user's ID (from JWT)
        db: Database session

    Returns:
        Tool result as a dictionary with success/error status
    """
    handler = get_tool_handler(tool_name)
    if handler is None:
        return {
            "success": False,
            "error": f"Unknown tool: {tool_name}",
            "message": f"I don't know how to do that yet. Available actions: {', '.join(get_registered_tools())}",
        }

    try:
        return await handler(arguments=arguments, user_id=user_id, db=db)
    except Exception as e:
        import traceback
        print(f"Tool execution error ({tool_name}): {e}")
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "message": f"Tool error: {str(e)}",
        }


# OpenAI function definitions for the agent
# These are the tool schemas passed to the OpenAI API per MCP spec
TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user. Use when user wants to add, create, remember, or make a new task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title of the task to create (required)",
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional description with more details about the task",
                    },
                },
                "required": ["title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "Retrieve and list the user's tasks. Use when user wants to see, show, view, or list their tasks.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "description": "Filter tasks by status: 'all' for everything, 'pending' for incomplete, 'completed' for done tasks",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as complete. Use when user says done, complete, finished, or check off a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "The ID of the task to complete",
                    },
                    "title": {
                        "type": "string",
                        "description": "The title/name of the task to complete (used to find the task)",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Remove a task from the list. Use when user wants to delete, remove, or cancel a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "The ID of the task to delete",
                    },
                    "title": {
                        "type": "string",
                        "description": "The title/name of the task to delete (used to find the task)",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Modify a task's title or description. Use when user wants to change, update, rename, or edit a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "The ID of the task to update",
                    },
                    "old_title": {
                        "type": "string",
                        "description": "The current title of the task (used to find it if task_id not provided)",
                    },
                    "title": {
                        "type": "string",
                        "description": "The new title for the task",
                    },
                    "description": {
                        "type": "string",
                        "description": "The new description for the task",
                    },
                },
                "required": [],
            },
        },
    },
]

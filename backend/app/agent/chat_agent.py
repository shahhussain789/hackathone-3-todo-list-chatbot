"""Simple rule-based chat agent for task management.

This module processes user messages and invokes MCP tools based on
pattern matching - no external AI API required.
"""
import re
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.mcp.server import execute_tool


async def process_chat_message(
    message: str,
    conversation_history: list[dict[str, Any]],
    user_id: UUID,
    db: AsyncSession,
) -> tuple[str, list[dict[str, Any]]]:
    """Process a user message and return response with any tool calls.

    Args:
        message: The user's message
        conversation_history: Previous messages (not used in rule-based approach)
        user_id: Authenticated user's ID
        db: Database session

    Returns:
        Tuple of (response_text, tool_calls_list)
    """
    msg = message.lower().strip()
    tool_calls_made: list[dict[str, Any]] = []

    # Greeting patterns
    if is_greeting(msg):
        return get_greeting_response(), []

    # Thank you / goodbye patterns
    if is_thanks_or_bye(msg):
        return get_goodbye_response(), []

    # Help patterns
    if is_help_request(msg):
        return get_help_response(), []

    # ADD TASK patterns
    add_match = match_add_task(msg)
    if add_match:
        title, description = add_match
        result = await execute_tool(
            tool_name="add_task",
            arguments={"title": title, "description": description},
            user_id=user_id,
            db=db,
        )
        tool_calls_made.append({
            "tool": "add_task",
            "arguments": {"title": title, "description": description},
            "result": result,
        })
        return result.get("message", "Task added!"), tool_calls_made

    # LIST TASKS patterns
    list_match = match_list_tasks(msg)
    if list_match is not None:
        result = await execute_tool(
            tool_name="list_tasks",
            arguments={"status": list_match},
            user_id=user_id,
            db=db,
        )
        tool_calls_made.append({
            "tool": "list_tasks",
            "arguments": {"status": list_match},
            "result": result,
        })
        return result.get("message", "Here are your tasks."), tool_calls_made

    # COMPLETE TASK patterns
    complete_match = match_complete_task(msg)
    if complete_match:
        result = await execute_tool(
            tool_name="complete_task",
            arguments={"title": complete_match},
            user_id=user_id,
            db=db,
        )
        tool_calls_made.append({
            "tool": "complete_task",
            "arguments": {"title": complete_match},
            "result": result,
        })
        return result.get("message", "Task completed!"), tool_calls_made

    # DELETE TASK patterns
    delete_match = match_delete_task(msg)
    if delete_match:
        result = await execute_tool(
            tool_name="delete_task",
            arguments={"title": delete_match},
            user_id=user_id,
            db=db,
        )
        tool_calls_made.append({
            "tool": "delete_task",
            "arguments": {"title": delete_match},
            "result": result,
        })
        return result.get("message", "Task deleted!"), tool_calls_made

    # UPDATE TASK patterns
    update_match = match_update_task(msg)
    if update_match:
        old_title, new_title = update_match
        result = await execute_tool(
            tool_name="update_task",
            arguments={"old_title": old_title, "title": new_title},
            user_id=user_id,
            db=db,
        )
        tool_calls_made.append({
            "tool": "update_task",
            "arguments": {"old_title": old_title, "title": new_title},
            "result": result,
        })
        return result.get("message", "Task updated!"), tool_calls_made

    # Nothing matched - politely decline
    return get_sorry_response(), []


# ============ Pattern Matching Functions ============

def is_greeting(msg: str) -> bool:
    """Check if message is a greeting."""
    greetings = [
        "hi", "hello", "hey", "hola", "good morning", "good afternoon",
        "good evening", "howdy", "greetings", "what's up", "whats up",
        "sup", "yo", "hii", "hiii", "hiiii"
    ]
    return any(msg == g or msg.startswith(g + " ") or msg.startswith(g + "!") for g in greetings)


def is_thanks_or_bye(msg: str) -> bool:
    """Check if message is thanks or goodbye."""
    patterns = [
        "thank", "thanks", "bye", "goodbye", "see you", "later",
        "take care", "cya", "ttyl"
    ]
    return any(p in msg for p in patterns)


def is_help_request(msg: str) -> bool:
    """Check if user needs help."""
    patterns = ["help", "what can you do", "how do i", "how to"]
    return any(p in msg for p in patterns)


def match_add_task(msg: str) -> tuple[str, str | None] | None:
    """Match add task patterns and extract title and optional description."""

    # First check for patterns with description
    # Handle typos: description, desription, discription, desc
    desc_word = r"(?:description|desription|discription|desc)"

    desc_patterns = [
        # "add namaz with description pray 5 times"
        rf"^add\s+(.+?)\s+with\s+{desc_word}\s+(.+)$",
        # "add namaz description pray 5 times"
        rf"^add\s+(.+?)\s+{desc_word}\s+(.+)$",
        # "add task namaz with description pray 5 times"
        rf"^add\s+task\s+(.+?)\s+with\s+{desc_word}\s+(.+)$",
        # "add task namaz description pray 5 times"
        rf"^add\s+task\s+(.+?)\s+{desc_word}\s+(.+)$",
        # "add namaz to task with description pray 5 times"
        rf"^add\s+(.+?)\s+to\s+task\s+with\s+{desc_word}\s+(.+)$",
        # "add namaz - pray 5 times" or "add namaz: pray 5 times"
        r"^add\s+(?:task\s+)?(.+?)\s*[-:]\s*(.+)$",
        # "create namaz with description pray 5 times"
        rf"^create\s+(?:task\s+)?(.+?)\s+with\s+{desc_word}\s+(.+)$",
        rf"^create\s+(?:task\s+)?(.+?)\s+{desc_word}\s+(.+)$",
    ]
    for pattern in desc_patterns:
        match = re.match(pattern, msg, re.IGNORECASE)
        if match:
            title = match.group(1).strip()
            description = match.group(2).strip()
            # Clean up
            title = re.sub(r"\s+(?:to\s+)?(?:my\s+)?tasks?$", "", title, flags=re.IGNORECASE)
            title = re.sub(r"\s+(please|pls|plz)$", "", title, flags=re.IGNORECASE)
            if title:
                return (title.capitalize(), description)

    # Simple patterns without description
    patterns = [
        r"^add\s+(.+?)\s+(?:to\s+)?(?:my\s+)?tasks?$",
        r"^add\s+(?:a\s+)?(?:task\s+)?(?:to\s+)?(?:called\s+)?(.+)$",
        r"^create\s+(?:a\s+)?(?:task\s+)?(?:to\s+)?(?:called\s+)?(.+)$",
        r"^new\s+task\s+(.+)$",
        r"^i\s+need\s+to\s+(.+)$",
        r"^remind\s+me\s+to\s+(.+)$",
        r"^remember\s+to\s+(.+)$",
        r"^don'?t\s+forget\s+to\s+(.+)$",
        r"^i\s+have\s+to\s+(.+)$",
        r"^i\s+must\s+(.+)$",
        r"^i\s+should\s+(.+)$",
        r"^todo\s+(.+)$",
        r"^task\s+(.+)$",
        r"^(.+?)\s+add\s+(?:to\s+)?(?:my\s+)?tasks?$",
    ]
    for pattern in patterns:
        match = re.match(pattern, msg, re.IGNORECASE)
        if match:
            title = match.group(1).strip()
            # Clean up common trailing words
            title = re.sub(r"\s+(please|pls|plz)$", "", title, flags=re.IGNORECASE)
            title = re.sub(r"\s+to\s+(?:my\s+)?tasks?$", "", title, flags=re.IGNORECASE)
            if title:
                return (title.capitalize(), None)
    return None


def match_list_tasks(msg: str) -> str | None:
    """Match list tasks patterns and return status filter."""
    # Completed tasks
    if any(p in msg for p in ["completed", "done tasks", "finished", "what have i completed", "what did i complete"]):
        return "completed"

    # Pending tasks
    if any(p in msg for p in ["pending", "incomplete", "not done", "what's pending", "whats pending", "to do", "todo"]):
        return "pending"

    # All tasks
    all_patterns = [
        "show", "list", "display", "view", "see", "what are my",
        "my tasks", "all tasks", "tasks", "what do i have"
    ]
    if any(p in msg for p in all_patterns):
        return "all"

    return None


def match_complete_task(msg: str) -> str | None:
    """Match complete task patterns and extract task identifier."""
    patterns = [
        r"^(?:mark\s+)?(.+?)\s+(?:as\s+)?(?:done|complete|completed|finished)$",
        r"^complete\s+(.+)$",
        r"^finish\s+(.+)$",
        r"^done\s+(?:with\s+)?(.+)$",
        r"^i\s+(?:have\s+)?(?:finished|completed|done)\s+(.+)$",
        r"^check\s+off\s+(.+)$",
        r"^tick\s+(?:off\s+)?(.+)$",
    ]
    for pattern in patterns:
        match = re.match(pattern, msg, re.IGNORECASE)
        if match:
            task = match.group(1).strip()
            # Remove common words
            task = re.sub(r"^(?:the\s+|task\s+|my\s+)", "", task, flags=re.IGNORECASE)
            task = re.sub(r"\s+task$", "", task, flags=re.IGNORECASE)
            if task:
                return task
    return None


def match_delete_task(msg: str) -> str | None:
    """Match delete task patterns and extract task identifier."""
    patterns = [
        r"^delete\s+(?:the\s+)?(?:task\s+)?(.+?)(?:\s+from\s+(?:my\s+)?tasks?)?$",
        r"^remove\s+(?:the\s+)?(?:task\s+)?(.+?)(?:\s+from\s+(?:my\s+)?tasks?)?$",
        r"^cancel\s+(?:the\s+)?(?:task\s+)?(.+)$",
        r"^get\s+rid\s+of\s+(?:the\s+)?(?:task\s+)?(.+)$",
        r"^drop\s+(?:the\s+)?(?:task\s+)?(.+)$",
        r"^(.+?)\s+delete\s+(?:from\s+)?(?:my\s+)?tasks?$",
        r"^(.+?)\s+remove\s+(?:from\s+)?(?:my\s+)?tasks?$",
        r"^delete\s+(.+?)\s+task$",
        r"^remove\s+(.+?)\s+task$",
    ]
    for pattern in patterns:
        match = re.match(pattern, msg, re.IGNORECASE)
        if match:
            task = match.group(1).strip()
            task = re.sub(r"\s+task$", "", task, flags=re.IGNORECASE)
            task = re.sub(r"^the\s+", "", task, flags=re.IGNORECASE)
            if task:
                return task
    return None


def match_update_task(msg: str) -> tuple[str, str] | None:
    """Match update task patterns and extract old/new titles."""
    patterns = [
        r"^(?:change|update|rename|edit)\s+(.+?)\s+to\s+(.+)$",
        r"^(.+?)\s+should\s+be\s+(.+)$",
    ]
    for pattern in patterns:
        match = re.match(pattern, msg, re.IGNORECASE)
        if match:
            old_title = match.group(1).strip()
            new_title = match.group(2).strip()
            # Clean up
            old_title = re.sub(r"^(?:the\s+|task\s+|my\s+)", "", old_title, flags=re.IGNORECASE)
            if old_title and new_title:
                return (old_title, new_title.capitalize())
    return None


# ============ Response Templates ============

def get_greeting_response() -> str:
    return """Hey there! 👋 I'm your Task Assistant!

I can help you manage your tasks. Try saying:
• "Add buy groceries" - to add a task
• "Show my tasks" - to see all tasks
• "Complete groceries" - to mark done
• "Delete groceries" - to remove a task
• "Change groceries to buy fruits" - to update

What would you like to do?"""


def get_help_response() -> str:
    return """Here's what I can do:

📝 **Add a task:**
• "Add buy groceries"
• "I need to call mom"
• "Remind me to pay bills"

📋 **View tasks:**
• "Show my tasks"
• "What's pending?"
• "Show completed tasks"

✅ **Complete a task:**
• "Mark groceries as done"
• "Complete the meeting task"
• "Done with laundry"

🗑️ **Delete a task:**
• "Delete groceries"
• "Remove the old task"

✏️ **Update a task:**
• "Change groceries to buy fruits"
• "Rename meeting to call boss"

How can I help you?"""


def get_goodbye_response() -> str:
    return "You're welcome! Good luck with your tasks! 💪 Let me know if you need anything else."


def get_sorry_response() -> str:
    return """Sorry, I can only help with task management! 🙏

Try commands like:
• "Add [task name]" - create a task
• "Show my tasks" - list tasks
• "Complete [task]" - mark as done
• "Delete [task]" - remove a task
• "Change [old] to [new]" - update a task

What would you like to do with your tasks?"""

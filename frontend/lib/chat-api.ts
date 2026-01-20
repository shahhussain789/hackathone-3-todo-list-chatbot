/**
 * Chat API client utilities for AI chatbot functionality.
 */

import { api } from "./api";
import type {
  ChatRequest,
  ChatResponse,
  ConversationDetailResponse,
  ConversationListResponse,
} from "./types";

/**
 * Send a message to the AI chatbot.
 *
 * @param message - The user's message
 * @param conversationId - Optional conversation ID to continue an existing conversation
 * @returns Chat response with AI reply and any tool calls made
 */
export async function sendMessage(
  message: string,
  conversationId?: string
): Promise<{ data?: ChatResponse; error?: { detail: string; status_code?: number } }> {
  const request: ChatRequest = {
    message,
    conversation_id: conversationId,
  };
  return api.post<ChatResponse>("/api/chat", request);
}

/**
 * Get list of user's conversations.
 *
 * @returns List of conversation summaries
 */
export async function getConversations(): Promise<{
  data?: ConversationListResponse;
  error?: { detail: string; status_code?: number };
}> {
  return api.get<ConversationListResponse>("/api/chat/conversations");
}

/**
 * Get a specific conversation with its messages.
 *
 * @param conversationId - The conversation ID
 * @param limit - Number of messages to return (default 20)
 * @returns Conversation details with messages
 */
export async function getConversation(
  conversationId: string,
  limit: number = 20
): Promise<{
  data?: ConversationDetailResponse;
  error?: { detail: string; status_code?: number };
}> {
  return api.get<ConversationDetailResponse>(
    `/api/chat/conversations/${conversationId}?limit=${limit}`
  );
}

/**
 * Delete a conversation and all its messages.
 *
 * @param conversationId - The conversation ID to delete
 * @returns Success or error
 */
export async function deleteConversation(
  conversationId: string
): Promise<{ data?: void; error?: { detail: string; status_code?: number } }> {
  return api.delete(`/api/chat/conversations/${conversationId}`);
}

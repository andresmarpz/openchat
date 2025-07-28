import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import {
  chats,
  chatMessages,
  chatPartsText,
  chatPartReasoning,
  chatPartTool,
  chatPartSourceUrl,
  chatPartFile,
  type Chat,
  type ChatMessagePart,
} from "../db/schema";

export type MessagePartInput =
  | { type: "text"; text: string; state?: string | null }
  | {
      type: "reasoning";
      reasoning: string;
      state?: string | null;
      providerMetadata?: any;
    }
  | {
      type: "tool";
      toolCallId: string;
      input?: any;
      output?: any;
      state?: string | null;
      errorText?: string | null;
    }
  | {
      type: "source_url";
      sourceId: string;
      url: string;
      title?: string | null;
      providerMetadata?: any;
    }
  | {
      type: "file";
      url: string;
      mediaType?: string | null;
      filename?: string | null;
    };

export interface ChatMessage {
  id: string;
  role: "human" | "ai";
  chat_id: string;
  created_at: Date;
  updated_at: Date;
  parts: Omit<ChatMessagePart, "chat_message_id">[];
}

export interface ChatWithMessages extends Chat {
  messages: ChatMessage[];
}

export class ChatService {
  /**
   * Get a single chat with all its messages and message parts in a single query
   */
  static async getChatWithMessages(
    chatId: string
  ): Promise<ChatWithMessages | null> {
    const result = await db.query.chats.findFirst({
      where: eq(chats.chat_id, chatId),
      with: {
        messages: {
          orderBy: [desc(chatMessages.created_at)],
          with: {
            textParts: {
              orderBy: [chatPartsText.index],
            },
            reasoningParts: {
              orderBy: [chatPartReasoning.index],
            },
            toolParts: {
              orderBy: [chatPartTool.index],
            },
            sourceUrlParts: {
              orderBy: [chatPartSourceUrl.index],
            },
            fileParts: {
              orderBy: [chatPartFile.index],
            },
          },
        },
      },
    });

    if (!result) return null;

    // Transform the result to combine all message parts into a single array
    const transformedMessages: ChatMessage[] = result.messages.map(
      (message) => {
        const parts: Omit<ChatMessagePart, "chat_message_id">[] = [
          ...message.textParts.map((part) => ({
            type: "text" as const,
            index: part.index,
            state: part.state,
            text: part.text,
          })),
          ...message.reasoningParts.map((part) => ({
            type: "reasoning" as const,
            index: part.index,
            state: part.state,
            reasoning: part.reasoning,
            providerMetadata: part.providerMetadata,
          })),
          ...message.toolParts.map((part) => ({
            type: "tool" as const,
            index: part.index,
            state: part.state,
            toolCallId: part.toolCallId,
            input: part.input,
            output: part.output,
            errorText: part.errorText,
          })),
          ...message.sourceUrlParts.map((part) => ({
            type: "source_url" as const,
            index: part.index,
            sourceId: part.sourceId,
            url: part.url,
            title: part.title,
            providerMetadata: part.providerMetadata,
          })),
          ...message.fileParts.map((part) => ({
            type: "file" as const,
            index: part.index,
            mediaType: part.mediaType,
            filename: part.filename,
            url: part.url,
          })),
        ].sort((a, b) => a.index - b.index);

        return {
          id: message.id,
          role: message.role,
          chat_id: message.chat_id,
          created_at: message.created_at,
          updated_at: message.updated_at,
          parts,
        };
      }
    );

    return {
      ...result,
      messages: transformedMessages,
    };
  }

  /**
   * Get user's chats with message count (no message content for performance)
   */
  static async getUserChats(
    userId: string
  ): Promise<(Chat & { messageCount: number })[]> {
    const userChats = await db.query.chats.findMany({
      where: eq(chats.user_id, userId),
      with: {
        messages: {
          columns: {
            id: true,
          },
        },
      },
      orderBy: [desc(chats.updated_at)],
    });

    return userChats.map((chat) => ({
      ...chat,
      messageCount: chat.messages.length,
      messages: undefined, // Remove messages from response
    }));
  }

  /**
   * Create a new chat
   */
  static async createChat(
    userId: string,
    title: string,
    chatId?: string
  ): Promise<Chat> {
    const [chat] = await db
      .insert(chats)
      .values({
        title,
        user_id: userId,
        chat_id: chatId,
      })
      .returning();

    if (!chat) {
      throw new Error("Failed to create chat.");
    }

    return chat;
  }

  /**
   * Add a message to a chat
   */
  static async addMessage(
    chatId: string,
    role: "human" | "ai",
    parts: MessagePartInput[]
  ): Promise<ChatMessage> {
    return await db.transaction(async (tx) => {
      // Insert the message
      const [message] = await tx
        .insert(chatMessages)
        .values({
          chat_id: chatId,
          role,
        })
        .returning();

      if (!message) {
        throw new Error("Failed to create message.");
      }

      // Insert message parts
      const insertedParts: ChatMessagePart[] = [];

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) break;

        const index = i;

        switch (part.type) {
          case "text": {
            const [textPart] = await tx
              .insert(chatPartsText)
              .values({
                chat_message_id: message.id,
                type: "text",
                index,
                text: part.text,
                state: part.state,
              })
              .returning();
            if (!textPart) {
              throw new Error("Failed to create text part.");
            }
            insertedParts.push(textPart);
            break;
          }
          case "reasoning": {
            const [reasoningPart] = await tx
              .insert(chatPartReasoning)
              .values({
                chat_message_id: message.id,
                type: "reasoning",
                index,
                reasoning: part.reasoning,
                state: part.state,
                providerMetadata: part.providerMetadata,
              })
              .returning();
            if (!reasoningPart) {
              throw new Error("Failed to create reasoning part.");
            }
            insertedParts.push(reasoningPart);
            break;
          }
          case "tool": {
            const [toolPart] = await tx
              .insert(chatPartTool)
              .values({
                chat_message_id: message.id,
                type: "tool",
                index,
                toolCallId: part.toolCallId,
                input: part.input,
                output: part.output,
                state: part.state,
                errorText: part.errorText,
              })
              .returning();
            if (!toolPart) {
              throw new Error("Failed to create tool part.");
            }
            insertedParts.push(toolPart);
            break;
          }
          case "source_url": {
            const [sourceUrlPart] = await tx
              .insert(chatPartSourceUrl)
              .values({
                chat_message_id: message.id,
                type: "source_url",
                index,
                sourceId: part.sourceId,
                url: part.url,
                title: part.title,
                providerMetadata: part.providerMetadata,
              })
              .returning();
            if (!sourceUrlPart) {
              throw new Error("Failed to create source URL part.");
            }
            insertedParts.push(sourceUrlPart);
            break;
          }
          case "file": {
            const [filePart] = await tx
              .insert(chatPartFile)
              .values({
                chat_message_id: message.id,
                type: "file",
                index,
                url: part.url,
                mediaType: part.mediaType,
                filename: part.filename,
              })
              .returning();
            if (!filePart) {
              throw new Error("Failed to create file part.");
            }
            insertedParts.push(filePart);
            break;
          }
        }
      }

      return {
        id: message.id,
        role: message.role,
        chat_id: message.chat_id,
        created_at: message.created_at,
        updated_at: message.updated_at,
        parts: insertedParts,
      };
    });
  }
}

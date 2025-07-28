import { create } from "zustand";
import { Chat } from "@openchat/api/src/db/schema";

interface Setters {
  setCurrentChatId: (chatId: string) => void;
  addChat: (chat: Chat["chat_id"]) => void;
}

interface Getters {}

type Store = {
  chatId: string | null;
} & Getters &
  Setters;

export const useChatStore = create<Store>((set) => ({
  currentChatId: null,
  chats: [],
}));

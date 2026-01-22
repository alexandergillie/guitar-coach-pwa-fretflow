import { IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, Exercise, Roadmap, PracticeSession } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS, SEED_EXERCISES, SEED_ROADMAPS } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "", streak: 0 };
  static seedData = MOCK_USERS;
}
export class ExerciseEntity extends IndexedEntity<Exercise> {
  static readonly entityName = "exercise";
  static readonly indexName = "exercises";
  static readonly initialState: Exercise = {
    id: "", title: "", description: "", difficulty: "Beginner",
    technique: [], bpm: 0, category: "Speed", moveable: false
  };
  static seedData = SEED_EXERCISES;
}
export class RoadmapEntity extends IndexedEntity<Roadmap> {
  static readonly entityName = "roadmap";
  static readonly indexName = "roadmaps";
  static readonly initialState: Roadmap = { id: "", title: "", description: "", steps: [] };
  static seedData = SEED_ROADMAPS;
}
export class PracticeSessionEntity extends IndexedEntity<PracticeSession> {
  static readonly entityName = "session";
  static readonly indexName = "sessions";
  static readonly initialState: PracticeSession = {
    id: "", userId: "", exerciseId: "", timestamp: 0,
    duration: 0, accuracy: 0, achievedBpm: 0
  };
}
export type ChatBoardState = Chat & { messages: ChatMessage[] };
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = MOCK_CHATS.map(c => ({
    ...c,
    messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
  }));
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}
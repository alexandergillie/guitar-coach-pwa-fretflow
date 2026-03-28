import { IndexedEntity } from "./core-utils";
import type { User, Exercise, Roadmap, PracticeSession } from "@shared/types";
import { MOCK_USERS, SEED_EXERCISES, SEED_ROADMAPS } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", streak: 0 };
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
  static readonly initialState: Roadmap = {
    id: "", title: "", description: "", approach: "",
    durationWeeks: 0, targetTechniques: [], difficulty: "Beginner",
    timePerSessionMinutes: 0, theoryFocus: false, weeks: [],
  };
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

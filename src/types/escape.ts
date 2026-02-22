export type QuestionType = 'multiple' | 'short';

/** Single line in a clue-related dialogue */
export interface DialogueLine {
  characterId: string;
  text: string;
}

/** Position within a room (0–100%) for magnifying-glass hotspot */
export interface HotspotPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Clue {
  id: string;
  name: string;
  description?: string;
  /** Which room this clue is in (for floor plan); required when story has rooms */
  roomId?: string;
  /** Position inside the room for the magnifying-glass hotspot (0–100%) */
  hotspotPosition?: HotspotPosition;
  /** true면 평소엔 영역만 있고, 마우스 호버 시에만 돋보기 아이콘 표시 */
  hotspotShowOnHover?: boolean;
  /** @deprecated use roomId + hotspotPosition */
  hotspotId?: string;
  /** 1 = 피 묻은 종이칼, 2 = 침묵의 주사기 */
  chapter?: 1 | 2;
  /** Dialogue unlocked when this clue is found (reasoning through character statements) */
  dialogue?: DialogueLine[];
}

/** Position on floor plan image (percent 0–100). Button is centered on this point. */
export interface FloorPlanPosition {
  left: number;
  top: number;
}

/** A room in the mansion; click to enter and investigate */
export interface Room {
  id: string;
  name: string;
  /** CSS background for the room interior (used when image is not set) */
  background?: string;
  /** Room interior image URL (e.g. /escape/blue-moon/room-living.png). Overrides background when set. */
  image?: string;
  /** If true, all suspects are here; show alibi/story UI */
  isGathering?: boolean;
  /** Position(s) on floor plan (%). One room can have multiple positions (e.g. same room in two areas). */
  floorPlanPosition?: FloorPlanPosition | FloorPlanPosition[];
}

export interface Character {
  id: string;
  name: string;
  /** Initially hidden; revealed as story progresses */
  description?: string;
  revealed?: boolean;
  /** Short alibi/story title shown in living room (e.g. "그날 밤 알리바이") */
  livingRoomTitle?: string;
  /** Portrait image URL for circular face avatar (e.g. /escape/blue-moon/characters/junho.png) */
  image?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  correct?: boolean;
}

export interface Question {
  id: string;
  clueId: string;
  type: QuestionType;
  text: string;
  options?: QuestionOption[];
  /** For short answer, exact match or normalized match */
  correctAnswer?: string;
  /** When answered correctly, reveal this character */
  revealCharacterId?: string;
}

export interface Hotspot {
  id: string;
  /** Clue id given when clicked */
  clueId: string;
  /** CSS or percentage position: left, top, width, height (0-100) */
  position: { left: number; top: number; width: number; height: number };
  label?: string;
}

/** One statement (alibi/story) a character gives in the living room */
export interface LivingRoomStatement {
  characterId: string;
  text: string;
}

/** Follow-up Q&A when a suspect's alibi is selected in the living room */
export interface LivingRoomFollowUp {
  characterId: string;
  questions: { question: string; answer: string }[];
}

export interface EscapeStory {
  id: string;
  title: string;
  summary: string;
  /** Default background when no room is selected (legacy) */
  roomBackground: string;
  /** Floor plan image URL (e.g. /escape/blue-moon/floor-plan.png). Shown on the floor plan view when set. */
  floorPlanImage?: string;
  /** Start screen image (e.g. 대저택). Shown before floor plan when set. */
  startScreenImage?: string;
  /** Start screen BGM URL (loops until user clicks "사건 해결하기"). */
  startScreenBgm?: string;
  /** Mansion rooms; click to enter. When absent, single-room view (hotspots) is used */
  rooms?: Room[];
  clues: Clue[];
  characters: Character[];
  questions: Question[];
  hints: string[];
  /** character id */
  correctCriminalId: string;
  /** @deprecated use clues[].roomId + hotspotPosition; kept for backward compat */
  hotspots?: Hotspot[];
  /** When in living room (isGathering), statements each character can give */
  livingRoomStatements?: LivingRoomStatement[];
  /** Follow-up questions per character when their alibi is selected in the living room */
  livingRoomFollowUps?: LivingRoomFollowUp[];
}

export interface EscapeProgress {
  storyId: string;
  foundClueIds: string[];
  revealedCharacterIds: string[];
  answeredQuestionIds: string[];
  hintIndex: number;
  startTime: number;
  /** When cleared */
  clearTime?: number;
  /** Last saved at (for resume) */
  savedAt: number;
}

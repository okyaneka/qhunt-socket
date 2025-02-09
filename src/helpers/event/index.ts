import { EventEmitter } from "events";

export const EVENTS = {
  ScoreChanged: "score_changed",
} as const;

const event = new EventEmitter();

export default event;

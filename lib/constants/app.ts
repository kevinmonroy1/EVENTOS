export const APP_NAME = "Recuerdos";
export const DEFAULT_MAX_PHOTOS = 7;

export const EVENT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  CLOSED: "closed",
} as const;

export const INCIDENT_STATUS = {
  PENDING: "pending",
  REVIEWED: "reviewed",
  RESOLVED: "resolved",
} as const;

export const GUEST_STATUS = {
  EMPTY: "empty",
  INCOMPLETE: "incomplete",
  COMPLETE: "complete",
  BLOCKED: "blocked",
} as const;
export type GuestStatus = "empty" | "incomplete" | "complete" | "blocked";

export interface GuestItem {
  id: string;
  eventId: string;
  displayName: string;
  normalizedName: string;
  uploadedCount: number;
  maxAllowed: number;
  status: GuestStatus;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}
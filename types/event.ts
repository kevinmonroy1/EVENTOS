export type EventStatus = "draft" | "active" | "closed";

export interface EventItem {
  id: string;
  slug: string;
  name: string;
  coupleNames: string;
  date: string | null;
  venue: string | null;
  coverImageUrl: string | null;
  status: EventStatus;
  maxPhotosPerGuest: number;
  sharedGalleryEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
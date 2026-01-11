// App Constants

export const APP_NAME = "Dreamland";
export const APP_DESCRIPTION = "Team Communication & Storage Platform";

export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  VOICE: "voice",
  FILE: "file"
} as const;

export const MESSAGE_STATUS = {
  SENDING: "sending",
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read"
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  MEMBER: "member"
} as const;

export const FILE_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  DOCUMENT: "document",
  OTHER: "other"
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VOICE_DURATION = 120; // 120 seconds

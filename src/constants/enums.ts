export enum TaskStatus {
  QUEUED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  DELETED = 3,
  EXPIRED = 4,
}

export enum TaskPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  URGENT = 3,
}

export enum RoutinePriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  URGENT = 3,
}

export enum GroupMemberRole {
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
}

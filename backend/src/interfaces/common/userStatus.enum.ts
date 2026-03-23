const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
} as const;
export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];
export default UserStatus;

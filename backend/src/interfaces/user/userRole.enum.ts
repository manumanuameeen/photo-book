const UserRole = {
  USER: "user",
  ADMIN: "admin",
  PHOTOGRAPHER: "photographer",
} as const;
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];
export default UserRole;

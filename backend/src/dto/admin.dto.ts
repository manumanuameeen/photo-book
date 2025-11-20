import { z } from "zod";

export const AdminUserQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(15).default(10),
  sort: z.string().default("createdAt"),
  search: z.string().optional().default(""),
});

export type AdminUserQueryDtoType = z.infer<typeof AdminUserQueryDto>;

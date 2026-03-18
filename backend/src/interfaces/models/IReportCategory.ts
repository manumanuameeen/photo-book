import { Document } from "mongoose";

export interface IReportCategory extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  subReasons: string[];
  createdAt: Date;
  updatedAt: Date;
}

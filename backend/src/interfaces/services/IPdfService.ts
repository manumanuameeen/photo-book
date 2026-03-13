import { IRentalOrder } from "../../models/rentalOrder.model.ts";

export interface IPdfService {
  generateRentalAgreement(order: IRentalOrder): Promise<Buffer>;
}

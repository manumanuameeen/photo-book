import { IRentalOrder } from "../../models/rentalOrder.model";

export interface IPdfService {
  generateRentalAgreement(order: IRentalOrder): Promise<Buffer>;
}

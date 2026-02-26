import { IRentalOrder } from "../../model/rentalOrderModel.ts";

export interface IPdfService {
  generateRentalAgreement(order: IRentalOrder): Promise<Buffer>;
}

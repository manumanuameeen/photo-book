import PDFDocument from "pdfkit";
import { IPdfService } from "../../interfaces/services/IPdfService";
import { IRentalOrder } from "../../models/rentalOrder.model";

export class PdfService implements IPdfService {
  async generateRentalAgreement(order: IRentalOrder): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const renterId = order.renterId as unknown;
      const renterName =
        renterId && typeof renterId === "object" && "name" in renterId
          ? (renterId as { name: string }).name
          : "Renter";
      const startDate = new Date(order.startDate).toLocaleDateString();
      const endDate = new Date(order.endDate).toLocaleDateString();
      const totalAmount = order.totalAmount;

      doc.fontSize(20).text("Rental Agreement", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Agreement ID: ${order._id}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      doc.text("This agreement is made between the Owner and the Renter named below.");
      doc.moveDown();

      doc.fontSize(14).text("Renter Details:");
      doc.fontSize(12).text(`Name: ${renterName}`);

      doc.moveDown();
      doc.fontSize(14).text("Rental Details:");
      doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`);
      doc.text(`Total Amount: $${totalAmount}`);

      doc.moveDown();
      doc.text("Terms and Conditions:");
      doc.fontSize(10).text("1. The Renter agrees to return the items in good condition.");
      doc.text("2. Late returns may incur additional fees.");
      doc.text("3. The Owner is not responsible for misuse of items.");

      doc.moveDown();
      doc.fontSize(12).text("Signed electronically by paying the deposit.");

      doc.end();
    });
  }
}


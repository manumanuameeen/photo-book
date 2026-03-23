import { IBookingService } from "./IBookingService";

export interface ICronService {
  init(bookingService: IBookingService): void;
}

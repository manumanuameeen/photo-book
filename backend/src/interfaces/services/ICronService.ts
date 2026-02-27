import { IBookingService } from "./IBookingService.ts";

export interface ICronService {
  init(bookingService: IBookingService): void;
}

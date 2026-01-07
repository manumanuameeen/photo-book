import { IBookingPackage } from "../../model/bookingPackageModel";
import { BaseRepository } from "../base/BaseRepository"; // Assuming you want to extend base types roughly, but interfaces don't extend classes.
// Usually interfaces extend other interfaces or define methods directly.
// Given BaseRepository structure, let's define the methods.

export interface IPackageRepository {
    create(data: Partial<IBookingPackage>): Promise<IBookingPackage>;
    findById(id: string): Promise<IBookingPackage | null>;
    findOne(query: Partial<IBookingPackage>): Promise<IBookingPackage | null>;
    update(id: string, data: Partial<IBookingPackage>): Promise<IBookingPackage | null>;
    findByPhotographerId(photographerId: string): Promise<IBookingPackage[]>;
    // Add delete if needed, but strict crud usually enough.
}

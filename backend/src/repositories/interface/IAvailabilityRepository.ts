import { IAvailability } from "../../model/availabilityModel";

export interface IAvailabilityRepository {
    create(data: Partial<IAvailability>): Promise<IAvailability>;
    findById(id: string): Promise<IAvailability | null>;
    findOne(query: Partial<IAvailability>): Promise<IAvailability | null>;
    update(id: string, data: Partial<IAvailability>): Promise<IAvailability | null>;

    findByPhotographerAndDate(photographerId: string, date: Date): Promise<IAvailability | null>;
    findByPhotographerAndDateRange(photographerId: string, startDate: Date, endDate: Date): Promise<IAvailability[]>;
}

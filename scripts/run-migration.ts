
import mongoose from "mongoose";
import { BookingPackageModel } from "../backend/src/model/bookingPackageModel.ts";
import { PortfolioSectionModel } from "../backend/src/model/portfolioSectionModel.ts";
import { PhotographerModel } from "../backend/src/model/photographerModel.ts";
import dotenv from "dotenv";
import path from "path";

  
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const runMigration = async () => {
    try {
        console.log("Connecting to MongoDB...");
        console.log("MONGO_URI:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Connected to MongoDB.");

        const photographers = await PhotographerModel.find({});
        console.log(`Found ${photographers.length} photographers.`);

        let updatedPackages = 0;
        let updatedPortfolios = 0;

        for (const photographer of photographers) {
            console.log(`Processing photographer: ${photographer.personalInfo.name} (User ID: ${photographer.userId}, Profile ID: ${photographer._id})`);

            
            const pkgResult = await BookingPackageModel.updateMany(
                { photographer: photographer.userId },
                { photographer: photographer._id }
            );
            if (pkgResult.modifiedCount > 0) {
                console.log(`  - Updated ${pkgResult.modifiedCount} packages.`);
                updatedPackages += pkgResult.modifiedCount;
            }

           
            const portfolioResult = await PortfolioSectionModel.updateMany(
                { photographerId: photographer.userId },
                { photographerId: photographer._id }
            );
            if (portfolioResult.modifiedCount > 0) {
                console.log(`  - Updated ${portfolioResult.modifiedCount} portfolio sections.`);
                updatedPortfolios += portfolioResult.modifiedCount;
            }
        }

        console.log("Migration Complete.");
        console.log(`Total Packages Fixed: ${updatedPackages}`);
        console.log(`Total Portfolio Sections Fixed: ${updatedPortfolios}`);

    } catch (error) {
        console.error("Migration Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

runMigration();

import multer from "multer";

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, 
    files: 20,
  },
  fileFilter: (req, file, cd) => {
    if (file.mimetype.startsWith("image/")) {
      cd(null, true);
    } else {
      cd(new Error("Only image files are allowed!"));
    }
  },
});

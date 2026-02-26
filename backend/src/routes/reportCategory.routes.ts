import { Router } from "express";
import { verifyAccessToken, verifyAdmin } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";
import { container } from "../di/container.ts";

const router = Router();
const reportCategoryController = container.reportCategoryController;

router.get(ROUTES.V1.REPORT_CATEGORY.GET_ALL, verifyAccessToken, verifyAdmin, (req, res) =>
    reportCategoryController.getAllCategories(req, res),
);

router.get(ROUTES.V1.REPORT_CATEGORY.GET_PUBLIC, (req, res) => reportCategoryController.getAllCategories(req, res));

router.post(ROUTES.V1.REPORT_CATEGORY.CREATE, verifyAccessToken, verifyAdmin, (req, res) =>
    reportCategoryController.createCategory(req, res),
);

router.get(ROUTES.V1.REPORT_CATEGORY.GET_BY_ID, verifyAccessToken, verifyAdmin, (req, res) =>
    reportCategoryController.getCategoryById(req, res),
);

router.patch(ROUTES.V1.REPORT_CATEGORY.UPDATE, verifyAccessToken, verifyAdmin, (req, res) =>
    reportCategoryController.updateCategory(req, res),
);

router.delete(ROUTES.V1.REPORT_CATEGORY.DELETE, verifyAccessToken, verifyAdmin, (req, res) =>
    reportCategoryController.deleteCategory(req, res),
);

export default router;

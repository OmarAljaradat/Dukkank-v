import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import visitorsRouter from "./visitors.js";
import authRouter from "./auth.js";
import analyticsRouter from "./analytics.js";
import ordersRouter from "./orders.js";
import couponsRouter from "./coupons.js";
import securityRouter from "./security.js";
import insightsRouter from "./insights.js";
import storeRouter from "./store.js";
import gamesRouter from "./games.js";
import subscriptionsRouter from "./subscriptions.js";
import reviewsRouter from "./reviews.js";
import promoRouter from "./promo.js";
import paymentsRouter from "./payments.js";
import emailRouter from "./email.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(visitorsRouter);
router.use(analyticsRouter);
router.use(ordersRouter);
router.use(couponsRouter);
router.use(securityRouter);
router.use(insightsRouter);
router.use(storeRouter);
router.use(gamesRouter);
router.use(subscriptionsRouter);
router.use(reviewsRouter);
router.use(promoRouter);
router.use(paymentsRouter);
router.use(emailRouter);

export default router;

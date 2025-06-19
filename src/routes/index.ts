import express from "express";
import authRouter from './auth.routes';
import emailRouter from './email.routes';
import fileRouter from './file.routes';
// import orderRouter from './order.routes';
import productRouter from './product.routes';
import blogpostRouter from './blogpost.routes';
import reviewRouter from './review.routes';
import usersRouter from './user.routes';
import journalRouter from './journal.routes';

const router = express.Router();

router.use("/auth", authRouter);
router.use("/email", emailRouter);
router.use("/files", fileRouter);
// router.use("/orders", orderRouter);
router.use("/products", productRouter);
router.use("/reviews", reviewRouter);
router.use("/blogposts", blogpostRouter);
router.use("/users", usersRouter);
router.use("/journals", journalRouter);

export default router;

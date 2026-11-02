
import express from "express";

import {
  subscribePush,
  unsubscribePush,
} from "../controllers/push.controller.js";

const router = express.Router();

router.post("/subscribe", subscribePush);
router.post("/unsubscribe", unsubscribePush);

export default router;

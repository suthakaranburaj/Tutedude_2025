// routes/supplierRoutes.js
import express from "express";
import {upload} from "../middlewares/multer.middleware.js"; 

import { agentCheck } from "../middlewares/auth.middleware.js";
import { verifyInventoryItem } from "../controllers/agentController.js";

const router = express.Router();

router.use(agentCheck);

router.post("/verify-inventory-item",upload.fields([{ name: "images" }]), verifyInventoryItem);


export default router;

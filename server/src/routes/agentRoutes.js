// routes/supplierRoutes.js
import express from "express";
import {upload} from "../middlewares/multer.middleware.js"; 

import { agentCheck } from "../middlewares/auth.middleware.js";
import { verifyInventoryItem,getAllInventoryItems } from "../controllers/agentController.js";

const router = express.Router();

router.use(agentCheck);

router.post("/verify-inventory-item",upload.fields([{ name: "images" }]), verifyInventoryItem);

router.get("/get-all-items", getAllInventoryItems);


export default router;

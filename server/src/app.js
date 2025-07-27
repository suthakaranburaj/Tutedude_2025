import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoute } from "./routes/userRoute.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import orderRoutes from "./routes/orderRoutes.js";
import normalUser from "./routes/normalUserRouters.js";

const app = express();

app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://tutedude-2025.vercel.app/"
    ],
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/users", userRoute);
app.use(verifyJWT);
app.use('/api/vendor', vendorRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/normalUser", normalUser);

export { app };

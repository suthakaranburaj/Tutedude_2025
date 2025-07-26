import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoute } from "./routes/userRoute.js";
import vendorRoutes from "./routes/vendorRoutes.js";
const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/users", userRoute);
app.use('/api/vendor', vendorRoutes);
export { app };

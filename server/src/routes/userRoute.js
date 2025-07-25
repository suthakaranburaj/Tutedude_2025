import express from "express";
const userRoute = express.Router();

import { loginUser, registerUser } from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

userRoute.get("/", (req, res) => {
    res.send("User details fetched");
});

userRoute.post("/create", registerUser); // signup
userRoute.post("/login", loginUser); // login

userRoute.patch("/details", (req, res) => {
    res.send("User details updated");
});

export { userRoute };

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import userSchema from "../models/userModel.js";
import { getModel } from "../config/db.js";
const User = await getModel("Authentication", "User", userSchema);

const protect = asyncHandler(async (req, res, next) => {
    let token;
    token = req.cookies.jwt;
   /* console.log(`cookies ${req.cookies}`);
    console.log(`token ${token}`);
*/
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select("-password");
        
            next();
        } catch (error) {
            res.status(401);
            throw new Error(`Not authorized, invalid token`);
        }
    } else {
        res.status(401);
        throw new Error(`Not authorized`);
    }
});

export { protect };

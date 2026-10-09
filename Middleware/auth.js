const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const auth = async (req, res, next) => {
    try {
        // Validate Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({message: "Authentication failed: No token provided"});
        }

        // Extract and verify the token
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        // Find user associated with the token
        const user = await User.findOne({
            _id: decoded.userId,
            "tokens.token": token,
        });

        if (!user) {
            return res.status(401).json({message: "Authentication failed: User not found"});
        }

        // Attach user details to the request object
        req.userId = decoded.userId;
        req.token = token;
        req.user = user;

        next();
    } catch (err) {
        res.status(401).json({
            message: "Authentication unsuccessful",
            error: err.message,
        });
    }
};

module.exports = auth;

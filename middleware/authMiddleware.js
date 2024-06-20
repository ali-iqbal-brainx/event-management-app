const jwtServices = require("../services/jwtService");
const User = require('../models/user');

const verifyAuth = async (request, response, next) => {
    try {
        const authHeader = request.headers.access_token;

        if (authHeader) {
            const token = authHeader.split(" ")[1];
            console.log("token :", token);

            jwtServices.verifyToken(
                token,
                process.env.JWT_TOKEN_KEY,
                async (err, user) => {
                    console.log("Error :", err);
                    console.log("user: ", user);

                    if (err) {
                        request.isAuth = false;
                        request.message = 'Token is not valid';
                        request.user = null;
                        next();
                        return;
                    }

                    const dbUser = await User.findOne({ _id: user?._id });
                    if (!dbUser) {
                        request.isAuth = false;
                        request.message = 'User not found';
                        request.user = null;
                        next();
                        return;
                    }

                    const decoded = jwtServices.decodeToken(token);
                    if (!decoded) {
                        request.isAuth = false;
                        request.message = 'Token is not valid';
                        request.user = null;
                        next();
                        return;
                    }

                    request.isAuth = true;
                    request.message = 'success';
                    request.user = dbUser;
                    next();
                }
            );
        } else {
            request.isAuth = false;
            request.message = 'access_token is required in the headers';
            request.user = null;
            next();
        }
    } catch (err) {
        throw err;
    }
};

module.exports = {
    verifyAuth
};

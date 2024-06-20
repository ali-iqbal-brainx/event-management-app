const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const { transformUser } = require('../../helpers/merge');
const jwtService = require('../../services/jwtService');

module.exports = {
    createUser: async (args) => {
        try {
            if (!request?.isAuth) {
                throw new Error(request?.message);
            }

            const user = await User.findOne({ email: args.userInput.email });
            if (user) {
                throw new Error('User with this email already exist');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

            const newUser = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await newUser.save();
            return transformUser(result);
        } catch (err) {
            throw err;
        }
    },
    login: async (args) => {
        try {
            const user = await User.findOne({ email: args.email });
            if (!user) {
                throw new Error('User does not exist');
            }

            const isValidPassword = await bcrypt.compare(args.password, user.password);
            if (!isValidPassword) {
                throw new Error('Password is incorrect');
            }

            const accessToken = jwtService.generateAccessToken(user, '1h');
            return {
                userId: user.id,
                token: accessToken,
            }
        } catch (err) {
            throw err;
        }
    }

};
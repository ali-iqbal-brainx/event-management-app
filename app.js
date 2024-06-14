require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const db = require('./configs/mongoDb');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const { default: mongoose } = require('mongoose');

const app = express();
app.use(cors());
const port = process.env.PORT || 4000;

app.use(bodyParser.json());


app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type User {
            _id: ID !
            email: String!
            password: String
        }

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: async () => {
            return Event.find()
                .then(events => {
                    return events.map(event => {
                        return { ...event._doc, _id: new mongoose.Types.ObjectId(event._doc._id), creator: new mongoose.Types.ObjectId(event._doc.creator) }
                    });
                })
                .catch();
        },
        createEvent: async (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: "666946172deb262234c07240"
            });

            return event.save()
                .then(result => {
                    console.log(result);
                    return { ...result._doc, _id: new mongoose.Types.ObjectId(result?._doc?._id) };
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });
        },
        createUser: async (args) => {
            return User.findOne({ email: args.userInput.email })
                .then(user => {
                    if (user) {
                        throw new Error('User with this email already exist');
                    }
                    return bcrypt.hash(args.userInput.password, 12)
                })
                .then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    });

                    return user.save();
                })
                .then(result => {
                    return { ...result._doc, password: null, _id: result?.id }
                })
                .catch(err => {
                    throw err;
                });
        }
    },
    graphiql: true
}));

db.connection()
    .then(() => {
        console.log("DB connected successfully")
        app.listen(port, () => {
            console.log(`app listening on port ${port}`);
        })
    })
    .catch((err) => {
        console.log(err)
    });

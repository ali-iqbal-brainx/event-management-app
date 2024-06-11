require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const db = require('./configs/mongoDb');
const cors = require('cors');

const app = express();
app.use(cors());
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

const events = [];

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return events;
        },
        createEvent: (args) => {
            const event = {
                _id: Math.random().toString(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: args.eventInput.date
            }
            events.push(event);
            return event;
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

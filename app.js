require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const db = require('./configs/mongoDb');
const cors = require('cors');
const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const { verifyAuth } = require('./middleware/authMiddleware');
const app = express();
app.use(cors());

const port = process.env.PORT || 4000;

app.use(bodyParser.json());

app.use(verifyAuth);


app.use('/graphql', graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
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

import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import RestaurantsDAO from "./dao/restaurantsDAO.js";
import ReviewsDAO from "./dao/reviewsDAO.js";
dotenv.config();

const MongoClient = mongodb.MongoClient;

const port = process.env.PORT || 8000;

// connect to the database
MongoClient.connect(process.env.RESTREVIEWS_DB_URI, {
  wtimeoutMS: 2500,
  useNewUrlParser: true,
})
.catch(err => {
    console.log(err);
    process.exit(1);
})
.then(async client => {
    //useRestaurantsDAO to establish connection to the restaurants collection
    await RestaurantsDAO.injectDB(client)
    await ReviewsDAO.injectDB(client)
    app.listen(port, () =>  {
        console.log(`Listening on port ${port}`);
    })
})

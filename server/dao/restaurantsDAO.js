// DAO = Data Access Object
// DAO Allows code to access data in the database
import mongodb from "mongodb"
const ObjectId = mongodb.ObjectId

let restaurants;

export default class RestaurantsDAO {
  // injectDB is a method created on DAO classes.  It establishes a connection to the database
  static async injectDB(conn) {
    // if restaurants variable is populated with data, return. Otherwise, move to try block
    if (restaurants) {
      return;
    }
    try {
      restaurants = await conn
        // RESTREVIEWS_NS is the database named "sample_restaurants", which is defined in the .env file
        .db(process.env.RESTREVIEWS_NS)
        // "restaurants" is the collection name, within the "sample_restaurants" database
        .collection("restaurants");
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in restaurantsDAO: ${e}`
      );
    }
  }

  // mongodb queries
  static async getRestaurants({
    filters = null,
    page = 0,
    restaurantsPerPage = 20,
  } = {}) {
    let query;
    if (filters) {
      if ("name" in filters) {
        // "$text" search is defined in the MongoDB ui.
        query = { $text: { $search: filters["name"] } };
      } else if ("cuisine" in filters) {
        //"cuisine" is a field in the database
        query = { cuisine: { $eq: filters["cuisine"] } };
      } else if ("zipcode" in filters) {
        //"address.zipcode" is a field in the database where address is the primary field and zipcode is one of its children
        query = { "address.zipcode": { $eq: filters["zipcode"] } };
      }
    }

    let cursor;
    // cursor will contain the results of the restaurants db query above

    try {
      //cursor contains the results of the restaurants DAO, after it has been filtered by the query
      cursor = await restaurants.find(query);
    } catch (e) {
      console.error(`Unable to query restaurants: ${e}`);
      // if error, return no values for display.  If not, these variables will be defined below
      return { restaurantsList: [], totalRestaurants: 0 };
    }

    // reminder: make sure you understand this code block
    const displayCursor = cursor
      .limit(restaurantsPerPage)
      .skip(restaurantsPerPage * page);

    try {
      const restaurantsList = await displayCursor.toArray();
      const totalNumRestaurants = await restaurants.countDocuments(query);

      return { restaurantsList, totalNumRestaurants };
    } catch (e) {
      console.error(
        "Unable to convert cursor to array or problem counting documents"
      );
      return { restaurantsList: [], totalNumRestaurants: 0 };
    }
  }

  static async getRestaurantByID(id) {
    try {
      // mongoDb aggregation pipeline is a mongoDb feature that allows to collections to be matched together
      // more info here: https://www.youtube.com/redirect?event=video_description&redir_token=QUFFLUhqbFZ3LVViS0ZyZGxqUEFjWGJ6M0sxTjVBT0tiQXxBQ3Jtc0tsQl91VUw0ZHlRMjZWb0NFTDk2eHlGbGRaZmxvT21hbjJnblJDMF8zeFE2dGE5b0NRT0hRaGVsMUVRUEtMZkY3eFBod2w4VUxDTHViMDlSTjJhUWxiWDVtd2RsemljR2xaaEktMXd3bG5ING1zSUk5QQ&q=https%3A%2F%2Fdocs.mongodb.com%2Fmanual%2Freference%2Foperator%2F&v=mrHNSanmqQ4
      const pipeline = [
        {
          // match the id of the restaurant in the restaurant collection
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          // lookup the reviews for the restaurant in the reviews collection
          $lookup: {
            from: "reviews",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$restaurant_id", "$$id"],
                  },
                },
              },
              {
                $sort: {
                  date: -1,
                },
              },
            ],
            as: "reviews",
          },
        },
        {
          $addFields: {
            reviews: "$reviews",
          },
        },
      ];
      // returns restaurant with all review connected
      return await restaurants.aggregate(pipeline).next();
    } catch (e) {
      console.error(`Something went wrong in getRestaurantByID: ${e}`);
      throw e;
    }
  }

  // returns a list of the available cuisines in the restaurants collection.  For use in dropdown menu
  static async getCuisines() {
    let cuisines = [];
    try {
      // distinct mongoDb method gets unique values/ removes duplicates.
      // more info here: https://www.mongodb.com/docs/manual/reference/method/db.collection.distinct/ 
      cuisines = await restaurants.distinct("cuisine");
      return cuisines;
    } catch (e) {
      console.error(`Unable to get cuisines, ${e}`);
      return cuisines;
    }
  }
}

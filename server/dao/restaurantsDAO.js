// DAO = Data Access Object
// DAO Allows code to access data in the database

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
}

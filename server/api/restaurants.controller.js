import RestaurantsDAO from "../dao/restaurantsDAO.js"

export default class RestaurantsController {
  static async apiGetRestaurants(req, res, next) {
    //   if the query returns restaurantsPerPage, convert it into an integer.  If not return, default to 20.
    const restaurantsPerPage = req.query.restaurantsPerPage ? parseInt(req.query.restaurantsPerPage, 10) : 20
    //   if the query returns page, convert it into an integer.  If not, page number is 0.
    const page = req.query.page ? parseInt(req.query.page, 10) : 0

    let filters = {}
    // if query returns cuisine, filters.cuisine gets the result of the query.
    if (req.query.cuisine) {
      filters.cuisine = req.query.cuisine
    } else if (req.query.zipcode) {
      filters.zipcode = req.query.zipcode
    } else if (req.query.name) {
      filters.name = req.query.name
    }

    //restaurantsList and totalNumRestaurants are declared in restaurantsDAO
    const { restaurantsList, totalNumRestaurants } = await RestaurantsDAO.getRestaurants({
      // these variables, declared above, are passed into the getRestaurants function and are used to create restaurantsList and totalNumRestaurants
      filters,
      page,
      restaurantsPerPage,
    })

    let response = {
      restaurants: restaurantsList,
      page: page,
      filters: filters,
      entries_per_page: restaurantsPerPage,
      total_results: totalNumRestaurants,
    }
    res.json(response)
  }

  static async apiGetRestaurantById(req, res, next) {
    try {
      let id = req.params.id || {}
      let restaurant = await RestaurantsDAO.getRestaurantByID(id)
      if (!restaurant) {
        res.status(404).json({ error: "Not found" })
        return
      }
      res.json(restaurant)
    } catch (error) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: error + "Error at apiGetRestaurantById" })
    }
  }

  static async apiGetRestaurantCuisines(req, res, next) {
    try {
      let cuisines = await RestaurantsDAO.getCuisines()
      res.json(cuisines)
    } catch (error) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: error + "Error at apiGetRestaurantCuisines" })
    }
  }
}
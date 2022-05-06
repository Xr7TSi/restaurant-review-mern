import express from "express";
import RestaurantsCtrl from "./restaurants.controller.js"
import ReviewsCtrl from "./reviews.controller.js"

const router = express.Router();

// get all restaurants
// test: http://localhost:5000/api/v1/restaurants/
router.route("/").get(RestaurantsCtrl.apiGetRestaurants)

// get a restaurant by id and it's reviews
// test: http://localhost:5000/api/v1/restaurants/id/5eb3d668b31de5d588f4292a
router.route("/id/:id").get(RestaurantsCtrl.apiGetRestaurantById)

// get all restaurants by by cuisine for use in dropdown
// test: http://localhost:5000/api/v1/restaurants/cuisines
router.route("/cuisines").get(RestaurantsCtrl.apiGetRestaurantCuisines)

router
.route("/review")
// if route is /review, use APIs below based on method
.post(ReviewsCtrl.apiPostReview)
.put(ReviewsCtrl.apiUpdateReview)
.delete(ReviewsCtrl.apiDeleteReview)


export default router;

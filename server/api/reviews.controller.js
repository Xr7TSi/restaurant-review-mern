import ReviewsDAO from "../dao/reviewsDAO.js"

export default class ReviewsController {
  static async apiPostReview(req, res, next) {
    try {
        // info from the request body to be posted to the db
      const restaurantId = req.body.restaurant_id
      const review = req.body.text
      const userInfo = {
        name: req.body.name,
        _id: req.body.user_id
      }
      const date = new Date()

      const ReviewResponse = await ReviewsDAO.addReview(
        restaurantId,
        userInfo,
        review,
        date,
      )
      res.json({ status: "success at apiPostReview" })
    } catch (error) {
      res.status(500).json({ error: error.message + "Error at apiPostReview" })
    }
  }

  static async apiUpdateReview(req, res, next) {
    try {
      const reviewId = req.body.review_id
      const text = req.body.text
      const date = new Date()

      const reviewResponse = await ReviewsDAO.updateReview(
        reviewId,
        req.body.user_id,
        text,
        date,
      )

      var { error } = reviewResponse
      if (error) {
        res.status(400).json({ error })
      }

      if (reviewResponse.modifiedCount === 0) {
        throw new Error(
          "unable to update review - user may not be original poster",
        )
      }

      res.json({ status: "success" })
    } catch (error) {
      res.status(500).json({ error: error.message + "Error at apiUpdateReview" })
    }
  }

  static async apiDeleteReview(req, res, next) {
    try {
      const reviewId = req.query.id
    //   Reminder: update so user is not pulled from the body.  Should be logged in user
      const userId = req.body.user_id
      console.log(reviewId)
      const reviewResponse = await ReviewsDAO.deleteReview(
        reviewId,
        userId,
      )
      res.json({ status: "success" })
    } catch (error) {
      res.status(500).json({ error: error.message + "Error at apiDeleteReview" })
    }
  }

}
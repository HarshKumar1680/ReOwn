const Review = require('../models/Review');

// Add a review to a product
exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;
    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: 'Product and rating are required.' });
    }
    const review = new Review({ product: productId, user: userId, rating, comment });
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all reviews for a product
exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).populate('user', 'name').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}; 
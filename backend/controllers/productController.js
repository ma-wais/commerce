const Product = require("../models/productModel.js");
const ErrorHandler = require("../utils/errorHandler.js");
const Asyncerror = require("../middlewares/asyncerror.js");
const ApiFeatures = require("../utils/apiFeatures.js");
const cloudinary = require("cloudinary")

exports.createProduct =Asyncerror (async (req, res,next) => {
    let images = [];
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
    const imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.images = imagesLinks;
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
            success:true,
            product
        });
})
//get all products 
exports.getAllProducts =Asyncerror (async (req, res) => {
    const resultPerPage = 8; 
    const productsCount = await Product.countDocuments();
    const apiFeatures =new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage);
    const products = await apiFeatures.query;
    
    res.status(200).json({
    message:"products fetched successfully",
    productsCount,
    products,
    resultPerPage 
})
})
//update produts
exports.updateProduct =Asyncerror (async (req, res,next) => {
    let product = await Product.findById(req.params.id); 
       
    if(!product){
        return res.status(404).json({
            success:false,
            message:"product not found"})
        }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })
    res.status(200).json({
        success: true,
        product
    });
})
//delete products
exports.deleteProduct =Asyncerror (async (req, res,next) => {
    const product = await Product.findById(req.params.id);
    if(!product){
        return res.status(500).json({
            success:false, 
            message:"product not found"})
    }
    await product.deleteOne();
    res.status(200).json({
        success: true,
        message:"product deleted successfully"
    })
} )
//get Admin products
exports.getAdminProducts =Asyncerror (async (req, res,next) => {
    const products = await Product.find();
    res.status(200).json({
        success:true,
        products
    })
})
// product details
exports.getProductDetails =Asyncerror (async (req, res,next) => {
    const product = await Product.findById(req.params.id);  
    if(!product){
        return next(new ErrorHandler("product not found", 404 )) ;
    //     return res.status(404).json({
    //         success:false,
    //         message:"product not found" 
    //     })
    }
    res.status(200).json({
        success: true,
        product,
    })
})
//create new review or update review
exports.createProductReview =Asyncerror (async (req, res,next) => {
    const {rating, comment,productId} = req.body; 
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }
    const product = await Product.findById(productId);
    if (!product) {
    return next(new ErrorHandler("Product not found", 404));
    }
    const isReviewed = product.reviews.find(rev  => rev.user.toString() === req.user._id.toString());
    
    if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user.toString() === req.user._id.toString())
            (rev.rating = rating), (rev.comment = comment);
        });
      } else {
        product.reviews.push(review);
        product.numberOfReviews = product.reviews.length;
      }
    
      let avg = 0;
    
      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });
    
      product.ratings = avg / product.reviews.length;
    
      await product.save({ validateBeforeSave: false });
    
      res.status(200).json({
        success: true,
      });
});
// get all reviews of a product
exports.getProductReviews =Asyncerror (async (req, res,next) => {
    const product = await Product.findById(req.query.id);
    if (!product) {
    return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
    success: true,
    reviews: product.reviews
    });
});
// delete review
exports.deleteReview =Asyncerror (async (req, res,next) => {
    const product = await Product.findById(req.query.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );
    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });
    let ratings = 0;
    if (reviews.length === 0) {
        ratings = 0;
    }
    else {
        ratings = avg / reviews.length;
    }
    const numberOfReviews = reviews.length;
    await Product.findByIdAndUpdate(
        req.query.productId,
        { reviews,ratings, numberOfReviews,}
        , {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
    
    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
    });
});
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"please enter product name"],
        trim: true,
    },
    description: {
        type: String,
        required: [true,"please enter product description"],
    },
    price: {
        type: Number,
        required: [true,"please enter product price"],
        maxlength: [8,"price cannot exceed 8 characters"]
    },
    ratings:{
        type: Number,
        default: 0,
    },
    images: [
        {
            public_id: { type: String, required: true, },
            url: { type: String, required: true, }
        },
    ],
    category:{
        type: String,
        required: [true,"please enter product category"], 
        // enum: {
        //     values: ["Electronics","Cameras","Laptops","Accessories","Headphones","Food","Books","Clothes/Shoes","Beauty/Health","Sports","Outdoor","Home"],
        //     message: "please enter correct category"
        // }
    },
    stock:{
        type: Number,
        required: [true,"please enter product stock"],
        maxlength: [4,"stock cannot exceed 4 characters"], 
        default: 1,
    },
    numberOfReviews:{
        type: Number,
        default: 0,
    },
    reviews: [
        {
          user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          rating: {
            type: Number,
            required: true,
          },
          comment: {
            type: String,
            required: true,
          },
        },
      ],
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
})
module.exports = mongoose.model("Product",productSchema)
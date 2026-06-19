const mongoose = require("mongoose");
const jwt = require("jsonwebtoken") ;
const bcrypt = require("bcrypt") ;

const matchSchema = new mongoose.Schema({
   roomId: {
      type: String,
      required: true
   },

   gameType: {
    type: String,
    required: true,
    enum: ["Survival", "Blitz"]
   },

   players: [
      {
         user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
         },

         score: Number,

         ratingBefore: Number,

         ratingAfter: Number
      }
   ],

   winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },

   status: {
      type: String,
      enum: ["ongoing", "completed", "abandoned"],
      default: "ongoing"
   },

   duration: Number

}, { timestamps: true })

const Match = mongoose.models.Match || mongoose.model("Match", matchSchema) ;
module.exports = { Match } ;

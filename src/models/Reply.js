import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const replySchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    replyavatar: {
      type: String,
    },
    text: {
      type: String,
      trim: true,
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      required: true,
    },
    courseunit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseunit",
      required: true,
    },
    coursechapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "coursechapter",
      required: true,
    },
    replyby: {
      type: mongoose.Schema.Types.ObjectId,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

replySchema.plugin(mongoosePaginate);

const Reply = mongoose.model("reply", replySchema);

export default Reply;

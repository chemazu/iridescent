import mongoose from "mongoose";

const liveWebinarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  streamKey: {
    type: String,
    required: true,
    unique: true,
  },
  streamUrl: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },

  isLive: {
    type: Boolean,
    default: false,
  },
  thumbnail: {
    type: String,
  },
  webinarthumbnailid: {
    type: String,
  },
  viewers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: ["Daily", "daily", "weekly", "monthly", "Weekly", "Monthly", ""],
    default: "Daily",
  },

  recurringDays: [
    {
      type: Number,
      min: 0,
      max: 6,
    },
  ],
  recurringStartDate: {
    type: Date,
  },
  recurringEndDate: {
    type: Date,
  },
  fee: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: "NGN",
  },
  category: {
    type: String,
    required: true,
  },
  timeleft: {
    type: Number,
    default: 2700,
  },
  streamStarted: {},

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "school",
  },
});

const LiveWebinar = mongoose.model("LiveWebinar", liveWebinarSchema);

export default LiveWebinar;

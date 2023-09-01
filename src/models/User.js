import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    createdVia: {
      type: String,
    },
    avatar: {
      type: String,
    },
    cloudinaryAvatarId: {
      type: String,
    },
    deviceCreatedWith: {
      type: String,
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    field: {
      type: String,
    },
    about: {
      type: String,
    },
    setupComplete: {
      type: Boolean,
      default: false,
    },
    selectedplan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentplans",
    },
    subscriptionstatus: {
      type: Boolean,
      default: true,
    },
    isverified: {
      type: Boolean,
      default: false,
    },
    displaywalkthrough: {
      type: Boolean,
      default: true,
    },
    user_type: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    referedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    segment: {
      type: Number,
    },
    hasUsedPassAllotedResource: {
      type: Boolean,
    },
    dateOfCancelledSubscription: {
      type: String,
    },
    showNewFeatureAnnouncementModal: {
      type: Boolean,
      default: true,
    },
    subscriptiondata: {
      auth_code: {
        type: String,
      },
      cardending: {
        type: String,
      },
      cardtype: {
        type: String,
      },
      cardexpiry: {
        type: String,
      },
      subscriptioncode: {
        type: String,
      },
      isSubscribedToPlan: {
        type: Boolean,
        default: false,
      },
      dateOfSubscription: {
        type: String,
      },
      nextPaymentDate: {
        type: String,
      },
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model("user", userSchema);

export default User;

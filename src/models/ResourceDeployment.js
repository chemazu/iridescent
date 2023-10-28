import mongoose from "mongoose";

const resourceDeploymentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
const ResourceDeployment = mongoose.model(
  "resourceDeployment",
  resourceDeploymentSchema
);

export default ResourceDeployment;

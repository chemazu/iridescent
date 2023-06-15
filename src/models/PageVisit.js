import mongoose from "mongoose";

const pageVisitSchema = new mongoose.Schema(
  {
    ipaddress: {
      type: String,
    },
    schoolname: {
      type: String,
    },
    schooldid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
    },
    dateofvisit: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

pageVisitSchema.index({ schooldid: 1 });
pageVisitSchema.index({ dateofvisit: 1 });
pageVisitSchema.index({ dateofvisit: 1, schooldid: 1 });
pageVisitSchema.index({ visitor: 1 });

const PageVisit = mongoose.model("pagevisit", pageVisitSchema);

export default PageVisit;

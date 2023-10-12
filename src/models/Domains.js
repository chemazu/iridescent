import mongoose from "mongoose";

const domainSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "school",
  },
  domain_name: {
    type: String,
    unique: true,
  },
});

const Domain = mongoose.model("domain", domainSchema);

export default Domain;

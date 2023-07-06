import mongoose from "mongoose";

const connectDB = () => {
  mongoose
    .connect(process.env.TUTURLY_DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Database connected succesfully"))
    .catch((err) => {
      console.log(err);
    });
};

export default connectDB;

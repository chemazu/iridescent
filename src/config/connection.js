import mongoose from "mongoose";

const connectDB = () => {
  mongoose
    .connect(
      "mongodb+srv://kolniy:Kolniysoft10@developershangout.kv8uf.mongodb.net/tutorly?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      }
    )
    .then(() => console.log("Database connected succesfully"))
    .catch((err) => {
      console.log(err);
    });
};

export default connectDB;

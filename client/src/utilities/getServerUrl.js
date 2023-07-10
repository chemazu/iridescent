const getServerUrl = () =>
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5000";

export default getServerUrl;

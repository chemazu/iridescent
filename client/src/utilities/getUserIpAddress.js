import axios from "axios";

const getUserIpAddress = async () => {
  try {
    const res = await axios.get("https://www.cloudflare.com/cdn-cgi/trace");
    const parsedData = res.data
      .trim()
      .split("\n")
      .reduce(function (obj, pair) {
        pair = pair.split("=");
        // eslint-disable-next-line
        return (obj[pair[0]] = pair[1]), obj;
      }, {});
    return parsedData.ip;
  } catch (error) {
    const errors = error?.response?.data?.errors;
    if (errors) {
      errors.forEach((error) => {
        alert.show(error.msg, {
          type: "error",
        });
      });
    }
  }
};

export default getUserIpAddress;

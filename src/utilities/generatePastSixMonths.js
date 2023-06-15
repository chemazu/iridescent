import moment from "moment";

const generatePastSixMonths = () => {
  const pastSixMonthsArray = [];
  const currentDate = new Date();
  pastSixMonthsArray.push(currentDate); // ensures the current month is also accounted for
  for (let i = 1; i <= 5; i++) {
    const current = moment().subtract(i, "months");
    pastSixMonthsArray.push(current.toDate());
  }
  return pastSixMonthsArray;
};

export default generatePastSixMonths;

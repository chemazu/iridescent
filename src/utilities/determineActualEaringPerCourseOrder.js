
const determineActualEarningPerCourseOrder = (coursePrice, discount) => {
    const discountInDecimal = (parseInt(discount) / 100) * coursePrice
    return parseInt(coursePrice - discountInDecimal)
}

export default determineActualEarningPerCourseOrder
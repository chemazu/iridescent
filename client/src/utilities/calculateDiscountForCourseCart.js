
const calculateDiscountForCourseCart = (actualPrice, discount) => {
    const discountInDecimal = (parseInt(discount) / 100) * actualPrice
    return parseInt(actualPrice - discountInDecimal)
}

export default calculateDiscountForCourseCart
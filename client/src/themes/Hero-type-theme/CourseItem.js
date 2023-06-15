import React from 'react'
import { connect } from 'react-redux'
import { Col } from "reactstrap"
import { Link } from "react-router-dom"
import { addToCart } from '../../actions/cart'

export const CourseItem = ({ course, school, cart, addCourseToCart }) => {
   return <>
        <Col xs="12" sm="6" md="4" xl="3">
          <div className="course-item">
             <div className="course-item-img">
             <Link to={`/${school.name}/preview/${course.title}`}>
                  <img src={course.thumbnail} alt="..." />
             </Link>
             </div>
             <div className="course-item-course-info">
               <div title={course.title} className="course-item-title">
                  <Link to={`/${school.name}/preview/${course.title}`}>
                     { course.title }
                  </Link>
               </div>
               <p className="course-item-author-info">
                  {school.name}
               </p>

               <p className="course-item-level">
                  {course.level}
               </p>

               <div className="course-item-price-and-cart-button">
                  <p className="course-item-price">&#8358;{ course.price }</p> 
                  {
                  cart.find((item) => item.itemId === course._id) !== undefined ? (
                     <Link className="go-to-cart" to={`/${school.name}/cart`}>View in Cart</Link>
                  ) : (
                     <div onClick={e => addCourseToCart(course)} className="add-to-cart">
                  <i className="fas fa-shopping-cart"></i>
                 </div>
                  )
               }
                </div>

             </div>
          </div>
        </Col>
    </>
}

const mapStateToProps = (state) => ({
   cart: state.cart
})

const mapDispatchToProps = (dispatch) => ({
   addCourseToCart: (courseDetails) => dispatch(addToCart(courseDetails))
})

export default connect(mapStateToProps, mapDispatchToProps)(CourseItem)

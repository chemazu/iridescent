import React from "react";
import { connect } from "react-redux";
import CurrencyFormat from "react-currency-format";
import { Button } from "reactstrap";
import { removeFromCart } from "../../actions/cart";
import calculateDiscountForCourseCart from "../../utilities/calculateDiscountForCourseCart";

export const CartItem = ({
  cartItem,
  removeItem,
  theme,
  addCourseToStudentSaveCourses,
}) => {
  function secondsToTime(e) {
    var h = Math.floor(e / 3600)
        .toString()
        .padStart(2, "0"),
      m = Math.floor((e % 3600) / 60)
        .toString()
        .padStart(2, "0"),
      s = Math.floor(e % 60)
        .toString()
        .padStart(2, "0");

    return h + ":" + m + ":" + s;
  }

  return (
    <div
      style={{
        backgroundColor: theme.themestyles.coursecardbackgroundcolor,
      }}
      key={cartItem.itemId}
      className="cart-item mb-3"
    >
      <div className="cart-item-basic-info-and-old-price">
        <div className="cart-item-basic-info">
          <div className="cart-item-details-img-contain">
            <img
              src={cartItem.itemImg}
              className="img-fluid"
              alt="cart item preview"
            />
          </div>
          <div className="cart-item-about">
            <h3
              style={{
                color: theme.themestyles.coursecardtextcolor,
              }}
            >
              {cartItem.itemName}
            </h3>
            {cartItem.itemType === "course" ? (
              <>
                <div
                  style={{
                    color: theme.themestyles.coursecardtextcolor,
                  }}
                  className="cart-item-summary"
                >
                  <span className="published-year">
                    {new Date(cartItem.itemCreatedAt).getFullYear()}
                  </span>
                  <span className="cart-item-course-total-time ml-4">
                    {secondsToTime(cartItem.itemDuration)}
                  </span>
                </div>
                <div
                  style={{
                    color: theme.themestyles.coursecardtextcolor,
                  }}
                  className="episode-number"
                >
                  {cartItem.itemEpisodes} Episodes
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    color: theme.themestyles.coursecardtextcolor,
                  }}
                  className="cart-item-summary"
                >
                  <span
                    style={{
                      textTransform: "uppercase",
                      fontWeight: "700",
                      fontSize: "12px",
                    }}
                    className="published-year mr-1"
                  >
                    {cartItem?.itemFileType?.substring(1)}
                  </span>
                  {cartItem?.itemFileType && "File"}
                </div>
                <div
                  style={{
                    color: theme.themestyles.coursecardtextcolor,
                    borderColor: theme.themestyles.coursecardtextcolor,
                    borderWidth: "2px",
                    borderStyle: "solid",
                    width: "fit-content",
                    padding: "3px 7px",
                    fontSize: "12px",
                    borderRadius: "6px",
                  }}
                  className="episode-number"
                >
                  {cartItem?.itemCategory}
                </div>
              </>
            )}
          </div>
        </div>
        {cartItem.itemDiscount && (
          <div className="old-price">
            <h2>
              &#8358;
              <CurrencyFormat
                value={cartItem.itemPrice}
                displayType="text"
                thousandSeparator={true}
                fixedDecimalScale={true}
              />
            </h2>
          </div>
        )}
      </div>
      <div className="cart-actions-and-valid-price mt-1">
        <div className="cart-actions">
          <Button
            style={{
              color: theme.themestyles.buttonalttextcolor,
              backgroundColor: theme.themestyles.buttonaltbackgroundcolor,
              border: `0.00045px solid ${theme.themestyles.buttonalttextcolor}`,
              width: "100%",
              boxShadow: "none",
            }}
            className="cart-actions-btn mb-1"
            onClick={(e) => removeItem(cartItem.itemId)}
          >
            Remove
          </Button>
          <Button
            style={{
              color: theme.themestyles.buttonalttextcolor,
              backgroundColor: theme.themestyles.buttonaltbackgroundcolor,
              border: `0.00045px solid ${theme.themestyles.buttonalttextcolor}`,
              width: "100%",
              boxShadow: "none",
            }}
            className="cart-actions-btn mb-1"
            onClick={(e) => addCourseToStudentSaveCourses(cartItem.itemId)}
          >
            Save
          </Button>
        </div>
        <div className="cart-price">
          {
            <h2
              style={{
                color: theme.themestyles.coursecardtextcolor,
              }}
            >
              &#8358;
              {
                <CurrencyFormat
                  value={
                    cartItem.itemDiscount !== undefined
                      ? calculateDiscountForCourseCart(
                          cartItem.itemPrice,
                          cartItem.itemDiscount
                        )
                      : cartItem.itemPrice
                  }
                  displayType="text"
                  thousandSeparator={true}
                  fixedDecimalScale={true}
                />
              }
            </h2>
          }
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  removeItem: (itemId) => dispatch(removeFromCart(itemId)),
});

export default connect(null, mapDispatchToProps)(CartItem);

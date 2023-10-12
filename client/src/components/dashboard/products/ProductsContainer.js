import React from "react";
import { Row, Card } from "reactstrap";

import ProductItem from "./ProductItem";
import emptyProduct from "../../../images/empty-product.png";

const ProductsContainer = ({ products, validateProductCountBeforePush }) => {
  return (
    <>
      <div className="products-container">
        <Row
          style={{
            marginLeft: "0",
            marginRight: "0",
          }}
        >
          {products.length === 0 ? (
            <>
              <Card
                onClick={validateProductCountBeforePush}
                style={{
                  margin: "5vh auto",
                  width: "70%",
                  padding: "5vh 7vw",
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    margin: "0 auto",
                  }}
                >
                  <img
                    style={{
                      height: "190px",
                    }}
                    src={emptyProduct}
                    alt="..."
                    className="img-fluid"
                  />
                </div>
                <p className="lead text-center">
                  You have not uploaded any products yet, Click anywhere to
                  create a new product.
                </p>
              </Card>
            </>
          ) : (
            <>
              {products.map((product) => {
                return <ProductItem key={product._id} product={product} />;
              })}
            </>
          )}
        </Row>
      </div>
    </>
  );
};

export default ProductsContainer;

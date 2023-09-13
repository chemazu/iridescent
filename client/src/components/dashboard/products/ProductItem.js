import React from "react";
import { Link } from "react-router-dom";
import { Col } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";

const ProductItem = ({ product }) => {
  return (
    <>
      <Col className="mb-3" xs="12" sm="6" md="6" xl="3">
        <div className="product-item">
          <div className="product-item__img">
            <Link to={`/dashboard/product/${product._id}`}>
              <LazyLoadImage
                className="img-fluid"
                src={product.thumbnail}
                alt="..."
              />
            </Link>
          </div>
          <div className="product-item__info">
            <div title={product.title} className="product-item-info__title">
              <Link to={`/dashboard/product/${product._id}`}>
                {product.title}
              </Link>
            </div>
            <div className="product-item-info__type">
              <span>{product.file_type.substring(1)}</span> file
            </div>
            <p className="product-item-author__info">
              {`${product.author.firstname} ${product.author.lastname}`}
            </p>
            <p className="product-item-price">&#8358;{product.price}</p>
          </div>
        </div>
      </Col>
    </>
  );
};

export default ProductItem;
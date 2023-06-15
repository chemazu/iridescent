import React from "react";
import { Col } from "reactstrap";

const ProductItem = ({ product, schoolname }) => {
  const handleProductDownload = async (fileUrl) => {
    await downloadFile(fileUrl);
  };

  async function downloadFile(fileUrl) {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to download file, HTTP status: ${response.status}`
        );
      }
      // eslint-disable-next-line
      const contentType = response.headers.get("Content-Type");
      const blob = await response.blob();

      const a = document.createElement("a");
      a.style.display = "none";
      document.body.appendChild(a);

      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `${product.title}${product.file_type}`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Col xs="12" sm="6" md="6" xl="3">
      <div className="tutor-product-item-dashboard">
        <div className="tutor-product-item-card-img">
          <img src={product?.thumbnail} alt="..." />
        </div>
        <div className="tutor-product-item-info">
          <div
            title={product?.title}
            className="tutor-product-item-title__container"
          >
            {product?.title}
          </div>
          <p className="tutor-product-item-file-type-info">
            <span>{product?.file_type.substring(1)}</span> File
          </p>
          <p className="tutor-product-item-author-info">{schoolname}</p>
          <div className="tutor-product-item-price__download">
            <p className="tutor-product-item-price">&#8358;{product?.price}</p>
            <div
              title="Download This File"
              onClick={() => handleProductDownload(product?.file)}
              className="tutor-product-item-download__cta"
            >
              <i className="fas fa-download"></i>
            </div>
          </div>
        </div>
      </div>
    </Col>
  );
};

export default ProductItem;

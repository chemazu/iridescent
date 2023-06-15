import React from "react";
import { Col } from "reactstrap";

const ProductItemInStudentDashboard = ({ product, theme, schoolname }) => {
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
      <div className="product-item-student-dashboard">
        <div className="product-item-student-dashboard-card-img">
          <img src={product?.thumbnail} alt="..." />
        </div>
        <div
          style={{
            backgroundColor: theme?.themestyles?.coursecardbackgroundcolor,
          }}
          className="producut-item-student-dashboard-card-info"
        >
          <div
            style={{
              color: theme?.themestyles?.coursecardtextcolor,
            }}
            className="product-item-title-container"
            title={product?.title}
          >
            {product?.title}
          </div>

          <p
            style={{
              color: theme.themestyles.coursecardtextcolor,
            }}
            className="product-item-file-type-info"
          >
            <span>{product?.file_type.substring(1)}</span> File
          </p>

          <p
            style={{
              border: `0.4px solid ${theme.themestyles.coursecardtextcolor}`,
              color: theme.themestyles.coursecardtextcolor,
            }}
            className="product-item-author-info"
          >
            {schoolname}
          </p>

          <div className="product-price__download">
            <p
              style={{
                color: theme.themestyles.coursecardtextcolor,
              }}
              className="product-item-price"
            >
              &#8358;{product?.price}
            </p>
            <div
              style={{
                color: theme.themestyles.coursecardtextcolor,
              }}
              title="Download This File"
              onClick={() => handleProductDownload(product?.file)}
              className="product-download__icon"
            >
              <i className="fas fa-download"></i>
            </div>
          </div>
        </div>
      </div>
    </Col>
  );
};

export default ProductItemInStudentDashboard;

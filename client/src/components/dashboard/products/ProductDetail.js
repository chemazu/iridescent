import React, { useState, useEffect, useRef } from "react";
import { useDispatch, connect } from "react-redux";
import {
  WhatsappShareButton,
  WhatsappIcon,
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  LinkedinIcon,
  EmailShareButton,
  EmailIcon,
} from "react-share";
import setAuthToken from "../../../utilities/setAuthToken";
import {
  Row,
  Col,
  Container,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import { LazyLoadImage } from "react-lazy-load-image-component";
import pdfIcon from "../../../images/productpdficon.svg";
import { useParams, useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import DashboardNavbar from "../DashboardNavbar";
import NotificationNavbar from "../NotificationNavbar";
import ProductUpdateModal from "./ProductUpdateModal";
import { useAlert } from "react-alert";
import { UPDATE_DASHBOARD_PAGE_COUNTER } from "../../../actions/types";
import Dropzone from "../../Dropzone";
import uploadProductIcon from "../../../images/upload-file-icon.png";
import uploadProductSuccessIcon from "../../../images/upload-success-file-uplopad.png";
import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/product.css";

const Products = ({ school }) => {
  const dispatch = useDispatch();
  const alert = useAlert();
  const fileInput = useRef(null);
  const history = useHistory();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateModal, setUpdateModal] = useState(false);
  const [updateModalFile, setUpdateModalFile] = useState(false);
  const [updateModalDetail, setUpdateModalDetail] = useState(false);
  const [productFile, setProductFile] = useState(null);
  const [confirmDeleteProduct, setConfirmProductDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [displayShareModal, setDisplayShareModal] = useState(false);

  let { id } = useParams();
  const getProductFromId = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
        const res = await axios.get(`/api/v1/product/${id}`);
        setProduct(res.data);
        setLoading(false);
      }
    } catch (error) {}
  };

  function addCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  const togglePublish = async () => {
    dispatch(startLoading());
    axios.put(`/api/v1/product/publish/${id}`).then((res) => {
      setProduct(res.data);
      dispatch(stopLoading());
    });
  };
  const acceptProductFile = (file) => {
    if (
      file.name.match(
        /\.(pdf|epub|mobi|azw|docx|xlsx|csv|pptx|mp3|jpg|png|gif)$/
      )
    ) {
      setProductFile(file);
    } else {
      alert.show("invalid file type", {
        type: "error",
      });
    }
  };

  const handleUpdateProductFile = async () => {
    setUpdateModalFile(false);
    dispatch(startLoading());
    try {
      const formData = new FormData();
      formData.append("productFile", productFile);
      const res = await axios.put(`/api/v1/product/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setProduct(res.data);
      alert.show("update completed successfully", {
        type: "success",
      });
      setProductFile(null);
      dispatch(stopLoading());
    } catch (error) {
      console.error(error);
    }
  };

  const handleProductDelete = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    setConfirmProductDelete(false);
    try {
      dispatch(startLoading());
      await axios.delete(`/api/v1/product/${id}`);
      alert.show("Product Deleted", { type: "success" });
      history.push("/dashboard/products");
      dispatch(stopLoading());
    } catch (error) {
      alert.show(error, { type: "success" });
      dispatch(stopLoading());
      console.error(error);
    }
  };

  const handleFileChange = async (event) => {
    dispatch(startLoading());

    try {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("thumbnail", file);
      const response = await axios.put(
        `/api/v1/product/thumbnail/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProduct(response.data);
      dispatch(stopLoading());
    } catch (error) {
      console.error("Error uploading thumbnail. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductUrl = (schoolname) => {
    return process.env.NODE_ENV !== "production"
      ? `http://${schoolname}.localhost:3000/product/preview/${product?._id}`
      : `https://${schoolname}.tuturly.com/product/preview/${product?._id}`;
  };

  const copySchoolURL = () => {
    navigator.clipboard.writeText(getProductUrl(school.name));
    alert.show("Link Copy successful", {
      type: "success",
    });
  };

  useEffect(() => {
    if (id) {
      getProductFromId();
    }
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: 103 });
    // eslint-disable-next-line
  }, []);

  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
          <Col className="page-actions__col">
            <div className="page-actions">
              <NotificationNavbar />
              <div className="products-page">
                <div className="products-page__contents">
                  <div className="page-title">
                    <div className="page-title__text">Product Detail</div>
                    <div className="page-title_cta">
                      <Button
                        className="page-title_cta-btn"
                        onClick={() => {
                          history.push("/dashboard/products");
                        }}
                      >
                        <i className="fas fa-arrow-left mr-2"></i> Back to my
                        products
                      </Button>
                    </div>
                  </div>
                  {loading === false ? (
                    <Col>
                      <div className="product-item-wrapper">
                        <div
                          className="img-wrapper"
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                            ref={fileInput}
                          />
                          <div
                            className="dashboard-product-thumbnail-update"
                            style={{ display: isHovered ? "flex" : "none" }}
                            onClick={() => fileInput.current.click()}
                          >
                            <i className="fas fa-camera"></i>
                            Update Product Thumbnail
                          </div>
                          <LazyLoadImage
                            className="img-fluid"
                            src={product.thumbnail}
                            alt="..."
                          />
                          {/* <div
                            onClick={imageUpdateBtnHandler}
                            className="dashboard-product-thumbnail-update"
                          >
                            <div className="update-product-thumbnail__btn">
                              <i className="fas fa-camera"></i>
                              Update Product Thumbnail
                            </div>
                          </div> */}
                        </div>
                        <br />
                        <div className="text-and__btn-action-wrapper">
                          <div className="text-wrapper">
                            <div className="top">
                              <Link to={`/dashboard/product/${product._id}`}>
                                {product.title}
                              </Link>
                              <div className="file-type">
                                <img
                                  className="file-icon mr-1"
                                  alt={product.file_type.substring(1)}
                                  src={pdfIcon}
                                />{" "}
                                <span className="file-name">
                                  {product.file_type.substring(1)}{" "}
                                </span>{" "}
                                &nbsp;<span>File</span>
                              </div>
                              <div
                                onClick={() => setDisplayShareModal(true)}
                                className="share-btn"
                              >
                                <i className="fas fa-share ml-1"></i> Share
                              </div>
                            </div>
                            <div className="bottom">
                              <div className="verification">
                                <p className="published mr-2">
                                  {product.published
                                    ? "Published"
                                    : "Not Published"}
                                </p>
                                <p
                                  className={`verified ${
                                    product.is_verified ? "" : "invisible"
                                  }`}
                                >
                                  Verified
                                </p>
                              </div>
                              <p className="product-item-author__info">
                                {`${product.author.firstname} ${product.author.lastname}`}
                              </p>
                              <p className="product-item-price-product__details">
                                &#8358;{addCommas(product.price)}
                              </p>
                            </div>
                          </div>
                          <div className="btn-actions__container">
                            <div className="button-wrapper">
                              <Button
                                className="product-action"
                                onClick={() => {
                                  setUpdateModal(!updateModal);
                                }}
                              >
                                Update Product
                              </Button>
                              <Button
                                className="product-action-alt"
                                onClick={togglePublish}
                              >
                                {product.published
                                  ? "Retract Product"
                                  : "Publish Product"}
                              </Button>
                            </div>
                            <Button
                              onClick={() => setConfirmProductDelete(true)}
                              block
                              className="product-action-alt product-delete__btn"
                            >
                              Delete Product
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ) : (
                    <p className="text-center lead">Loading...</p>
                  )}
                  <div className="lessons"></div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Modal centered isOpen={confirmDeleteProduct}>
          <div
            style={{
              fontWeight: "700",
              fontSize: "10",
              color: "#242121",
              textTransform: "uppercase",
            }}
            className="modal-header"
          >
            Delete Product - {product?.title}
          </div>
          <div className="modal-body">
            <p className="text-center p-4 product-delete__msg">
              Are you Sure you want to delete this Product ?
            </p>
          </div>
          <div className="modal-footer">
            <Button
              onClick={() => setConfirmProductDelete(false)}
              block
              className="modal-btn-style"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProductDelete}
              block
              className="modal-btn-style-outline mb-2"
            >
              Delete
            </Button>
          </div>
        </Modal>
        {/* update product selector */}
        <Modal centered isOpen={updateModal}>
          <div
            style={{
              fontWeight: "700",
              fontSize: "20",
              color: "#242121",
              textTransform: "uppercase",
            }}
            className="modal-header"
          >
            Update Product - {product?.title}
          </div>
          <ModalBody>
            <div className="update-modal-content">
              <div
                onClick={() => {
                  setUpdateModal(false);
                  setUpdateModalFile(true);
                }}
                className="update-action__item"
              >
                <i className="fas fa-file-signature"></i>
                <p>Update Product File</p>
              </div>
              <div
                onClick={() => {
                  setUpdateModal(false);
                  setUpdateModalDetail(true);
                }}
                className="update-action__item"
              >
                <i className="fas fa-edit"></i>
                <p>Update Product Information</p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              className="modal-btn-style-outline"
              style={{
                paddingLeft: "40px",
                paddingRight: "40px",
              }}
              onClick={() => {
                setUpdateModal(false);
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
        <Modal centered isOpen={updateModalFile}>
          <div
            style={{
              fontWeight: "700",
              fontSize: "20",
              color: "#242121",
              textTransform: "uppercase",
            }}
            className="modal-header"
          >
            Update Product File - {product?.title}
          </div>
          <ModalBody>
            <>
              <div className="upload-product-file-form__container">
                {productFile === null ? (
                  <>
                    <img
                      src={uploadProductIcon}
                      alt="..."
                      className="img-fluid"
                    />
                    <Dropzone acceptProductFile={acceptProductFile} />
                  </>
                ) : (
                  <>
                    <img
                      src={uploadProductSuccessIcon}
                      alt="..."
                      className="img-fluid"
                    />
                    <div className="product-file__info">
                      <p>{productFile.name}</p>
                      <div onClick={() => setProductFile(null)}>
                        <i className="fas fa-times"></i>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="upload-product-file-warning">
                <p>
                  <span>Warning:</span> Do not upload malicious files or files
                  that are found to be offensive to any group of people.
                </p>
                <p>
                  <span>Allowed file types: </span> .pdf .epub .mobi .azw .csv
                  .docx .xlsx .pptx .mp3 .jpg .png .gif
                </p>
              </div>
            </>
          </ModalBody>
          <ModalFooter>
            <Button
              className="modal-btn-style-outline"
              style={{
                paddingLeft: "40px",
                paddingRight: "40px",
              }}
              onClick={() => {
                setProductFile(null);
                setUpdateModalFile(!updateModalFile);
              }}
            >
              Cancel
            </Button>{" "}
            {productFile === null ? (
              ""
            ) : (
              <Button
                onClick={handleUpdateProductFile}
                className="modal-btn-style"
                style={{
                  paddingLeft: "40px",
                  paddingRight: "40px",
                }}
              >
                Update
              </Button>
            )}
          </ModalFooter>
        </Modal>
        <ProductUpdateModal
          updateModalDetail={updateModalDetail}
          setUpdateModalDetail={setUpdateModalDetail}
          product={product}
          setProduct={setProduct}
        />
        <Modal centered size="md" isOpen={displayShareModal}>
          <div className="modal-header share-link__modal-header">
            <h4>Share Product Link</h4>
            <div
              className="share-link-close__btn"
              onClick={() => setDisplayShareModal(false)}
            >
              <i className="fas fa-times"></i>
            </div>
          </div>
          <div className="modal-body">
            <div className="product-social-share__icons-container">
              <div onClick={copySchoolURL} className="product-page__copy-link">
                <i className="fas fa-copy"></i>
                <p>Copy Link</p>
              </div>
              <div className="product-page__share-action-container">
                <WhatsappShareButton url={getProductUrl(school?.name)}>
                  <WhatsappIcon size={40} round={true} />
                  <p>Whatsapp</p>
                </WhatsappShareButton>
              </div>
              <div className="product-page__share-action-container">
                <FacebookShareButton url={getProductUrl(school?.name)}>
                  <FacebookIcon size={40} round={true} />
                  <p>Facebook</p>
                </FacebookShareButton>
              </div>
              <div className="product-page__share-action-container">
                <LinkedinShareButton url={getProductUrl(school?.name)}>
                  <LinkedinIcon size={40} round={true} />
                  <p>LinkedIn</p>
                </LinkedinShareButton>
              </div>
              <div className="product-page__share-action-container">
                <EmailShareButton url={getProductUrl(school?.name)}>
                  <EmailIcon size={45} round={true} />
                  <p>Email</p>
                </EmailShareButton>
              </div>
            </div>
          </div>
        </Modal>
      </Container>
    </div>
  );
};

const mapStateToProps = (state) => ({
  school: state.school.schoolDetails,
});

export default connect(mapStateToProps)(Products);

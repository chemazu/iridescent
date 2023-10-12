import React, { useState, useEffect, useRef } from "react";
import { useDispatch, connect } from "react-redux";
import { useAlert } from "react-alert";
import { useHistory, Link } from "react-router-dom";
import {
  Col,
  Container,
  Row,
  FormGroup,
  Input,
  Button,
  Modal,
} from "reactstrap";
import axios from "axios";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import {
  UPDATE_DASHBOARD_PAGE_COUNTER,
  SHOW_PAYMENT_MODAL,
} from "../../../actions/types";
import DashboardNavbar from "../DashboardNavbar";
import NotificationNavbar from "../NotificationNavbar";
import Dropzone from "../../Dropzone";
import setAuthToken from "../../../utilities/setAuthToken";

import uploadProductIcon from "../../../images/upload-file-icon.png";
import uploadProductSuccessIcon from "../../../images/upload-success-file-uplopad.png";

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/product.css";

const CreateProduct = ({ school, loggedInUsername }) => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const history = useHistory();
  const thumbnailInputRef = useRef();
  const [thumbnailToSend, setThumbnailToSend] = useState(null);
  const [imageToPreview, setImageToPreview] = useState(null);
  const [categoryListing, setCategoryListing] = useState([]);
  const [validCourseTitle, setValidCourseTitle] = useState(true);
  const [createProductStep, setCreateProductSteps] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [productFile, setProductFile] = useState(null);
  const [formInputs, setFormInputs] = useState({
    title: "",
    subtitle: "",
    category: "",
    description: "",
    language: "",
    tutorEmail: "",
    price: 0,
  });

  const {
    title,
    subtitle,
    category,
    description,
    language,
    price,
    tutorEmail,
  } = formInputs;

  const updateFormFields = (e) => {
    if (e.target.name === "title") {
      if (/[$&+,:;=?@#|'<>.{}^*()%!-]/g.test(e.target.value) === true) {
        setValidCourseTitle(false);
      } else {
        setValidCourseTitle(true);
      }
    }
    setFormInputs({
      ...formInputs,
      [e.target.name]: e.target.value,
    });
  };

  const updatePriceFormField = (e) => {
    const priceText = e.target.value;

    if (!priceText || priceText.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setFormInputs({
        ...formInputs,
        price: e.target.value,
      });
    }
  };

  const getCategoryListing = async (query = "") => {
    try {
      const res = await axios.get(
        `/api/v1/producttype/producttitle?data=${query}`
      );
      setCategoryListing(res.data);
    } catch (error) {
      alert.show(error, {
        type: "error",
      });
      console.log(error);
    }
  };

  const pickThumbnailFile = () => {
    thumbnailInputRef.current.click();
  };

  const filePickerEventHandle = (e) => {
    if (e.target.files.length === 0) {
      setThumbnailToSend(null);
    }

    const fileSize = e?.target?.files[0]?.size / 1024 / 1024; // file size in mb
    if (fileSize > 30) {
      return alert.show(
        "File Size exceeds maximum limit, choose another file",
        {
          type: "error",
        }
      );
    }

    if (!/^image\//.test(e?.target?.files[0]?.type)) {
      return alert.show(`File ${e?.target?.files[0]?.name} is not an image.`, {
        type: "error",
      });
    }

    setThumbnailToSend(e.target.files[0]);

    const reader = new FileReader();
    reader.addEventListener(
      "load",
      function () {
        setImageToPreview(reader.result);
      },
      false
    );

    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
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

  const handleProductCreateClickHandler = async () => {
    if (title.length === 0) {
      return alert.show("title cannot be empty", {
        type: "error",
      });
    }

    if (subtitle.length === 0) {
      return alert.show("subtitle cannot be empty", {
        type: "error",
      });
    }

    if (category.length === 0) {
      return alert.show("category cannot be empty", {
        type: "error",
      });
    }

    if (description.length === 0) {
      return alert.show("description cannot be empty", {
        type: "error",
      });
    }

    if (language.length === 0) {
      return alert.show("language cannot be empty", {
        type: "error",
      });
    }

    if (!thumbnailToSend) {
      return alert.show("product thumbnail not found", {
        type: "error",
      });
    }

    if (!productFile) {
      return alert.show("product file not found", {
        type: "error",
      });
    }

    if (loggedInUsername?.toLowerCase() === "courses") {
      if (tutorEmail.length === 0) {
        return alert.show("You have to provide your registered Tutor email", {
          type: "error",
        });
      }
    }

    if (price < 3) {
      return alert.show("invalid product price.", {
        type: "error",
      });
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("language", language);
    formData.append("thumbnail", thumbnailToSend);
    formData.append("product", productFile);
    formData.append("price", price);

    if (tutorEmail.length > 0) {
      formData.append("tutorEmail", tutorEmail.toLowerCase());
    }

    // eslint-disable-next-line
    const product = await sendProductDataToBackend(formData);
  };

  const sendProductDataToBackend = async (formData) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const body = formData;
    const fileSizeInMegaBytes = productFile?.size / (1024 * 1024); // uploaded filesize in MB
    const fileSizeRoundedToNearestDecimal =
      Math.round(fileSizeInMegaBytes * 10) / 10;
    dispatch(startLoading());
    try {
      const res = await axios.post(
        `/api/v1/product/${school._id}/${fileSizeRoundedToNearestDecimal}`,
        body,
        config
      );
      dispatch(stopLoading());
      alert.show("product created successfully", {
        type: "success",
      });
      history.push("/dashboard/products");
      return res.data;
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors | [];
      if (errors) {
        errors.forEach((element) => {
          alert.show(element.msg);
        });
      }
      alert.show(error.message);
      if (error.response.status === 401) {
        setShowPaymentModal(true);
      }
      if (error.response.status === 402) {
        dispatch({
          type: SHOW_PAYMENT_MODAL,
        });
      }
      return null;
    }
  };

  const validateProductCountBeforePush = async () => {
    try {
      dispatch(startLoading());
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      await axios.get("/api/v1/product/user/createproduct");
      dispatch(stopLoading());
      history.push("/dashboard/createproduct");
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
      if (error.response.status === 402) {
        dispatch({
          type: SHOW_PAYMENT_MODAL,
        });
      }
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  useEffect(() => {
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: 102 });
    validateProductCountBeforePush();
    getCategoryListing();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="dashboard-layout">
        <Container fluid>
          <Row>
            <DashboardNavbar />
            <Col className="page-actions__col">
              <div className="page-actions">
                <NotificationNavbar />
                <div className="product-page-content-container">
                  {createProductStep === 1 ? (
                    <>
                      <div className="product-page__header">
                        <h2>Create New Product</h2>
                        <p>Fill the form below to create a New Product</p>
                      </div>
                      <div className="product-page__form-container">
                        <FormGroup>
                          <input
                            type="text"
                            class="form__input"
                            placeholder="Product Title"
                            name="title"
                            id="title"
                            value={title}
                            onChange={(e) => updateFormFields(e)}
                            required
                            autoFocus
                          />
                          <label for="title" className="form__label">
                            Product Title
                          </label>
                          {validCourseTitle === false && (
                            <p
                              style={{
                                color: "red",
                              }}
                            >
                              product title cannot contain special characters
                            </p>
                          )}
                        </FormGroup>

                        <FormGroup>
                          <input
                            type="text"
                            class="form__input"
                            placeholder="Product subtitle"
                            name="subtitle"
                            id="subtitle"
                            value={subtitle}
                            onChange={(e) => updateFormFields(e)}
                            required
                          />
                          <label for="title" className="form__label">
                            Product subtitle
                          </label>
                        </FormGroup>

                        <FormGroup>
                          <Input
                            type="select"
                            className="form__input category-input"
                            placeholder="Select Category"
                            name="category"
                            id="category"
                            value={category}
                            onChange={(e) => updateFormFields(e)}
                            required
                          >
                            <option value="">Choose Category</option>
                            {categoryListing.map((field) => (
                              <option
                                value={field?.title?.toLowerCase()}
                                key={field._id}
                                style={{ textTransform: "capitalize" }}
                              >
                                {field.title}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                        <FormGroup>
                          <Input
                            className="form__input"
                            placeholder="Product description"
                            rows="3"
                            type="textarea"
                            name="description"
                            value={description}
                            onChange={(e) => updateFormFields(e)}
                            autoComplete="off"
                          />
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type="select"
                            className="form__input"
                            placeholder="Select Language"
                            name="language"
                            id="language"
                            value={language}
                            onChange={(e) => updateFormFields(e)}
                            required
                          >
                            <option value="">Select Language</option>
                            <option value="english">English</option>
                            <option value="french">French</option>
                            <option value="west african pidgin">
                              West African Pidgin
                            </option>
                            <option value="spanish">Spanish</option>
                            <option value="arabic">Arabic</option>
                            <option value="yoruba">Yoruba</option>
                            <option value="igbo">Igbo</option>
                          </Input>
                        </FormGroup>
                        <FormGroup>
                          <input
                            type="number"
                            class="form__input"
                            placeholder="Product Price"
                            name="price"
                            id="price"
                            value={price}
                            onChange={(e) => updatePriceFormField(e)}
                            required
                          />
                          <label for="price" className="form__label">
                            Product Price (&#x24;){" "}
                          </label>
                          {price < 3 && (
                            <p
                              style={{
                                color: "red",
                              }}
                            >
                              product price cannot be less than &#x24;3
                            </p>
                          )}
                        </FormGroup>
                        {loggedInUsername?.toLowerCase() === "courses" && (
                          <>
                            <FormGroup>
                              <input
                                type="email"
                                class="form__input"
                                placeholder="Your Registered Tutors Email"
                                name="tutorEmail"
                                id="tutorEmail"
                                value={tutorEmail}
                                onChange={(e) => updateFormFields(e)}
                              />
                              <label for="tutorEmail" className="form__label">
                                Your Registered Tutors Email
                              </label>
                            </FormGroup>
                          </>
                        )}
                        <FormGroup>
                          <input
                            style={{ display: "none" }}
                            ref={thumbnailInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => filePickerEventHandle(e)}
                          />
                          <Button
                            onClick={pickThumbnailFile}
                            className="btn-updates"
                            block
                          >
                            {thumbnailToSend === null
                              ? "Upload Thumbnail"
                              : "Change Thumbnail"}
                          </Button>
                          {thumbnailToSend !== null && (
                            <>
                              <div className="upload-image-contents">
                                <div className="upload-image-container">
                                  <img src={imageToPreview} alt="..." />
                                </div>
                              </div>
                            </>
                          )}
                        </FormGroup>
                        <FormGroup className="mt-3">
                          <Button
                            className="create-product-btn"
                            size="lg"
                            block
                            disabled={
                              thumbnailToSend === null ||
                              validCourseTitle === false ||
                              price < 3
                            }
                            onClick={() => setCreateProductSteps(2)}
                          >
                            Proceed
                          </Button>
                        </FormGroup>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="create-product-back-step__header">
                        <div onClick={() => setCreateProductSteps(1)}>
                          <i className="fas fa-long-arrow-alt-left"></i>
                        </div>
                        <p>Upload Product File</p>
                      </div>
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
                            <div className="product-file-action__btn">
                              <Button
                                onClick={() => setProductFile(null)}
                                className="modal-btn-style-outline"
                                block
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleProductCreateClickHandler}
                                className="modal-btn-style"
                                block
                              >
                                Create Product
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="upload-product-file-warning">
                        <p>
                          <span>Warning:</span> Do not upload malicious files or
                          files that are found to be offensive to any group of
                          people.
                        </p>
                        <p>
                          <span>Allowed file types: </span> .pdf .epub .mobi
                          .azw .csv .docx .xlsx .pptx .mp3 .jpg .png .gif
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <Modal isOpen={showPaymentModal} size="md" centered>
        <div className="modal-header plan-upgrade-modal__header">
          <h3>Plan Upgrade</h3>
          <div
            onClick={() => setShowPaymentModal(false)}
            className="modal-close__btn"
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body plan-upgrade-modal__body">
          <p className="text-center lead">
            You have used the total amount of storage space allocated to you as
            per your plan. <br /> Consider Upgrading your plan to get more
            space.
          </p>
        </div>
        <div className="modal-footer">
          <Button
            block
            tag={Link}
            to="/dashboard/plans/payment"
            className="modal-btn-style"
          >
            Upgrade Plan
          </Button>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  school: state.school.schoolDetails,
  loggedInUsername: state?.auth?.user?.username,
});

export default connect(mapStateToProps)(CreateProduct);

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
} from "reactstrap";
import axios from "axios";
import setAuthToken from "../../../utilities/setAuthToken";
import { startLoading, stopLoading } from "../../../actions/appLoading";

export default function ProductUpdateModal({
  updateModalDetail,
  product,
  setUpdateModalDetail,
  setProduct,
}) {
  const [categoryListing, setCategoryListing] = useState([]);
  const [productUpdate, setProductUpdate] = useState("");
  const dispatch = useDispatch();
  const alert = useAlert();
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
  const updateProductData = (e) => {
    setProductUpdate({
      ...productUpdate,
      [e.target.name]: e.target.value,
    });
  };

  const updateProductByID = async (updateBody) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(updateBody);
    dispatch(startLoading());
    try {
      const res = await axios.put(
        `/api/v1/product/detail/${product._id}`,
        body,
        config
      );
      // dispatch({
      //   // kola ??
      //   // type: UPDATE_COURSE,

      //   payload: res.data,
      // });

      setProductUpdate({
        title: res.data.title,
        subtitle: res.data.subtitle,
        category: res.data.category,
        description: res.data.description,
        language: res.data.language,
        price: res.data.price,
      });
      console.log(res.data, product);
      setProduct(res.data);

      setUpdateModalDetail(false);
      alert.show("update completed successfully", {
        type: "success",
      });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      alert.show("error updating course", {
        type: "error",
      });
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert(element.msg);
        });
      }
      console.log(error);
    }
  };
  const {
    title,
    subtitle,
    category,
    description,
    language,

    price,
  } = productUpdate;
  const onHandleProductDetailUpdate = () => {
    if (title.length === 0) {
      return alert.show("course title cannot be empty", {
        type: "error",
      });
    }
    if (subtitle.length === 0) {
      return alert.show("course subtitle cannot be empty", {
        type: "error",
      });
    }
    if (category.length === 0) {
      return alert.show("course category cannot be empty", {
        type: "error",
      });
    }
    if (description.length === 0) {
      return alert.show("course description cannot be empty", {
        type: "error",
      });
    }

    if (language.length === 0) {
      return alert.show("course language cannot be empty", {
        type: "error",
      });
    }

    if (!price) {
      return alert.show("course price not valid", {
        type: "error",
      });
    }
    updateProductByID(productUpdate);
  };
  useEffect(() => {
    getCategoryListing();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (product !== null) {
      setProductUpdate({
        title: product.title,
        subtitle: product.subtitle,
        category: product.category,
        description: product.description,
        language: product.language,
        price: product.price,
      });
    }
  }, [product]);
  return (
    <Modal size="lg" isOpen={updateModalDetail}>
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
        <div className="update-course-card">
          <Card>
            <CardBody>
              <Form>
                <FormGroup>
                  <input
                    type="text"
                    class="form__input"
                    placeholder="Product Title"
                    name="title"
                    id="title"
                    value={productUpdate.title}
                    onChange={(e) => updateProductData(e)}
                    required
                    autoFocus
                  />
                  <label for="title" className="form__label">
                    Product Title
                  </label>
                </FormGroup>
                <FormGroup>
                  <input
                    type="text"
                    class="form__input"
                    placeholder="Product Subtitle"
                    name="subtitle"
                    id="subtitle"
                    value={productUpdate.subtitle}
                    onChange={(e) => updateProductData(e)}
                    required
                  />
                  <label for="subtitle" className="form__label">
                    Product Subtitle
                  </label>
                </FormGroup>
                <FormGroup>
                  <Input
                    type="select"
                    class="form__input"
                    placeholder="Select Category"
                    name="category"
                    id="category"
                    value={productUpdate.category}
                    onChange={(e) => updateProductData(e)}
                    required
                  >
                    <option value="">Choose Category</option>
                    {categoryListing.map((field) => (
                      <option
                        value={field?.title?.toLowerCase()}
                        key={field._d}
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
                    value={productUpdate.description}
                    onChange={(e) => updateProductData(e)}
                    autoComplete="off"
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    type="select"
                    class="form__input"
                    placeholder="Select Language"
                    name="language"
                    id="language"
                    value={productUpdate.language}
                    onChange={(e) => updateProductData(e)}
                    required
                  >
                    <option value="">Select Language</option>
                    <option value="english">English</option>
                    <option value="french">French</option>
                    <option value="spanish">Spanish</option>
                    <option value="arabic">Arabic</option>
                    <option value="yoruba">Yoruba</option>
                    <option value="west african pidgin">
                      West African Pidgin
                    </option>
                    <option value="igbo">Igbo</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <input
                    type="text"
                    class="form__input"
                    placeholder="Product Price (₦)"
                    name="price"
                    id="price"
                    value={productUpdate.price}
                    onChange={(e) => updateProductData(e)}
                    required
                  />
                  <label for="price" className="form__label">
                    Product Price (₦)
                  </label>
                  <p
                    style={{
                      color: "red",
                      paddingLeft: "1.5rem",
                      visibility:
                        productUpdate.price < 2000 ? "visible" : "hidden",
                    }}
                  >
                    product price cannot be less than ₦ 2000
                  </p>
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
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
            setUpdateModalDetail(!updateModalDetail);
          }}
        >
          Cancel
        </Button>{" "}
        <Button
          onClick={onHandleProductDetailUpdate}
          disabled={productUpdate.price < 2000}
          className="modal-btn-style"
          style={{
            paddingLeft: "40px",
            paddingRight: "40px",
          }}
        >
          Update
        </Button>
      </ModalFooter>
    </Modal>
  );
}

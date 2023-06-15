import React, { useState, useEffect } from "react";
import { useDispatch, connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import axios from "axios";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import { SHOW_PAYMENT_MODAL } from "../../../actions/types";
import { useAlert } from "react-alert";
import setAuthToken from "../../../utilities/setAuthToken";
import DashboardNavbar from "../DashboardNavbar";
import ProductsContainer from "./ProductsContainer";
import NotificationNavbar from "../NotificationNavbar";
import { UPDATE_DASHBOARD_PAGE_COUNTER } from "../../../actions/types";
import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/product.css";

const Products = ({ school }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const alert = useAlert();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const pushToCreateProductLink = async () => {
    await validateProductCountBeforePush();
  };

  const getSchoolProducts = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const res = await axios.get(`/api/v1/product/school/${school._id}`);
      setProducts(res.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setProducts([]);
      setLoading(false);
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
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
    if (school) {
      getSchoolProducts();
    }
    // eslint-disable-next-line
  }, [school]);

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
                    <div className="page-title__text">My Products</div>
                    <div className="page-title_cta">
                      <Button
                        className="page-title_cta-btn"
                        onClick={pushToCreateProductLink}
                      >
                        <i className="fas fa-plus mr-2"></i> Create New Product
                      </Button>
                    </div>
                  </div>
                  {loading === false ? (
                    <ProductsContainer
                      products={products}
                      validateProductCountBeforePush={
                        validateProductCountBeforePush
                      }
                    />
                  ) : (
                    <p className="text-center lead">Loading...</p>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const mapStateToProps = (state) => ({
  school: state.school.schoolDetails,
});

export default connect(mapStateToProps)(Products);

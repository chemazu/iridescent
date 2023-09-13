import React from "react";
import { connect } from "react-redux";
import { Route, Redirect } from "react-router-dom";

const StudentAuthRoute = ({
  authenticated,
  loading,
  component: Component,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      loading === false && authenticated === false ? (
        <Redirect to="/" />
      ) : (
        <Component {...props} />
      )
    }
  />
);

const mapStateToProps = (state) => ({
  authenticated: state.student.authenticated,
  loading: state.student.loading,
});

export default connect(mapStateToProps)(StudentAuthRoute);

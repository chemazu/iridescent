import React from "react";
import { connect } from "react-redux";
import { Route, Redirect } from "react-router-dom";

const AdminPrivateRoute = ({
  authenticated,
  loading,
  user,
  component: Component,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      loading === false &&
      (authenticated === false ||
        user === null ||
        user?.user_type.includes("admin") === false) ? (
        <Redirect to="/signin" />
      ) : (
        <Component {...props} />
      )
    }
  />
);

const mapStateToProps = (state) => ({
  authenticated: state.auth.authenticated,
  loading: state.auth.loading,
  user: state.auth.user,
});

export default connect(mapStateToProps)(AdminPrivateRoute);

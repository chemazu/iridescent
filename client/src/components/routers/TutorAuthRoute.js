import React from "react";
import { connect } from "react-redux";
import { Route, Redirect } from "react-router-dom";

const TutorRoute = ({
  authenticated,
  loading,
  component: Component,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      loading === false && authenticated === false ? (
        <Redirect to="/tutor/login" />
      ) : (
        <Component {...props} />
      )
    }
  />
);

const mapStateToProps = (state) => ({
  authenticated: state.tutor.authenticated,
  loading: state.tutor.loading,
});

export default connect(mapStateToProps)(TutorRoute);

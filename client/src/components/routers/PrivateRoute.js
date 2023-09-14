import React from "react"
import { connect } from "react-redux"
import { Route, Redirect } from "react-router-dom"
 
const PrivateRoute = ({ 
    authenticated,
    loading,
    component: Component, 
    ...rest 
}) => (
    <Route {...rest} render={(props) => loading === false && authenticated === false ? (<Redirect to="/signin" />) : 
            (<Component {...props} />)  } />
)

const mapStateToProps = (state) => ({
    authenticated: state.auth.authenticated,
    loading: state.auth.loading
})

export default connect(mapStateToProps)(PrivateRoute)

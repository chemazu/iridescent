import React from "react"
import { connect } from "react-redux"
import { Route, Redirect } from "react-router-dom"

const PublicRoute = ({ 
    authenticated,
    loading,
    component: Component, 
    ...rest 
}) => (
    <Route {...rest} render={(props) => loading === false && authenticated === true ? (<Redirect to="/dashboard/courses" />) : 
            (<Component {...props} />)  } />
)

const mapStateToProps = (state) => ({
    authenticated: state.auth.authenticated,
    loading: state.auth.loading
})

export default connect(mapStateToProps)(PublicRoute)
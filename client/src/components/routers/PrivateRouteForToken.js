import React from "react"
import { Route, Redirect } from "react-router-dom"
 
const PrivateRouteForToken = ({
     component: Component, 
     ...rest
     }) => {
        const token = localStorage.getItem("token")

        return (
            <Route {...rest} render={(props => token === null ? (<Redirect to="/" />) :
                 (<Component {...props} />)  )} />
        )
     }
    

export default PrivateRouteForToken

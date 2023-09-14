import React from 'react'
import { Container } from 'reactstrap'
import { Link } from 'react-router-dom'
import SetupPageNavbar from "../layout/SetupPageNavbar"

const TokenExpired = () => {
  return <>
    <SetupPageNavbar />
    <Container className="mt-3">
    <h1>Your Link to Tuturly.</h1>
    <p className="lead">Your Verification Link is no longer Active.</p>
    <p className="lead">Click The Link Below to Sign In And Verify Account.</p>

    <p className="lead">
        <Link to="/signin">Click To Sign In</Link>
    </p>
    </Container>    
  </>
}

export default TokenExpired

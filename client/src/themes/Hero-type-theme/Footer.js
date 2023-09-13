import React from 'react'
import { Container } from "reactstrap"

export const Footer = ({ themeData }) => {
    return <>
        <section className="hero-footer">
           <Container fluid>
               <hr className="hero-footer-hr" />
            <p className="text-center hero-footer-text">
                Copyright &copy; { new Date().getFullYear() } - {themeData.themeschoolname}
            </p>
           </Container>
        </section>
    </>
}

export default Footer

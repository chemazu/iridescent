import React from 'react'
import { Container } from 'reactstrap'

import '../../../custom-styles/schoollandingpagecomponents/footer.css'

const Footer = ({
  theme,
  schoolName
}) => {
  return <>
    <section style={{
      backgroundColor:theme.themestyles.footerbackgroundcolor
    }}>
           <Container fluid>
            <p style={{
              color: theme.themestyles.footertextcolor,
              fontFamily: theme.themestyles.fontfamily
            }} className="text-center school-footer-text__style">
                Copyright &copy; { new Date().getFullYear() } - {schoolName}
            </p>
           </Container>
        </section>
  </>
}

export default Footer

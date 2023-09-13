import React from 'react'
import { Container } from 'reactstrap'

import '../../../custom-styles/dashboard/themepreview/themepreviewfooter.css'

const ThemePreviewFooter = ({ theme }) => {
  return <>
    <section style={{
      backgroundColor:theme.themedefaultstyles.footerbackgroundcolor
    }}>
           <Container fluid>
            <p style={{
              color: theme.themedefaultstyles.footertextcolor,
              fontFamily: theme.themedefaultstyles.fontfamily
            }} className="text-center school-footer-text__style">
                Copyright &copy; { new Date().getFullYear() } - Tuturly
            </p>
           </Container>
        </section>
  </>
}

export default ThemePreviewFooter

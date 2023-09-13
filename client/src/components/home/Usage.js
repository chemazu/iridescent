import React from 'react'
import { Container, Row, Col } from 'reactstrap'

import benefitSvg from "../../images/benefitSVG.svg"
import whoSvg from "../../images/whoSVG.svg"
import whySvg from "../../images/whySVG.svg"

const Usage = () => {
  return <>
    <section className='usage-section'>
        <Container fluid className='usage-container'>
            <Row>
                <Col className='mb-2' xs="12" sm="12" md="12" lg="4" xl="4">
                    <div className='usage-item usage-item-coloured usage-item-first-child'>
                        <div className='usage-item-img-container'>
                            <img src={whySvg} alt="..." className='img-fluid' />
                        </div>
                        <h3 className='usage-item__header text-center'>
                            Why Tuturly?
                        </h3>
                        <p className='text-center'>
                        Tuturly was created for the sole purpose
                        of making it easy for professionals
                        from all works of life to share their knowledge
                        thereby making it easier for information
                        to remain available and passed down to generations.
                        </p>
                    </div>
                </Col>
                <Col className='mb-2' xs="12" sm="12" md="12" lg="4" xl="4">
                    <div className='usage-item usage-item-regular'>
                        <div className='usage-item-img-container'>
                            <img src={whoSvg} alt="..." className='img-fluid' />
                        </div>
                        <h3 className='usage-item__header text-center'>
                            Who Is Tuturly For?
                        </h3>
                        <p className='text-center'>
                        Tuturly is for tutors from all works of life,
                        that want to earn an honest living
                        by impacting their knowledge
                        through their Lectures,
                        tutorials or Masterclasses.
                        </p>
                    </div>
                </Col>
                <Col className='mb-2' xs="12" sm="12" md="12" lg="4" xl="4">
                    <div className='usage-item usage-item-regular usage-item-last-child'>
                         <div className='usage-item-img-container'>
                            <img src={benefitSvg} alt="..." className='img-fluid' />
                        </div>
                        <h3 className='usage-item__header text-center'>
                            Benefits Of Tuturly
                        </h3>
                        <ol className='text-center'>
                            <li>You own your own customizable webpage.</li>
                            <li>You do not need to have a coding knowledge.</li>
                            <li>You can upload Large Size Videos.</li>
                            <li>You can interact with your students.</li>
                            <li>You can monitize your videos.</li>
                        </ol>
                    </div>
                </Col>
            </Row>
        </Container>
    </section>
  </>
}

export default Usage

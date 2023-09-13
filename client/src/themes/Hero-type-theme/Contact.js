import React from 'react'
import { Button, 
    Container, 
    Row,
    Col, 
    Form, 
    FormGroup, 
    Input } from "reactstrap"

export const Contact = ({ themeData }) => {
    return <>
        <section className="contact">
            <Container>
                <Row>
                    <Col sm="6" md="6">
                        <div className="contact-info">
                            <h2 className="contact-header">Contact Us</h2>
                            <p className="contact-paragraph">{themeData.contactaddress}</p>
                            <p className="contact-paragraph">phone no:{themeData.countryphonecode}{themeData.phonenumber}</p>
                        </div>
                    </Col>
                    <Col sm="6" md="6">
                        <div className="contact-form">
                            <p className="contact-form-question">
                                Got any questions?
                            </p>
                            <Form>
                            <FormGroup>
                            <Input
                                className="form-control-alternative hero-contact-form-styles"
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                >
                            </Input>
                            </FormGroup>
                            <FormGroup>
                            <Input
                                className="form-control-alternative hero-contact-form-styles"
                                type="email"
                                name="email"
                                placeholder="Enter a valid email"
                                >
                            </Input>
                            </FormGroup>
                                <FormGroup>
                                <Input
                                className="form__input hero-contact-form-styles"
                                placeholder="Type Your Message"
                                rows="5"
                                type="textarea"
                                name="message"
                                autoComplete="off"
                            />
                                </FormGroup>
                                <FormGroup>
                                <Button
                                type="submit"
                                size="lg"
                                className="hero-contact-form-button"
                                >
                                    Submit
                                </Button>
                            </FormGroup>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    </>
}

export default Contact
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Modal, Card, CardHeader, Button,
        CardBody, Form, FormGroup, Input,
        Nav, NavItem, NavLink
    } from 'reactstrap'
import { useAlert } from 'react-alert'
import { studentSignUp, studentSignIn } from '../../actions/student'    

const AuthenticationModal = ({ authModal,
     toggleAuthModal, schoolName,
     signup, signin,
     checkOut,
     theme
    }) => {

    const [ iconTabs, setIconTabs ] = useState(1)
    const toggleNavs = (e, index) => {
        e.preventDefault()
        setIconTabs(index)
    }

    const alert = useAlert()

    const [ signInDetails, setSignInDetails ] = useState({
        email: "",
        password: ""
    })

    const [ signUpDetails, setSignUpDetails ] = useState({
        firstname:"",
        lastname:"",
        email:"",
        username:"",
        password:""
    })

    const updateSignUpInputs = (e) => setSignUpDetails({
        ...signUpDetails,
        [e.target.name]: e.target.value
    })

    const updateSignInInputs = (e) => setSignInDetails({
        ...signInDetails,
        [e.target.name]: e.target.value
    })

    const handleSignUp = (e) => {
        e.preventDefault()
        if(signUpDetails.firstname.length === 0){
          return alert.show('firstname cannot be empty', {
            type:'error'
          })
        }
        if(signUpDetails.lastname.length === 0){
          return alert.show('lastname cannot be empty', {
            type:'error'
          })
        }
        if(signUpDetails.email.length === 0){
          return alert.show('email cannot be empty', {
            type:'error'
          })
        }
        if(signUpDetails.username.length === 0){
          return alert.show('username cannot be empty', {
            type:'error'
          })
        }
        if(signUpDetails.password.length === 0){
          return alert.show('password cannot be empty', {
            type:'error'
          })
        }
        signup(schoolName, signUpDetails)
        toggleAuthModal()
    }

    const handleSignIn = (e) => {
      e.preventDefault()
        if(signInDetails.email.length === 0){
          return alert.show('email cannot be empty', {
            type:'error'
          })
        }
        if(signInDetails.password.length === 0){
          return alert.show('password cannot empty', {
            type:'error'
          })
        }
        signin(schoolName, signInDetails)
        toggleAuthModal()
    }

    return <>
          <Modal
              className="modal-dialog-centered"
              size="sm"
              isOpen={authModal}
              toggle={toggleAuthModal}
            >
              <div className="modal-body p-0">
                <Card className="bg-secondary shadow border-0">
                  <CardHeader className="bg-white pb-5">
                    <div className="text-center mb-3">
                        <p>SignIn Or SignUp To Continue</p>
                    </div>
            <div className="authentication-nav__container">
            <div className="nav-wrapper">
              <Nav
                className="nav-fill flex-column flex-md-row"
                id="tabs-icons-text"
                pills
                role="tablist"
              >
                <NavItem>
                  <NavLink
                    aria-selected={iconTabs === 1}
                    className={`mb-sm-3 mb-md-0 ${iconTabs === 1 && 'active'}`}
                    onClick={e => toggleNavs(e, 1)}
                    href="#pablo"
                    role="tab"
                    style={{
                      backgroundColor: iconTabs === 1 && theme.themestyles.buttonbackgroundcolor,
                      color: iconTabs === 1 && theme.themestyles.buttontextcolor
                    }}
                  >
                    Sign In
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    aria-selected={iconTabs === 2}
                    className={`mb-sm-3 mb-md-0 ${iconTabs === 2 && 'active'}`}
                    onClick={e => toggleNavs(e, 2)}
                    href="#pablo"
                    role="tab"
                    style={{
                      backgroundColor: iconTabs === 2 && theme.themestyles.buttonbackgroundcolor,
                      color: iconTabs === 2 && theme.themestyles.buttontextcolor
                    }}
                  >
                   Sign Up
                  </NavLink>
                </NavItem>
              </Nav>
             </div>
            </div>
                  </CardHeader>
                  {
                      iconTabs === 1 ? (<CardBody className="px-lg-5 py-lg-2">
                      <div className="text-center text-muted mb-4">
                        <small>Sign in with credentials</small>
                      </div>
                      <Form role="form" onSubmit={e => handleSignIn(e)}>
                        <FormGroup
                        >
                            <Input
                              placeholder="Email"
                              required
                              type="email"
                              autoComplete="off"
                              name="email"
                              value={signInDetails.email}
                              onChange={e => updateSignInInputs(e)}
                            />
                        </FormGroup>
                        <FormGroup
                        >
                          <Input
                          placeholder="Password"
                          required
                          type="password"
                          autoComplete="off"
                          name="password"
                          value={signInDetails.password}
                          onChange={e => updateSignInInputs(e)}
                          />
                        </FormGroup>
                        <div className="text-center">
                          <Button
                          style={{
                            backgroundColor: theme.themestyles.buttonbackgroundcolor,
                            color: theme.themestyles.buttontextcolor
                          }}
                          block
                           onClick={handleSignIn}
                           className="my-5 signin-signup__button"
                           type="submit">
                            Sign in
                          </Button>
                        </div>
                      </Form>
                    </CardBody>) : ( <CardBody className="px-lg-5 py-lg-2">
                    <div className="text-center text-muted mb-4">
                      <small>Sign Up As a new Student</small>
                    </div>
                    <Form role="form" onSubmit={e => handleSignUp(e)}>
                      <FormGroup
                      >
                          <Input
                            placeholder="First Name"
                            type="text"
                            autoComplete="off"
                            name="firstname"
                            required
                            value={signUpDetails.firstname}
                            onChange={e => updateSignUpInputs(e)}
                          />
                      </FormGroup>
                      <FormGroup
                      >
                          <Input
                            placeholder="Last Name"
                            type="text"
                            required
                            autoComplete="off"
                            name="lastname"
                            value={signUpDetails.lastname}
                            onChange={e => updateSignUpInputs(e)}
                          />
                      </FormGroup>
                      <FormGroup>
                          <Input
                            placeholder="Email"
                            type="email"
                            required
                            autoComplete="off"
                            name="email"
                            value={signUpDetails.email}
                            onChange={e => updateSignUpInputs(e)}
                          />
                      </FormGroup>
                      <FormGroup>
                          <Input
                            placeholder="Username"
                            type="username"
                            required
                            autoComplete="off"
                            name="username"
                            value={signUpDetails.username}
                            onChange={e => updateSignUpInputs(e)}
                          />
                      </FormGroup>
                       <FormGroup
                       >
                        <Input
                        placeholder="Password"
                        type="password"
                        required
                        autoComplete="off"
                        name="password"
                        value={signUpDetails.password}
                        onChange={e => updateSignUpInputs(e)}
                        />
                      </FormGroup>
                      <div className="text-center">
                        <Button
                        style={{
                          backgroundColor: theme.themestyles.buttonbackgroundcolor,
                          color: theme.themestyles.buttontextcolor
                        }}
                        block
                         onClick={handleSignUp}
                         className="my-5 signin-signup__button"
                         type="submit">
                          Sign Up
                        </Button>
                      </div>
                    </Form>
                  </CardBody>)
                  }
                </Card>
              </div>
            </Modal>
    </>
}

const mapDispatchToProps = (dispatch) => ({
    signup: (schoolName, studentDetails) => dispatch(studentSignUp(schoolName, studentDetails)),
    signin: (schoolname, studentDetails) => dispatch(studentSignIn(schoolname, studentDetails))
})

export default connect(null, mapDispatchToProps)(AuthenticationModal)

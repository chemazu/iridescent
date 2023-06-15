import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { 
    Row,
    Col,
    Container
} from "reactstrap"
import { UPDATE_DASHBOARD_PAGE_COUNTER } from "../../../actions/types"
import DashboardNavbar from "../DashboardNavbar"
import MessagesContainer from "./MessagesContainer"

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/messages.css"
import NotificationNavbar from '../NotificationNavbar'

const Messages = ({
    updatePageSelector
}) => {

    useEffect(() => {
        updatePageSelector(6)
        // eslint-disable-next-line
    }, [])

    return <>
    <div className="dashboard-layout">
        <Container fluid>
            <Row>
               <DashboardNavbar />
                <Col className="page-actions__col">
                   <div className="page-actions">
                       <NotificationNavbar />
                        <div className="messages-page">
                        <div className="messages-page__contents">
                            <h3 className="page-title">
                                 Messages
                            </h3>
                        <MessagesContainer />
                        </div>
                        </div>
                   </div>
                </Col>
            </Row>
        </Container>
    </div>
</>
}

const mapDispatchToProps = (dispatch) => ({
  updatePageSelector: (counter) => dispatch({type: UPDATE_DASHBOARD_PAGE_COUNTER, payload:counter })
})

export default connect(null, mapDispatchToProps)(Messages)
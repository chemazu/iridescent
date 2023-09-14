import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAlert } from 'react-alert'
import setAuthToken from '../../../utilities/setAuthToken'
import { connect } from "react-redux"
import { 
    Row,
    Col,
    Container,
    Nav, 
    NavItem,
    NavLink,
    Card,
    CardBody,
    TabContent,
    TabPane
} from "reactstrap"
import { UPDATE_DASHBOARD_PAGE_COUNTER } from "../../../actions/types"
import DashboardNavbar from "../DashboardNavbar"

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/sales.css"
import NotificationNavbar from '../NotificationNavbar'
import WalletsComponent from './WalletsComponent'
import BankDetailsComponent from './BankDetailsComponent'
import OrderHistoryComponent from './OrderHistoryComponent'
import WithdrawalHistoryComponent from './WithdrawalHistoryComponent'

const Sales = ({ 
    updatePageSelector
}) => {
    
    const [ userBankAccounts, setUserBankAccounts ] = useState([])
    const [ userAccountLoading, setUserAccountLoading ] = useState(true)
    const alert = useAlert()

    const getUserBankAccounts = async () => {
        try {
            if(localStorage.getItem('token')){
                setAuthToken(localStorage.getItem('token'))
            }
            const res = await axios.get('/api/v1/bank/me')
            setUserBankAccounts(res.data)
            setUserAccountLoading(false)
        } catch (error) {
            alert.show(error.message, {
                type:'error'
            })
            setUserBankAccounts([])
            console.log(error)
            setUserAccountLoading(false)
        }
    }

    const updateUserBankAccountList = (data) => setUserBankAccounts([
        ...userBankAccounts, data
    ])

    const deleteItemFromUserBankAccountList = (data) => setUserBankAccounts(
        userBankAccounts.filter((account) => account._id !== data)
     )

    const [tabs, setTabs] = useState(1)
    const toggleNavs = (e, index) => {
        e.preventDefault()
        setTabs(index)
    }

    useEffect(() => {
        updatePageSelector(5)
        getUserBankAccounts()
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
                        <div className="sales__contents">
                        <div className="sales-section-container mb-3">
                        <Container fluid style={{
                                width: '90%',
                                display:'flex',
                                justifyContent:'center'
                            }}>
                        <Nav
                            className="flex-column flex-md-row"
                            id="tabs-icons-text"
                            pills
                            role="tablist"
                            style={{
                                width:'100%',
                                display:'flex',
                                justifyContent:'space-between'
                            }}
                        >
                            <NavItem>
                            <NavLink
                                aria-selected={tabs === 1}
                                className={`"mb-sm-3 mb-md-0" ${tabs === 1 && 'active'}`}
                                onClick={e => toggleNavs(e, 1)}
                                href="#pablo"
                                role="tab"
                            >
                                Wallet
                            </NavLink>
                            </NavItem>
                            <NavItem>
                            <NavLink
                                aria-selected={tabs === 2}
                                className={`"mb-sm-3 mb-md-0" ${tabs === 2 && 'active'}`}
                                onClick={e => toggleNavs(e, 2)}
                                href="#pablo"
                                role="tab"
                            >
                                Bank Details
                            </NavLink>
                            </NavItem>
                            <NavItem>
                            <NavLink
                                aria-selected={tabs === 3}
                                className={`"mb-sm-3 mb-md-0" ${tabs === 3 && 'active'}`}
                                onClick={e => toggleNavs(e, 3)}
                                href="#pablo"
                                role="tab"
                            >
                               Payment History
                            </NavLink>
                          </NavItem>
                          <NavItem>
                          <NavLink
                                aria-selected={tabs === 4}
                                className={`"mb-sm-3 mb-md-0" ${tabs === 4 && 'active'}`}
                                onClick={e => toggleNavs(e, 4)}
                                href="#pablo"
                                role="tab"
                            >
                             Withdrawal History
                            </NavLink>
                          </NavItem>
                         </Nav>
                         </Container>
                        </div>
                        <Container>
                        <Card className="mt-2 sales-page__card">
                            <CardBody>
                                <TabContent activeTab={"tabs" + tabs}>
                                    <TabPane tabId="tabs1">
                                      <WalletsComponent
                                        userBankAccounts={userBankAccounts}
                                        userAccountLoading={userAccountLoading}
                                      />
                                    </TabPane>
                                    <TabPane tabId="tabs2">
                                       <BankDetailsComponent
                                          userBankAccounts={userBankAccounts}
                                          userAccountLoading={userAccountLoading}
                                          updateUserBankAccountList={updateUserBankAccountList}
                                          deleteItemFromUserBankAccountList={deleteItemFromUserBankAccountList}
                                       />
                                    </TabPane>
                                    <TabPane tabId="tabs3">
                                       <OrderHistoryComponent />
                                    </TabPane>
                                    <TabPane tabId="tabs4">
                                      <WithdrawalHistoryComponent />
                                    </TabPane>
                                </TabContent>
                            </CardBody>
                        </Card>
                     </Container>
                    </div>
                </div>
             </Col>
            </Row>
        </Container>
    </div>
</>
}

const mapStateToProps = (state) => ({
    school: state.school.schoolDetails
})

const mapDispatchToProps = (dispatch) => ({
  updatePageSelector: (counter) => dispatch({type: UPDATE_DASHBOARD_PAGE_COUNTER, payload:counter })
})

export default connect(mapStateToProps, mapDispatchToProps)(Sales)
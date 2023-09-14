import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Container, 
    // UncontrolledDropdown, 
    // DropdownToggle, DropdownMenu,
    //  DropdownItem 
} from 'reactstrap'
import setAuthToken from '../../../utilities/setAuthToken'
import { useAlert } from 'react-alert'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import WithdrawHistoryTable from './WithdrawHistoryTable'

const WithdrawalHistoryComponent = () => {

    const [ withdrawHistory, setWithdrawHistory ] = useState([])
    const [ withdrawalHistoryLoading, setWithdrawalHistoryLoading ] = useState(true)
    const alert = useAlert()

    const getWithdrawHistory = async () => {
        if(localStorage.getItem("token")){
            setAuthToken(localStorage.getItem("token"))
        }
        try {
          const res = await axios.get('/api/v1/wallet/withdraw')
          setWithdrawHistory(res.data)
          setWithdrawalHistoryLoading(false)
        } catch (error) {
            alert.show(error.msg, {
                type:'error'
            })
            setWithdrawHistory([])
          setWithdrawalHistoryLoading(false)
        }
    }

    useEffect(() => {
      getWithdrawHistory()
    //    eslint-disable-next-line
    }, [])

    return <>
        <div className="history__content mt-3">
            <Container>
                <div className="content__header">
                    <h2 className="order-page__title">
                        Your Withdrawal History
                    </h2>
                    {/* <div className="sort-dropdown">
                  <UncontrolledDropdown>
                    <DropdownToggle
                    color="secondary"
                    id="dropdownMenuButton"
                    type="button"
                    className="dropdown-btn-style"
                    >
                    <i className="fas fa-filter"></i>
                    </DropdownToggle>
                    <DropdownMenu
                     aria-labelledby="dropdownMenuButton"
                     className="dropdown-menu__style"
                     >
                    <DropdownItem
                    className="dropdown-item__style"
                    >
                        View based on time
                    </DropdownItem>
                    <DropdownItem 
                    className="dropdown-item__style">
                        View based on course
                    </DropdownItem>
                    </DropdownMenu>
                    </UncontrolledDropdown>
                    </div> */}
                </div>
                {
                    withdrawalHistoryLoading ? <>
                        <div className="mt-3 mb-3" style={{
                          height:'400px'
                          }}>
                      <SkeletonTheme
                          color="#f2f2f2"
                          highlightColor="#fff"
                          >
                          <Skeleton 
                          duration={2.4} height="400px" width="100%" /> 
                      </SkeletonTheme>
                  </div>
                    </> : <>
                          <WithdrawHistoryTable 
                            withdrawHistory={withdrawHistory}
                          />
                    </>
                }
            </Container>
        </div>
    </>
}

export default WithdrawalHistoryComponent

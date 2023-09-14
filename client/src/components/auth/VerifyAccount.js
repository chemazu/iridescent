import React, { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { startLoading, stopLoading } from '../../actions/appLoading'
import { SIGNUP_SUCCESS } from '../../actions/types'
import { loadUser } from '../../actions/auth'
import { useAlert } from 'react-alert'

const VerifyAccount = ({ match }) => {

    const alert = useAlert()
    const history = useHistory()
    const dispatch = useDispatch()

    const verifyUserByToken = async (token) => {
        try {
            dispatch(startLoading())
            const res = await axios.put(`/api/v1/user/account/verify/${token}`)
            dispatch({
                type: SIGNUP_SUCCESS,
                payload: res.data.token
            })
            dispatch(stopLoading())
            alert.show('account verified successfully', {
                type:'success'
            })
            dispatch(loadUser())
            history.push('/account/setup/stepone')
        } catch (error) {
            dispatch(stopLoading())
            alert.show("Link Not Valid", {
                type:'error'
            })
            history.push('/verify/token/expired')
        }
    }

    useEffect(() => {
        verifyUserByToken(match.params.token)
        // eslint-disable-next-line
    }, [])

  return <>
    <p className="lead text-center">
        Verification In Progress...
    </p>
  </>
}

export default VerifyAccount

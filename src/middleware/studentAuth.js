import jwt from "jsonwebtoken"

const studentAuth = (req, res, next) => {
    const token = req.header('x-auth-token')

    if(!token){
        return res.status(401).json({
            msg: "No Token. Authorization Denied"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.STUDENTTOKENSECRET)
        req.student = decoded.student
        next()
    } catch (error) {
        res.status(401).json({msg: 'Token is not valid'})
    }
}

export default studentAuth
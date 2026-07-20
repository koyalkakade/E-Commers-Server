const jwt = require('jsonwebtoken')
require('dotenv').config()

function auth (req,res,next){
    // console.log(req.headers.authorization)

    if(!req.headers.authorization){
        res.status(400).send({msg:"Please login"})
    }
    let token =req.headers.authorization
    if(!token.startsWith('Bearer')){
        res.status(400).send({msg:"Not authorized; Invalid format"})
    }
    token = token.split(' ')[1]
    // console.log(token)
    const decoded = jwt.decode(token, process.env.SECRET_KEY)
    // console.log(decoded)
    req.user = {
        id:decoded.id,
        role:decoded.role
    }
    next()
}   

function admin(req,res,next){

    if(req.user.role == 'admin'){
        next()
    }else{
        res.status(400).send({msg:"Not authorized"})
    }

}

function vendor(req,res,next){

    if(req.user.role == 'vendor'){
        next()
    }else{
        res.status(400).send({msg:"Not authorized"})
    }

}

module.exports = {auth, admin, vendor}
const User = require("../api/models/user")
const { verifyToken } = require("../utils/token")
const { isAdmin, isUser} = require("../utils/rol")

const isAuth = async (req, res, next ) => {

    if(req.headers.authorization){
        const [ , token] = req.headers.authorization.split(" ");
        if(!token){
             return res.status(401).json("Unauthorized");
        }
        else{

            try {
                const decoded = verifyToken(token);
                req.user = await User.findById(decoded.id) 
                if(isUser(req.user)){
                    next()
                } 
                else {
                    return res.status(401).json("Unauthorized");
                }
                
                
            } catch (error) {
                return res.status(401).json("Unauthorized1");
            }

        }
        
    }
    

}

const isAuthAdmin = async (req, res, next ) => {

    if(req.headers.authorization){
        const [ , token] = req.headers.authorization.split(" ");
        
        if(!token){
             return res.status(401).json("Unauthorized1");
        }
        else {
            try {
                const decoded = verifyToken(token);
                req.user = await User.findById(decoded.id)
                if(isAdmin(req.user)){
                    next()
                } 
                else {
                    return res.status(401).json("Unauthorized2");
                }
               
               
            } catch (error) {
                return res.status(401).json("Unauthorized3");
            }
        }

    }
    

}

module.exports = { 
    isAuth,
    isAuthAdmin

 }
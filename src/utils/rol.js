
const isUser = (user) =>{

        if(user.rol === "admin" || user.rol ==="user"){
            return true
        }
        else return false
    
    }

const isAdmin = (user) =>{

     if(user.rol === "admin"){
            return true
        }
    else return false

}

module.exports = {
    isAdmin,
    isUser
}
const jwt = require('jsonwebtoken');

module.exports = function(req,res,next){
    const auth = req.headers.authorization;
    
    if(!auth){
        return res.status(401).json({'message':'Missing authorization token'});
    }
    
    const token = auth.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, result) =>{
        if(err){
            return res.status(401).json({'message':'Invalid authorization token'});
        }
        else{
            if(result){
                req.userData = result;
                next();
            }
        }
    })
};
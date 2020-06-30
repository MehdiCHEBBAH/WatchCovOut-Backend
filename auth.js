var {admin} = require('./app');

const decodeToken = async (token) => {
    var result = {};
    try{
        var decodedToken = await admin.auth().verifyIdToken(token);
        result = {
            auth: true,
            uid: decodedToken.uid,
            roles: decodedToken.roles
        };
    }catch(err){
        result = {
            auth: false,
            err: err
        };
    };
    return result;
};


module.exports = {
    isUser : async (req, res, next)=>{
        let isAuth = await decodeToken(req.token);
        if(!isAuth.auth){
            res.status(401);
            res.send({
                error:'Unauthorized',
                details: isAuth.err
        });
        }else{
            next();
        }
    },
    
    isServiceProvider : async (req, res, next)=>{
        let isAuth = await decodeToken(req.token);
        if(!(isAuth.auth && isAuth.roles['SERVICE_PROVIDER'])){
            res.status(401);
            res.send({
                error:'Unauthorized',
                details: isAuth.err
            });
        }else{
            next();
        }
    },

    isAdmin : async (req, res, next)=>{
        let isAuth = await decodeToken(req.token);
        if(!(isAuth.auth && isAuth.roles['ADMIN'])){
            res.status(401);
            res.send({
                error:'Unauthorized',
                details: isAuth.err
            });
        }else{
            next();
        }
    }
    
};
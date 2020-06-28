const axios = require('axios');
var admin = require("firebase-admin");

var config = require("./config.json");


admin.initializeApp({
    credential: admin.credential.cert(require(config.FIREBASE_CREDENTIALS)),
    databaseURL: config.DATABASE_URL
});



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
    },

    isMe : async (req, res, next)=>{
        let isAuth = await decodeToken(req.token);
        if(!(isAuth.auth && isAuth.uid === req.query.uid)){
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
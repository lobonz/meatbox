const expressJwt = require('express-jwt');

module.exports = jwt;

function jwt() {
    //console.log(process.env.SECRET)
    return expressJwt({ secret: process.env.SECRET, algorithms: ['sha1', 'RS256', 'HS256'], }
    ).unless({
        path: [
            // public routes that don't require authentication
            '/api/users/authenticate/',
            /\/api\/logs\/read/ig, //remove for production
        ]
    });
}

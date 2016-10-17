// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '680923768742724', // your App ID
        'clientSecret'  : '190b1ae5a9f767b608a8cfb97cb0108c', // your App Secret
        'callbackURL'   : 'http://localhost:3030/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'ZWzcIU66f5cZS6GRZdUniUGA0',
        'consumerSecret'    : 'ExLHJ4sbXVAa8vkZWAHN0YrHDSI1vXJjRxHxYARp2cMwUooWds',
        'callbackURL'       : 'http://localhost:3030/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '2814886091-3cuukv30vovl21ile0o0c5cgi6ttlmc3.apps.googleusercontent.com',
        'clientSecret'  : 'RVJ1L2NriISLeedMgZUyqNm_',
        'callbackURL'   : 'http://localhost:3030/auth/google/callback'
    }

};

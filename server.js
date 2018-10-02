const mongoose = require('mongoose')
const express = require('express')
const cookieSession = require('cookie-session');
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
const keys = require('./config/keys');

require('./models/User')
const User = mongoose.model('users');

mongoose.connect(keys.mongooseURI, { useNewUrlParser: true })

const app = express()

passport.use(new FacebookStrategy({
    clientID: keys.APP_ID,
    clientSecret: keys.APP_SECRET,
    callbackURL: keys.CALL_BACK_URI
}, 
    (accessToken, refreshToken, profile, done) => {
        console.log(profile.displayName);

        User.findOne({ facebookId: profile.id }).then((existingUser) => {
            if(existingUser) {
                done(null, existingUser);
            } else {
                new User({ facebookId: profile.id, displayName: profile.displayName })
                    .save()
                    .then( user => done(null, user));
            }
        })

        done();
    }
));


app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send({user: 'Thulano'});
})

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: 'read_stream' })
);

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/home',
    failureRedirect: '/logout',
}));

app.get('/home', (req, res) => {
    res.send(req.user);
});

app.get('/error', (req, res) => {
    res.send({ error: 'login failed.'});
});

app.get('/logout', (req, res) => {
    req.logout();
});

app.listen(4000, () => { console.log('App running') })
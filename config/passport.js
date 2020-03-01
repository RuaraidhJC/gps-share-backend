// load all the things we need
const LocalStrategy = require('passport-local').Strategy;

// load up the user model
const User = require('../models/index')['User'].scope('sanitized');
const FriendReq = require('../models/index')['FriendReq'];
const Position = require('../models/index')['Position'];

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(async (id, done) => {
        const user = await User.findByPk(id, {
            include: [
                Position,
                {
                    model: FriendReq,
                    as: 'OpenFriendReqs',
                    attributes: ['sender', 'receiver'],
                },
                {
                    model: User,
                    as: 'Friends',
                    through: {
                        where: { isConfirmed: true },
                        attributes: [],
                    },
                    include: [Position]
                }
            ]
        }, (err) => {
            console.log(err);
        });
        if (!user) {
            return done('couldnt find user', null);
        }

        return done(null, user);
    });

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    async (req, email, password, done) => {
        console.log('coucou');
        email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
        console.log(email);
        const user = await User.findOne({ where: {email: email} });
        console.log(user);
        if (!user)
            return done(null, false);
        const valid = await User.validPassword(password, user.id);
        if (!valid)
            return done(null, false);
        else
            return done(null, user);

    }));

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    async (req, email, password, done) => {
        if (req.user)
            return done(null, req.user);
        if (!email || !password || !req.body.notificationToken)
            return done(null, false);
        email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
        const user = await User.findOne({where: {email}});
        if (user)
            return done(null, false);
        await User.create({
            email: email,
            password: password,
            notificationToken: req.body.notificationToken
        });
        const newUser = await User.findOne({where:{email:email}});
        console.log(newUser);
        if (!newUser)
            return done(null, false);
        return done(null, newUser);

    }));
};

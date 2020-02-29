const db = require("../models/index");
const User = db['User'];
const FriendReq = db['FriendReq'];

module.exports = function(app, passport) {

    app.get('/me', isLoggedIn, function(req, res) {
        res.send(req.user);
    });

    app.post('/login', passport.authenticate('local-login'), (req, res, next) => {
        res.send("ok");
        next();
    });

    app.get('/add-friend', isLoggedIn, async (req, res, next) => {
        try {


            if (!req.query.email)
                return next('error');
            if (req.user.friends.find(elem => elem.email === req.query.email)) {
                res.send("already friend");
                return next();
            }
            const confirm = (req.query.confirm === 'true');
            const receiver = await User.findOne({
                where: {email: req.query.email},
                include: [FriendReq, {model: User, as: 'friends'}]
            });
            if (!receiver) {
                res.send("bad friend email");
                return next('error');
            }
            if (confirm) {
                const existingRequest = await req.user.getFriendReqs({
                    where: {
                        sender: req.query.email,
                        receiver: req.user.email,
                        isConfirmed: false
                    }
                });
                if (!existingRequest) {
                    res.send("no exiting friend request");
                    return next('error');
                }
                await req.user.addFriend(receiver, {through: {isConfirmed: true}});
                await receiver.addFriend(req.user, {through: {isConfirmed: true}});
                res.send("ok");
                return next();
            }
            await req.user.addFriend(receiver, {through: {sender: req.user.email, receiver: receiver.email}});
            await receiver.addFriend(req.user, {through: {sender: req.user.email, receiver: receiver.email}});
            res.send("ok");
            return next()
        } catch (err) {
            console.log(err)
        }
    });

    app.post('/signup', passport.authenticate('local-signup'), (req, res, next) => {
        res.json({mess: 'ok'});
        next();
    });

    app.get('/logout', (req, res) => {
        req.logout();
        res.send("ok");
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    //res.send('not auth');
    return next('error');
}

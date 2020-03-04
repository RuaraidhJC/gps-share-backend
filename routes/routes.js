const db = require("../models/index");
const User = db['User'];
const FriendReq = db['FriendReq'];
const Position = db['Position'];
const HttpResponse = require('../middleware/HttpResponse');

module.exports = function(app, passport) {

    app.get('/me', isLoggedIn, function(req, res, next) {
        return next(new HttpResponse.OkResponse(req.user));
    });

    app.post('/login', passport.authenticate('local-login'), (req, res, next) => {
        return next(new HttpResponse.OkResponse(req.user));
    });

    app.post('/position', isLoggedIn, async (req, res, next) => {
        const {longitude, latitude, rating, message} = req.body;
        const position = await Position.create({
            email: req.user.email,
            longitude,
            latitude,
            rating,
            message
        });
        await req.user.addPosition(position);
        const emailList = req.user['Friends'].map(elem => elem.email);
        return next(new HttpResponse.OkResponse('ok', 'ok', {userList: [req.user.email, ...emailList], message: 'A new position has been shared with you', body: `${req.user.email} sent you his position`}));
    });

    app.get('/add-friend', isLoggedIn, async (req, res, next) => {
        try {
            if (!req.query.email)
                return next(new HttpResponse.BadRequestResponse('Please provide an email to add as friend'));
            if (req.user.Friends.find(elem => elem.email === req.query.email))
                return next(new HttpResponse.BadRequestResponse('Youre already friends!'));
            const confirm = (req.query.confirm === 'true');
            const receiver = await User.findOne({
                where: {email: req.query.email},
                include: [FriendReq, {model: User, as: 'Friends'}]
            });
            if (!receiver)
                return next(new HttpResponse.BadRequestResponse('Couldnt find friends email'));
            if (confirm) {
                const existingRequest = await req.user.getFriendReqs({
                    where: {
                        sender: req.query.email,
                        receiver: req.user.email,
                        isConfirmed: false
                    }
                });
                if (!existingRequest.length) {
                    return next(new HttpResponse.BadRequestResponse('no existing friend request'));
                }
                console.log(existingRequest);
                await req.user.addFriend(receiver, {through: {isConfirmed: true}});
                await receiver.addFriend(req.user, {through: {isConfirmed: true}});
                return next(new HttpResponse.OkResponse('ok', 'ok', {userList: [req.query.email, receiver.email], message: 'A friend request has been accepted', body: `${req.user.email} is and ${receiver.email} are now friends`}));
            }
            console.log({through: {sender: req.user.email, receiver: receiver.email}});
            await req.user.addFriend(receiver, {through: {sender: req.user.email, receiver: receiver.email}});
            await receiver.addFriend(req.user, {through: {sender: req.user.email, receiver: receiver.email}});
            return next(new HttpResponse.OkResponse('ok', 'ok', {userList: [receiver.email, req.query.email], message: 'You received a new friend request', body: `${req.user.email} wants to be friends with ${receiver.email}`}));
        } catch (err) {
            console.log(err)
        }
    });

    app.post('/signup', passport.authenticate('local-signup'), (req, res, next) => {
        return next(new HttpResponse.OkResponse(req.user));
    });

    app.get('/logout', (req, res, next) => {
        req.logout();
        return next(new HttpResponse.OkResponse('ok'));
    });

};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    //res.send('not auth');
    return next(new HttpResponse.UnauthorizedResponse());
}

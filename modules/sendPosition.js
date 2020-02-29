import db from '../old-models/db'

const User = db['user'];
const Friend = db['friend'];


export default class FriendHelper {
    create = async ({sender, receiver}) => {
        const iSender = await User.findOne({where: {email: sender}});
        const iReceiver = await User.findOne({where: {email: receiver}});
        const friendReq = await iSender.addFriend(iReceiver, {through: {sender, receiver}});
        return friendReq;
    };

    findAndConfirm = async ({sender, receiver}) => {
        const iSender = await User.findOne({where: {email: sender}, include: Friend});
        console.log(iSender);

    }
}
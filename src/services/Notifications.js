const Subscription = require('../models/sequelize/subscription');
const dotenv = require('dotenv');

dotenv.config();

const webPush = require('web-push');

const vapidKeys = {
    publicKey: process.env.NOTIFICATIONS_PUBLIC_KEY,
    privateKey: process.env.NOTIFICATIONS_PRIVATE_KEY
};

webPush.setVapidDetails(
    'https://apexenj.com/', // Contact for example purposes only
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const sendNotification = async (subscription, payload) => {
    try {
        await webPush.sendNotification(subscription, payload);
    } catch (error) {
        console.error('Error sending notification', error);
    }
};

const sendContestUpdateNotificationToUser = async (userPublicId, contestId) => {
    const subscription = await Subscription.findOne({
        where: {
            user_public_id: userPublicId
        }
    })
    if (subscription) {
        sendNotification(
            {
                endpoint: subscription.endpoint,
                expirationTime: null,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth
                }
            },
            JSON.stringify({
                title: `Your organism was beaten!`,
                body: `The organism you entered in ${contestId} has sadly died. Go check out what happened!`,
                url: `https://play.apexenj.com/${contestId}`,
                actions: [
                    {
                        action: 'open_url',
                        title: 'Open'
                    }
                ]
            })
        )
    } else {
        console.log("User has no Notification Subscription")
    }
}

module.exports = { sendContestUpdateNotificationToUser }
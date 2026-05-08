import Subscription from '../models/subscription.js';
import User from '../models/user.js';


export const getUserDetails = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // get the subscription details and send the active or upcoming subscription
        const subscription = await Subscription.findOne({ user: userId, status: { $in: ["Active", "Upcoming"] } });
        res.status(200).json({ user, subscription });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}   


export const getUserSubscriptions = async (req, res) => {
    try {
        const userMail = req.body.email;
        const user = await User.findOne({ email: userMail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // get the userId using userMail
        const userId = user._id;

        // get all subscription details for the user
        const subscriptions = await Subscription.find({ user: userId });
        res.status(200).json({ subscriptions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

import User from "../models/user.js";

// Get members with birthdays in the current month
export const getBirthdaysThisMonth = async (req, res) => {
    try {
        const gymId = req.user.gym_id;
        const now = new Date();
        // normalize to start of day to avoid partial-day issues
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 30);

        const users = await User.find({ gym_id: gymId })
            .populate({ path: 'subscriptions', options: { sort: { start_date: -1 } } })
            .lean();


        const upcomingWithin30Days = users
            .filter(u => u.dob) // ensure dob exists
            .map(u => {
                const dob = new Date(u.dob);
                const month = dob.getMonth();
                const day = dob.getDate();

                // compute next birthday (this year or next)
                let nextBirthday = new Date(today.getFullYear(), month, day);
                nextBirthday.setHours(0, 0, 0, 0);
                if (nextBirthday < today) {
                    nextBirthday = new Date(today.getFullYear() + 1, month, day);
                    nextBirthday.setHours(0, 0, 0, 0);
                }

                const diffMs = nextBirthday - today;
                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)); // whole days

                return {
                    ...u,
                    _nextBirthday: nextBirthday,
                    _diffDays: diffDays
                };
            })
            .filter(u => u._diffDays >= 0 && u._diffDays <= 30)
            .sort((a, b) => a._diffDays - b._diffDays) // soonest first
            .map(({ _nextBirthday, _diffDays, ...rest }) => rest);

        const totalCount = upcomingWithin30Days.length;

        return res.status(200).json({ success: true, birthdayMembers: upcomingWithin30Days, totalCount });
    } catch (err) {
        console.error('Get upcoming birthdays (30 days) error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
const userModel = require('../models/userModel');

const updateUser = async (req, res, next) => {
    try {
        const userId = Number(req.params.user_id);

        if (userId !== req.session.user_id) {
            return res.status(403).send({ message: 'You can only update your own account.' });
        }

        const { password } = req.body;
        if (!password) {
            return res.status(400).send({ message: 'Password is required.' });
        }

        const user = await userModel.update(userId, password);
        if (!user) return res.status(404).send({ message: 'User not found.' });
        res.send(user);
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const userId = Number(req.params.user_id);

        if (userId !== req.session.user_id) {
            return res.status(403).send({ message: 'You can only delete your own account.' });
        }

        const user = await userModel.destroy(userId);
        if (!user) return res.status(404).send({ message: 'User not found.' });
        res.send(user);
    } catch (err) {
        next(err);
    }
};

module.exports = { updateUser, deleteUser };
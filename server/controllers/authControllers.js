const userModel = require('../models/userModel');

const register = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ error: 'Username and password are required.' });
        }

        const existingUser = await userModel.findByUsername(username);
        if (existingUser) {
            return res.status(409).send({ message: 'Username already taken' });
        }

        const user = await userModel.create(username, password);
        req.session.user_id = user.user_id;
        res.status(201).send(user);
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await userModel.validatePassword(username, password);
        if (!user) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        req.session.user_id = user.user_id;
        res.send(user);
    } catch (err) {
        next(err);
    }
};

const getMe = async (req, res, next) => {
    try {
        const { user_id } = req.session;
        if (!user_id) return res.status(401).send(null);
        const user = await userModel.find(user_id);
        if (!user) return res.status(401).send(null);
        res.send(user);
    } catch (err) {
        next(err);
    }
};

const logout = (req, res) => {
    req.session = null;
    res.send({ message: 'Logged out.' });
};

module.exports = { register, login, getMe, logout };
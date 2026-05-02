const rsvpModel = require('../models/rsvpModel');

const createRsvp = async (req, res, next) => {
    try {
        const eventId = Number(req.params.event_id);
        const rsvp = await rsvpModel.create(req.session.user_id, eventId);
        res.status(201).send(rsvp);
    } catch (err) {
        next(err);
    }
};

const deleteRsvp = async (req, res, next) => {
    try {
        const eventId = Number(req.params.event_id);
        const rsvp = await rsvpModel.destroy(req.session.user_id, eventId);
        res.send(rsvp);
    } catch (err) {
        next(err);
    }
};

const listUserRsvps = async (req, res, next) => {
    try {
        const userId = Number(req.params.user_id);
        const rsvps = await rsvpModel.listByUser(userId);
        res.send(rsvps);
    } catch (err) {
        next(err);
    }
};

module.exports = { createRsvp, deleteRsvp, listUserRsvps };
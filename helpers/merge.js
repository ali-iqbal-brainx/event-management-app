const Event = require('../models/event');
const User = require('../models/user');
const { dateToString } = require('../helpers/date');

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        creator: getUser.bind(this, event._doc.creator),
        date: dateToString(event._doc.date),
    }
}

const transformUser = user => {
    return {
        ...user._doc,
        password: null,
        _id: user?.id
    }
}

const transformBooking = (booking) => {
    return {
        ...booking._doc,
        _id: booking.id,
        user: getUser.bind(this, booking._doc.user),
        event: getEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt),
    };
}

const getUser = async (userId) => {
    try {
        const user = await User.findById(userId);
        return { ...user._doc, _id: user.id, password: null }
    } catch (err) {
        throw err;
    }
}

const getEvent = async (eventId) => {
    try {
        const event = await Event.findById(eventId);
        return transformEvent(event);
    } catch (err) {
        throw err;
    }
}


module.exports = {
    getUser,
    getEvent,
    transformEvent,
    transformBooking,
    transformUser
}


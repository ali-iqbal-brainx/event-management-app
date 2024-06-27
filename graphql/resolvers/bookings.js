const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformBooking, transformEvent } = require('../../helpers/merge');
const mongoose = require('mongoose');

module.exports = {
    bookings: async (args, request) => {
        try {
            const user = request.user;
            if (!request?.isAuth) {
                throw new Error(request?.message);
            }

            const bookings = await Booking.find({ user: user?._id });
            return bookings.map(booking => {
                return transformBooking(booking);
            })
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async (args, request) => {
        try {
            const user = request.user;
            if (!request?.isAuth) {
                throw new Error(request?.message);
            }

            const fetchedEvent = await Event.findOne({ _id: args.eventId });
            if (!fetchedEvent) {
                throw new Error('Invalid Event Id');
            }
            const booking = new Booking({
                user: user?._id,
                event: fetchedEvent?._id
            });

            const result = await booking.save();
            return transformBooking(result);
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async (args, request) => {
        try {
            if (!request?.isAuth) {
                throw new Error(request?.message);
            }

            const booking = await Booking.findOne({ _id: args.bookingId }).populate('event');
            if (!booking) {
                throw new Error('Invalid Booking Id');
            }

            await Booking.deleteOne({ _id: args.bookingId });
            return transformEvent(booking.event)

        } catch (err) {
            throw err;
        }
    }
};
const Event = require('../../models/event');
const { dateToString } = require('../../helpers/date');
const { transformEvent } = require('../../helpers/merge');

module.exports = {
    events: async (args, request) => {
        try {
            if (!request?.isAuth) {
                throw new Error(request?.message);
            }
            let events = await Event.find();
            return events.map(event => {
                return transformEvent(event);
            });
        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args, request) => {
        try {
            if (!request?.isAuth) {
                throw new Error(request?.message);
            }
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: dateToString(args.eventInput.date),
                creator: "666946172deb262234c07240"
            });

            const result = await event.save();
            return transformEvent(result);
        } catch (err) {
            throw err;
        }
    }
};
const Joi = require('joi');


module.exports.listingSchema = Joi.object({
    listing: Joi.object().required({
        title: Joi.string().required(),
        descriptiom: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("",null)
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required()
});

module.exports.bookingSchema = Joi.object({
    booking: Joi.object({
        checkIn: Joi.date().required(),
        checkOut: Joi.date().required().greater(Joi.ref('checkIn')),
        guests: Joi.number().required().min(1)
    }).required()
});
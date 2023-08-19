const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* Important Comment 
	if you want a two unique fields you need to do it on fresh schema,

	or
	
	delete the existing duplicates for it to work 
*/

const isValidNenType = (val) => {
	let valid = true;
	const nen_types = [
		'enhancement',
		'manipulation',
		'emission',
		'specialization',
		'conjuration',
		'transmutation',
		'unknown',
	];

	val.forEach((item) => {
		item = item.toLowerCase();
		if (!nen_types.includes(item)) {
			valid = false;
		}
	});

	return valid;
};

const characterSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			unique: [true, 'Name already exist'],
			lowercase: true,
			trim: true,
		},
		also_known_as: {
			type: Array,
		},
		gender: {
			type: String,
			enum: ['male', 'female'],
			required: [true, 'Gender is required'],
		},
		nen_type: {
			type: Array,
			validate: [isValidNenType, 'Nen-type is not valid'],
		},
		image: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Image',
			},
		],
		images: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Image',
			},
		],
		abilities: {
			type: Array,
		},
		japanese_name: {
			type: String,
		},
		groups: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Group',
			},
		],
		professions: {
			type: [String],
			validate: [
				(v) => Array.isArray(v) && v.length > 0,
				'Professions is required',
			],
		},
		state: {
			type: String,
			enum: ['alive', 'deceased'],
			required: [true, 'State is required'],
		},
		relatives: [
			{
				relative: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Character',
				},
				relationship: String,
			},
		],
		details: {
			type: String,
		},
		hunter_star: {
			type: Number,
		},
		family: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Family',
		},
	},
	{ timestamps: true },
);
module.exports = mongoose.model('Character', characterSchema);

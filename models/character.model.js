import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/* Important Comment 
	if you want a two unique fields you need to create the schema fields
	on the same time,

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
			trim: true
		},
		also_known_as: {
			type: Array,
		},
		gender: {
			type: String,
			required: [true, 'Gender is required'],
		},
		nen_type: {
			type: Array,
			validate: [isValidNenType, 'Nen-type is not valid'],
		},
		image: {
			public_id: String,
			secure_url: String,
			width: Number,
			height: Number,
		},
		abilities: {
			type: Array,
		},
		japanese_name: {
			type: String,
		},
		affiliations: [
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
		descriptions: {
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

export default mongoose.model('Character', characterSchema);

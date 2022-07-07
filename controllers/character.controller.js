import Character from '../models/character.model.js';
import cloudinary from '../utils/cloudinary.js';
import factory from '../utils/contollersFactory.js';
import AppError from '../utils/appError.js';

const index = factory.index(
	Character,
	{
		path: 'relatives.relative',
		select: 'name',
	},
	{
		path: 'affiliations',
		select: 'name',
	},
);

const store = factory.store(Character, true);

const show = factory.show(
	Character,
	{
		path: 'relatives.relative',
		select: 'name',
	},
	{
		path: 'affiliations',
		select: 'name',
	},
);
const update = factory.update(Character, true);

const destroy = factory.destroy(Character);

export { index, store, show, destroy, update };

import Group from '../models/group.model.js';
import cloudinary from '../utils/cloudinary.js';
import factory from '../utils/contollersFactory.js';
import AppError from '../utils/appError.js';

const index = factory.index(Group, {
	path: 'leaders.leader',
	select: 'name',
});

const store = factory.store(Group, true);

const show = factory.show(Group, {
	path: 'leaders.leader',
	select: 'name',
});
const update = factory.update(Group, true);

const destroy = factory.destroy(Group);

export { index, store, show, destroy, update };

const Model = require('../models/GroupModel.js');
const BaseService = require('./BaseService');

class GroupService extends BaseService {
	Model;
	static className = 'GroupService';
	constructor() {
		super(Model);

		this.Model = Model;
		this.with_relation = true;
		this.relations = [
			{
				path: 'leaders',
				select: 'name',
			},
			{
				path: 'image',
				select: ['public_id', 'secure_url', 'height', 'width'],
			},
		];
	}
}

module.exports = GroupService;

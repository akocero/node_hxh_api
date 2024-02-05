const Model = require('../models/CharacterModel.js');
const BaseService = require('./BaseService');

class CharacterService extends BaseService {
	Model;
	static className = 'CharacterService';
	constructor() {
		super(Model);

		this.Model = Model;
		this.with_relation = true;
		this.relations = [
			{
				path: 'groups',
				select: 'name',
			},
			{
				path: 'image',
				select: ['public_id', 'secure_url', 'height', 'width'],
			},
		];
	}
}

module.exports = CharacterService;

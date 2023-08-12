const Model = require('../models/CharacterModel.js');
const BaseService = require('./BaseService');

class CharacterService extends BaseService {
	Model;
	static className = 'CharacterService';
	constructor() {
		super(Model);

		this.Model = Model;
		this.with_relation = false;
		this.relations = {};
	}
}

module.exports = CharacterService;

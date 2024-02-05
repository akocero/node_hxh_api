const Model = require('../models/CollectionModel.js');
const BaseService = require('./BaseService');

class CollectionService extends BaseService {
	static className = 'CollectionService';
	constructor() {
		super(Model);

		this.Model = Model;
		this.with_relation = true;
		this.relations = ['coverPhoto', 'shopBanner'];
	}
}

module.exports = CollectionService;

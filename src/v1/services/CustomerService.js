const Model = require('../models/CustomerModel.js');
const BaseService = require('./BaseService');

class CustomerService extends BaseService {
	Model;
	static className = 'CustomerService';
	constructor() {
		super(Model);

		this.Model = Model;
		this.with_relation = false;
		this.relations = {};
	}
}

module.exports = CustomerService;

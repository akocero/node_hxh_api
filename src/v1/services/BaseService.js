/**
 * @file base_service.js
 * @brief This is the base service where all the other services inherit the base functionality
 * @author Eugene Paul Badato
 */

const MongoQueryBuilder = require('../utils/MongoQueryBuilder.js');
const PaginationHelper = require('../helpers/PaginationHelper.js');

class BaseService {
	static className = 'BaseService';
	constructor(Model) {
		this.Model = Model;
		this.MongoQueryBuilder = MongoQueryBuilder;
		this.PagnationHelper = PaginationHelper;
	}

	/**
	 * execute the query and check if it has a relation
	 * @param {*} id
	 * @returns boolean
	 */
	async execute(query) {
		let data;

		if (this.with_relation) {
			data = await query.populate(this.relations);
		} else {
			data = await query;
		}

		return data;
	}

	/**
	 * Reads all the entries in the table
	 * Returns an array of models
	 * @returns rows
	 */
	async readAll() {
		const query = this.Model.find();
		const data = await this.execute(query);

		return data;
	}

	/**
	 * Reads all the entries in the table
	 * Returns an array of models
	 * @returns rows
	 */
	async readAllCustom(queryString) {
		let data;
		let query = new this.MongoQueryBuilder(this.Model.find(), queryString)
			.filter()
			.sort()
			.limitFields()
			.paginate();

		data = await this.execute(query.query);

		if (queryString.page) {
			const pagination_helper = new this.PagnationHelper(
				this.Model,
				data,
				query,
			);

			data = await pagination_helper.paginateData();
		}

		return data;
	}

	/**
	 * Returns the newly inserted row (ARRAY) if successful
	 * @param {*} modelObject
	 * @returns
	 */
	async create(payload) {
		const data = await this.Model.create({
			...payload,
		});

		return data;
	}

	/**
	 * Reads a row by the id
	 * @param {*} id
	 * @returns Array of rows or null
	 */
	async readById(id) {
		let data;
		const query = await this.Model.findById(id);

		data = await this.execute(query);

		if (!data) {
			return false;
		}

		return data;
	}

	/**
	 * Reads random data
	 * @param {*}
	 * @returns Object of data
	 */
	async readRandom() {
		let data;

		const total_data_count = await this.Model.estimatedDocumentCount();

		var random = Math.floor(Math.random() * total_data_count);

		const query = this.Model.findOne().skip(random);
		data = await this.execute(query);

		if (!data) {
			return false;
		}

		return data;
	}

	/**
	 * Update the given row with the given id
	 * @param {*} id
	 * @param {*} modelObject
	 * @returns true or false
	 */
	async update(id, payload) {
		let data;
		const query = this.Model.findByIdAndUpdate(id, payload, {
			new: true,
			runValidators: true,
		});

		data = await this.execute(query);

		if (!data) {
			return false;
		}

		return data;
	}

	/**
	 * Delete a row with the given id
	 * @param {*} id
	 * @returns boolean
	 */
	async delete(id) {
		const data = await this.Model.findByIdAndDelete(id);

		if (!data) {
			return false;
		}
		return true;
	}
}

module.exports = BaseService;

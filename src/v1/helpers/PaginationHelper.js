/**
 * @file PaginationHelper.js
 * @brief this will paginate and construct the response
 *  Note: you can use this class to paginate any data
 * @author Eugene Paul Badato
 */

class PaginationHelper {
	constructor(Model, data, query) {
		this.Model = Model;
		this.data = data;
		this.query = query;
		this.current_page = parseInt(query.queryString.page) || 1;
		this.page_size = parseInt(query.query.options.limit) || 10;
		this.total_data_count = 0;
	}

	async paginateData() {
		// load and store the possible data that you will fetch base on the query
		await this.getTotalDataCount();
		// build response
		return this.buildResponse();
	}

	async getTotalDataCount() {
		// check if the users filters the data or there's a filter string given
		// if yes count the data base on the filter
		if (this.query.filter_string) {
			this.total_data_count = await this.Model.countDocuments(
				_query.filter_string,
			);
		} else {
			this.total_data_count = await this.Model.estimatedDocumentCount();
		}

		return;
	}

	buildResponse() {
		let next_page = this.current_page + 1;
		let previous_page = this.current_page - 1;
		let results = this.data.length;
		// this.query.query.options.skip = the document or data that you skip reading/fetching from db
		// + 1 for user viewers becase in programming 0 is the first
		const from = this.query.query.options.skip + 1;
		let to = from + this.page_size - 1;

		// compute lastpage and round off
		const last_page = Math.ceil(this.total_data_count / this.page_size);

		if (next_page > last_page) {
			next_page = null;
		}

		if (previous_page <= 0) {
			previous_page = null;
		}

		if (to > this.total_data_count) {
			to = this.total_data_count;
		}

		return {
			_paginate: {
				results,
				total: this.total_data_count,
				from,
				to,
				page_size: this.page_size,
				current_page: this.current_page,
				next_page,
				previous_page,
				last_page,
			},
			data: this.data,
		};
	}
}

module.exports = PaginationHelper;

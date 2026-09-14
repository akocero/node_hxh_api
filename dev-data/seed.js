/**
 * HxH API Seed Script
 *
 * IMPORTANT: This script connects to whatever MONGODB_URI is in your .env file.
 * If you are running against production, double-check before running --import or --delete.
 *
 * Usage:
 *   node dev-data/seed.js --import   → insert groups + characters from data/ files
 *   node dev-data/seed.js --delete   → delete ALL characters and groups
 *
 * The data/ folder is gitignored. JSON files inside it use group names as strings.
 * This script resolves those names to MongoDB ObjectIds automatically.
 *
 * Character files are loaded in order: characters_1.json … characters_6.json
 * Each file holds 10 characters (last file may have fewer).
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const Character = require('../src/v1/models/CharacterModel');
const Group = require('../src/v1/models/GroupModel');

const DATA_DIR = path.join(__dirname, 'data');

const connectDB = async () => {
	const conn = await mongoose.connect(process.env.MONGODB_URI);
	console.log(`Connected to: ${conn.connection.host}`);
};

const loadJSON = (filename) => {
	const filepath = path.join(DATA_DIR, filename);
	return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
};

const importData = async () => {
	const groupsData = loadJSON('groups.json');

	const existingGroups = await Group.find().select('name');
	const existingGroupNames = existingGroups.map((g) => g.name.toLowerCase());
	const newGroups = groupsData.filter(
		(g) => !existingGroupNames.includes(g.name.toLowerCase()),
	);

	if (newGroups.length > 0) {
		await Group.insertMany(newGroups);
		console.log(`Inserted ${newGroups.length} new group(s).`);
	} else {
		console.log('No new groups to insert (all already exist).');
	}

	const allGroups = await Group.find().select('name _id');
	const groupMap = {};
	allGroups.forEach((g) => {
		groupMap[g.name.toLowerCase()] = g._id;
	});

	const characterFiles = fs
		.readdirSync(DATA_DIR)
		.filter((f) => f.startsWith('characters_') && f.endsWith('.json'))
		.sort();

	let totalInserted = 0;
	let totalSkipped = 0;

	for (const file of characterFiles) {
		const rawChars = loadJSON(file);

		const resolved = rawChars.map((char) => ({
			...char,
			groups: (char.groups || [])
				.map((name) => groupMap[name.toLowerCase()])
				.filter(Boolean),
		}));

		for (const char of resolved) {
			const exists = await Character.findOne({
				name: char.name.toLowerCase(),
			});
			if (exists) {
				console.log(`  Skipped (already exists): ${char.name}`);
				totalSkipped++;
				continue;
			}
			await Character.create(char);
			console.log(`  Inserted: ${char.name}`);
			totalInserted++;
		}
	}

	console.log(
		`\nDone. Inserted: ${totalInserted} | Skipped: ${totalSkipped}`,
	);
	process.exit(0);
};

const deleteData = async () => {
	console.log('Deleting all characters and groups...');
	await Character.deleteMany();
	await Group.deleteMany();
	console.log('Done.');
	process.exit(0);
};

(async () => {
	const action = process.argv[2];
	if (!action || (action !== '--import' && action !== '--delete')) {
		console.log(
			'Usage: node dev-data/seed.js --import | --delete',
		);
		process.exit(1);
	}

	await connectDB();

	if (action === '--import') await importData();
	if (action === '--delete') await deleteData();
})();

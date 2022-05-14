import express, { json, urlencoded } from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
const port = process.env.PORT || 5000;
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
// routes
import characterRoutes from './routes/character.routes.js';
import userRoutes from './routes/user.routes.js';
import familyRoutes from './routes/family.routes.js';
import groupRoutes from './routes/group.routes.js';

connectDB();

const app = express();
app.use(cors());

app.get('/', (req, res, next) => {
	res.redirect('https://hxh-api.vercel.app/');
});

app.use(json());
app.use(urlencoded({ extended: false }));

app.use('/api/characters', characterRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/groups', groupRoutes);

app.use((req, res, next) => {
	const error = new Error('Not Found');
	error.status = 404;
	next(error);
});

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));

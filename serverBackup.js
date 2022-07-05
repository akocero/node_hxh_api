import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import connectDB from './config/db.js';
import cors from 'cors';
import { errorHandler } from './middlewares/globalErrorHandler.js';
// routes
import characterRoutes from './routes/character.routes.js';
import userRoutes from './routes/user.routes.js';
import familyRoutes from './routes/family.routes.js';
import groupRoutes from './routes/group.routes.js';
import templateRoutes from './routes/template.routes.js';
import orderRoutes from './routes/order.routes.js';
import customerRoutes from './routes/customer.routes.js';
import AppError from './utils/appError.js';

connectDB();

const app = express();
app.use(cors());

// if (process.env.NODE_ENV === 'development') {
// 	app.use(morgan('dev'));
// }

app.use(morgan('dev'));

app.get('/', (req, res, next) => {
	res.redirect('https://hxh-api.vercel.app/');
});

app.use(json());
app.use(urlencoded({ extended: false }));

app.use('/api/characters', characterRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/templates', templateRoutes);

app.use((req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));

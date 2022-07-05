import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import cors from 'cors';

// routes
import characterRouter from './routes/character.routes.js';
import userRouter from './routes/user.routes.js';
import familyRouter from './routes/family.routes.js';
import groupRouter from './routes/group.routes.js';
import templateRouter from './routes/template.routes.js';
import orderRouter from './routes/order.routes.js';
import customerRouter from './routes/customer.routes.js';

// middlewares / utilities
import AppError from './utils/appError.js';
import globalErrorHandler from './middlewares/globalErrorHandler.js';

const app = express();

app.use(cors());

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

app.get('/', (req, res, next) => {
	res.redirect('https://hxh-api.vercel.app/');
});

app.use(json());
app.use(urlencoded({ extended: false }));

app.use('/api/v1/characters', characterRouter);
app.use('/api/v1/auth', userRouter);
app.use('/api/v1/families', familyRouter);
app.use('/api/v1/groups', groupRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/templates', templateRouter);

app.use((req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;

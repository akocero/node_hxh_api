import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// routes
import characterRouter from './routes/character.routes.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import familyRouter from './routes/family.routes.js';
import groupRouter from './routes/group.routes.js';

// middlewares / utilities
import AppError from './utils/appError.js';
import globalErrorHandler from './middlewares/globalErrorHandler.js';

const app = express();

app.use(cookieParser());

app.use(cors());

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

app.get('/', (req, res, next) => {
	res.redirect('https://hxh-api.vercel.app/');
});

app.use(json());
app.use(urlencoded({ extended: false }));

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	console.log('cookie', req.cookies);
	next();
});

app.use('/api/v1/characters', characterRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/families', familyRouter);
app.use('/api/v1/groups', groupRouter);

app.use((req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});	

app.use(globalErrorHandler);

export default app;

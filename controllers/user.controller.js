import User from '../models/user.model.js';
import factory from '../utils/contollersFactory.js';

const index = factory.index(User);

export { index };

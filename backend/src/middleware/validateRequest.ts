import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

const validateRequest: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  next();
};

export default validateRequest;

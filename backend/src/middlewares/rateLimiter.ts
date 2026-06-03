import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const appointmentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Muitas requisições. Tente novamente em 1 minuto.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   
  max: 5,
  message: "Too many attempts. Try again after 15 min.",
  standardHeaders: true,
  legacyHeaders: false
})

const transactionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many transactions. Try again after 1 min.",
  standardHeaders: true,
  legacyHeaders: false
})

export {authLimiter,transactionLimiter}
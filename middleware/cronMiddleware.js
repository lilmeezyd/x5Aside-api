export const cronAuth = (req, res, next) => {
  const key = req.headers['x_cron_key'];
  
  if (key !== process.env.CRON_SECRET) {
    return res.status(403).json({ message: 'Forbidden: Invalid cron key' });
  }
  next();
};

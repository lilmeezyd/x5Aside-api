const allowedDbs = ['X5Aside', 'app5Aside'];

const validateDbName = (req, res, next) => {
  const dbName = req.query.dbName || req.body.dbName;
if (!dbName || !allowedDbs.includes(dbName)) {
    return res.status(403).json({ message: "Invalid database name" });
  
  }
  req.dbName = dbName; // Attach validated dbName to request
  next();
};

export { validateDbName }

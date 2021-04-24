module.exports = async (req, res) => {
  console.log(req.query.a);
  res.status(200);
};
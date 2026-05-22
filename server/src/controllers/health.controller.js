const checkHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "RND AI Agent backend is running",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  checkHealth,
};
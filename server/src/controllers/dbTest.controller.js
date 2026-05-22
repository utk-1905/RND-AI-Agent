const supabase = require("../config/supabase");

const testDatabaseConnection = async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        message: "Supabase client is not initialized. Check your .env values.",
      });
    }

    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .limit(5);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Database connected successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error",
      error: error.message,
    });
  }
};

module.exports = {
  testDatabaseConnection,
};
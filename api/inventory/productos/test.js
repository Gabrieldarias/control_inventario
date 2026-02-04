export default async function handler(req, res) {
  try {
    // Test básico sin Supabase
    res.status(200).json({ 
      message: 'Test endpoint works',
      method: req.method,
      query: req.query
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}

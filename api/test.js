export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const diagnostics = {
    env_vars: {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_KEY: process.env.SUPABASE_KEY ? 'SET' : 'NOT SET',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
    },
    node_version: process.version,
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(diagnostics);
}

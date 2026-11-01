export default function handler(req, res) {
  const data = JSON.stringify({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });

  if (res && typeof res.setHeader === 'function') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(data);
    return;
  }

  return new Response(data, {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

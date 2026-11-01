export default function handler(req, res) {
  res.status(200).json({
    name: 'url-to-md-converter API',
    endpoints: ['/api/convert', '/api/convert-html', '/api/health']
  });
}

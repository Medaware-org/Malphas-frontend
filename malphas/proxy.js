import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Create an Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Set up the proxy to forward all requests to your backend server
const backendUrl = 'http://localhost:1234';  // Replace with your backend URL

app.use('/', createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/': '',  // Removes the leading '/' when forwarding to the backend
  },
  onProxyReq: (proxyReq, req, res) => {
    // Optional: Add any custom headers or modify the request before sending to the backend
    proxyReq.setHeader('X-Added-Header', 'value');
  },
}));

// Start the server
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/storage',  // Ruta de destino en tu aplicación React para las solicitudes de Firebase Storage
    createProxyMiddleware({
      target: 'https://firebasestorage.googleapis.com',
      changeOrigin: true,
      pathRewrite: {
        '^/storage': '',  // Eliminar '/storage' de la ruta de la solicitud
      },
    })
  );
};

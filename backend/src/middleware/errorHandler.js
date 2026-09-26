export const errorHandler = (err, req, res, next) => {
  console.error('❌ Internal Application Error:', err.message);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'Uploaded file size exceeds the maximum limit of 15MB.'
    });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected internal error occurred on the server.'
  });
};

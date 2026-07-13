export const success = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, ...data });
};

export const error = (res, message = 'Server Error', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

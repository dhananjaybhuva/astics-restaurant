exports.HTTP_CODE = {
  SUCCESS: true,
  FAILED: false,
  SUCCESS_CODE: 200,
  SERVER_ERROR_CODE: 500,
  BAD_REQUEST_CODE: 400,
  RESOURCE_CREATED_CODE: 201,
  UNAUTHORIZED_CODE: 401,
  UNPROCESSABLE_ENTITY: 422,
  UNSUPPORTED_MEDIA_TYPE: 415
};

exports.DATABASE_VALIDATION = {
  UNIQUE_CONSTRAINTS_VIOLATION: '23505',
};

exports.WHITELISTED_URLS = [
  'https://localhost:2023',
];
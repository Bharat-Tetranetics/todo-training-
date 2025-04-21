
const ErrorMessage={
  "sessionError": {
    "English": "Session has expired! Please login again",
    "Hindi": "सत्र समाप्त हो चुका है! कृपया फिर भाग लें",
    "ErrorCode":401
  },
  "AuthError":{
    "English": "Invalid credentials!",
    "Hindi": "अवैध क्रेडेन्शियल!",
    "ErrorCode":409
  },
  "ServerError":{
    "English": "Internal server error!",
    "Hindi": "अंतर्गत सर्व्हर त्रुटी!",
    "ErrorCode":403
  },
  "ValidationError":{
      "ErrorCode": 400,
      "English": "Validation failed. Required fields are missing or incorrect.",
      "Hindi": "वैलिडेशन विफल रहा। आवश्यक फ़ील्ड गायब हैं या गलत हैं।"
  },
  "NotFoundError": {
     "ErrorCode": 404,
     "English": "The requested item was not found.",
     "Hindi": "अनुरोधित आइटम नहीं मिला।"
}
}

module.exports = Object.freeze({
  'ErrorMessage': ErrorMessage
});

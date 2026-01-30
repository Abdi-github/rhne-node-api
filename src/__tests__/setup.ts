// Set test env before anything loads (runs via setupFiles — before Jest globals)
process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = "test-access-secret-key-12345";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key-12345";
process.env.MONGODB_URI = "mongodb://admin:password@localhost:27017/rhne_test?authSource=admin";
process.env.REDIS_HOST = "localhost";
process.env.REDIS_PORT = "6379";
process.env.REDIS_PASSWORD = "";
process.env.CORS_ORIGIN = "*";
process.env.MAIL_HOST = "localhost";
process.env.MAIL_PORT = "1025";
process.env.MAIL_FROM = "test@rhne-clone.ch";
process.env.RATE_LIMIT_WINDOW_MS = "900000";
process.env.RATE_LIMIT_MAX = "1000";

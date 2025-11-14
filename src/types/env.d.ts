declare namespace NodeJS {
  interface ProcessEnv {
    // API URLs
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_API_BASE_URL?: string;
    BASE_API?: string;
    
    // Database
    DATABASE_URL?: string;
    
    // AWS Configuration
    AWS_REGION?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_SQS_EMAIL_QUEUE_URL?: string;
    AWS_SES_CONFIGURATION_SET?: string;
    
    // Email Configuration
    EMAIL_TO?: string;
    EMAIL_FROM?: string;
    
    // NextAuth Configuration
    NEXTAUTH_SECRET?: string;
    NEXTAUTH_URL?: string;
    
    // External Services
    NEXT_PUBLIC_IPAPI_KEY?: string;
    NEXT_PUBLIC_CLOUDFRONT_S3_CAN_DOMAIN?: string;
    
    // Environment
    NODE_ENV?: "development" | "production" | "test";
  }
} 
export const PAYPAL_LIVE_CONFIG = {
  "client-id": process.env.NEXT_PUBLIC_PAYPAL_LIVE_API_KEY!,
  currency: "USD",
  intent: "capture",
  secret: process.env.PAYPAL_LIVE_SECRET,
  url: process.env.PAYPAL_LIVE_URL,
  region: process.env.PAYPAL_LIVE_REGION,
  username: process.env.PAYPAL_LIVE_USERNAME,
  password: process.env.PAYPAL_LIVE_PASSWORD,
  components: "buttons,funding-eligibility",
  "enable-funding": "venmo,card",
  "disable-funding": "",
};

export const PAYPAL_SANDBOX_CONFIG = {
  "client-id": process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_API_KEY!,
  currency: "USD",
  intent: "capture",
  secret: process.env.PAYPAL_SANDBOX_SECRET,
  url: process.env.PAYPAL_SANDBOX_URL,
  region: process.env.PAYPAL_SANDBOX_REGION,
  username: process.env.PAYPAL_SANDBOX_USERNAME,
  password: process.env.PAYPAL_SANDBOX_PASSWORD,
  components: "buttons,funding-eligibility",
  "enable-funding": "venmo,card",
  "disable-funding": "",
};

export const getPayPalConfig = () => {
  if (process.env.NODE_ENV === "production") {
    return PAYPAL_LIVE_CONFIG;
  }
  return PAYPAL_SANDBOX_CONFIG;
};

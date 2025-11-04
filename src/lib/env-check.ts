// Environment validation for NextAuth
console.log("=== NextAuth Environment Check ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "NOT SET");
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET");
console.log("================================");

export {};
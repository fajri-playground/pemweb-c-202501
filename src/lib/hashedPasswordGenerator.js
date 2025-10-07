const crypto = require("crypto");

const passwords = ["Admin@123", "User@456", "Test@789"];

passwords.forEach((pwd) => {
  const hash = crypto.createHash("sha256").update(pwd).digest("hex");
  console.log(`Password : ${pwd}`);
  console.log(`SHA-256  : ${hash}`);
  console.log("---------------");
});

const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const encryptedKey = await wallet.encrypt(
    process.env.PRIVATE_KEY_PASSWORD,
    (progress) => {
      console.log(progress);
    }
  );
  console.log("Encrypted key:", encryptedKey);
  fs.writeFileSync("./encryptedKey.json", encryptedKey);
  console.log("Encrypted key saved to encryptedKey.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

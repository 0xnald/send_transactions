const ethers = require('ethers');
const inquirer = require('inquirer').default;

// Function to get user input
async function getUserInput() {
  try {
    // Prompt the user for RPC URL
    const rpcUrl = await inquirer.prompt({
      type: 'input',
      name: 'rpcUrl',
      message: 'Enter RPC URL:',
      default: 'https://api.trongrid.io'
    });

    // Prompt the user for private key
    const privateKey = await inquirer.prompt({
      type: 'password',
      name: 'privateKey',
      message: 'Enter private key:',
      mask: '*'
    });

    // Prompt the user for number of transactions
    const numTransactions = await inquirer.prompt({
      type: 'number',
      name: 'numTransactions',
      message: 'Enter number of transactions:',
      default: 4 // assuming 4 transactions
    });

    // Prompt the user for number of recipients
    const numRecipients = await inquirer.prompt({
      type: 'number',
      name: 'numRecipients',
      message: 'Enter number of recipients:',
      default: 1
    });

    // Prompt the user to add recipient addresses
    const recipients = [];
    for (let i = 0; i < numRecipients; i++) {
      const recipient = await inquirer.prompt({
        type: 'input',
        name: 'recipient',
        message: `Enter recipient address ${i + 1}:`
      });
      recipients.push(recipient.recipient);
    }

    // Return the user input
    return {
      rpcUrl: rpcUrl.rpcUrl,
      privateKey: privateKey.privateKey,
      numTransactions: numTransactions.numTransactions,
      recipients: recipients
    };
  } catch (error) {
    console.error('Error getting user input:', error);
    process.exit(1);
  }
}

// Function to send transactions
async function sendTransactions(rpcUrl, privateKey, numTransactions, recipients) {
  try {
    // Create a provider instance
    const provider = ethers.getDefaultProvider(rpcUrl);

    // Create a wallet instance
    const wallet = new ethers.Wallet(privateKey, provider);

    // Define the transaction amounts and intervals
    const amounts = [0.001, 0.011, 0.004, 0.01];
    const intervals = [10, 30, 20, 15];

    // Send transactions
    for (let i = 0; i < numTransactions; i++) {
      for (let recipient of recipients) {
        const tx = await wallet.sendTransaction({
          to: recipient,
          value: ethers.utils.parseUnits(amounts[i].toString(), 18) // assuming 18 decimal places for TEA token
        });

        console.log(`Sent ${amounts[i]} TEA to ${recipient}. Tx Hash: ${tx.hash}`);

        // Wait for the transaction to be mined at the specified interval
        await new Promise(resolve => setTimeout(resolve, intervals[i] * 1000));

        // Wait for the transaction to be mined
        await tx.wait();
      }
    }

    console.log('All transactions sent successfully.');
  } catch (error) {
    console.error('Error sending transactions:', error);
    process.exit(1);
  }
}

// Run the script
async function run() {
  // Get user input
  const userInput = await getUserInput();

  // Send transactions
  await sendTransactions(userInput.rpcUrl, userInput.privateKey, userInput.numTransactions, userInput.recipients);
}

run();

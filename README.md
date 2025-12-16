# TON Account Status Inspector

A simple, beginner-friendly web tool to inspect TON (The Open Network) wallet and contract addresses.

## 📋 Project Overview

This tool allows you to enter any TON address (wallet or smart contract) and view:
- **Account Status**: Whether the account is active, uninitialized, or frozen
- **TON Balance**: Current balance in TON
- **Last Transaction**: Hash of the most recent transaction (if available)
- **Contract Type**: Whether it's a wallet or smart contract
- **Get Method Result**: Output from running a simple get method (for contracts)

## 🏗️ Project Structure

```
ton-account-inspector/
├── index.html      # Main HTML structure
├── main.js         # JavaScript logic and API calls
├── styles.css      # Styling for the UI
└── README.md       # This file
```

### File Descriptions

- **index.html**: Contains the HTML structure with:
  - Input field for TON address
  - Button to trigger inspection
  - Loading indicator
  - Error display area
  - Results display section

- **main.js**: Contains all the JavaScript logic:
  - `inspectAddress()`: Main function that orchestrates the inspection
  - `fetchAccountInfo()`: Fetches account data from TonAPI
  - `determineAccountStatus()`: Determines if account is active/uninit/frozen
  - `determineContractType()`: Identifies if address is wallet or contract
  - `runGetMethod()`: Executes a get method on contracts
  - `formatBalance()`: Converts nanotons to TON for display
  - UI helper functions for showing/hiding elements

- **styles.css**: Provides clean, modern styling with:
  - Responsive design
  - Loading animations
  - Color-coded status indicators
  - Mobile-friendly layout

## 🔌 API Endpoints Used

This project uses [TonAPI](https://tonapi.io/) public endpoints:

### 1. Get Account Information
```
GET https://tonapi.io/v2/accounts/{address}
```
Returns account state, balance, interfaces, and other metadata.

**Example Response:**
```json
{
  "address": "EQD...",
  "balance": "1000000000",
  "state": "active",
  "interfaces": ["wallet_v3r2"]
}
```

### 2. Get Account Transactions
```
GET https://tonapi.io/v2/accounts/{address}/transactions?limit=1
```
Returns the most recent transaction for the account.

**Example Response:**
```json
{
  "transactions": [
    {
      "hash": "abc123...",
      "lt": 1234567890,
      ...
    }
  ]
}
```

### 3. Run Get Method
```
POST https://tonapi.io/v2/accounts/{address}/methods/{method_name}
Body: {}
```
Executes a get method on a contract (read-only, no gas cost).

**Example:**
- Method: `seqno` (for wallets) or `get_data` (for contracts)
- Returns the method execution result

## 🚀 How to Run

### Option 1: Simple HTTP Server (Recommended)

1. **Navigate to the project directory:**
   ```bash
   cd ton-account-inspector
   ```

2. **Start a local server:**

   **Using Python 3:**
   ```bash
   python3 -m http.server 8000
   ```

   **Using Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Using Node.js (http-server):**
   ```bash
   npx http-server -p 8000
   ```

   **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

### Option 2: Open Directly (Limited)

You can open `index.html` directly in your browser, but some browsers may block API requests due to CORS. Using a local server is recommended.

## 📝 Usage

1. Open the application in your browser
2. Enter a TON address in the input field (format: `EQD...` or `0:...`)
3. Click "Inspect" or press Enter
4. View the account information displayed below

### Example Addresses to Test

- **Active Wallet**: `EQD__________________________________________0vo` (Testnet zero address)
- **Your Wallet**: Use your own TON wallet address
- **Smart Contract**: Any deployed TON smart contract address

## 🎓 Key Concepts Explained

### Account States

- **Active**: Account exists and has code/data. Can receive and send transactions.
- **Uninitialized**: Account address exists but hasn't been initialized yet. Can receive initial transactions.
- **Frozen**: Account is frozen (rare, usually due to validator issues).

### Contract Types

- **Wallet**: Standard TON wallet contracts (v1r1, v2r1, v3r1, v3r2, v4r1, v4r2, etc.)
- **Smart Contract**: Custom contracts with custom logic

### Get Methods

Get methods are read-only functions on smart contracts that don't cost gas. They're used to query contract state. Common examples:
- `seqno`: Returns sequence number (for wallets)
- `get_data`: Returns contract data
- `get_balance`: Returns contract balance

## 🔧 Optional Improvements

Here are some enhancements you could add (keep the core simple first!):

1. **Address Validation**: Add regex validation for TON address format
2. **Address Format Conversion**: Support both raw (`0:...`) and user-friendly (`EQD...`) formats
3. **Transaction History**: Show more than just the last transaction
4. **Contract Interface Detection**: Show which specific wallet version or contract interface
5. **Copy to Clipboard**: Add buttons to copy address, transaction hash, etc.
6. **Dark Mode**: Add a theme toggle
7. **Error Handling**: More detailed error messages for different failure cases
8. **Caching**: Cache results to avoid repeated API calls
9. **Multiple Addresses**: Support inspecting multiple addresses at once
10. **Export Results**: Download results as JSON

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors, make sure you're running a local server (not opening the file directly).

### API Rate Limits
TonAPI has rate limits. If you hit them, wait a moment and try again.

### Address Not Found
- Verify the address format is correct
- Check if you're using mainnet vs testnet addresses
- Some addresses may not exist yet

## 📚 Learning Resources

- [TON Documentation](https://docs.ton.org/)
- [TonAPI Documentation](https://tonapi.io/docs)
- [TON Address Format](https://docs.ton.org/learn/overviews/addresses)
- [TON Account States](https://docs.ton.org/learn/overviews/accounts)

## 📄 License

This is a learning project. Feel free to use and modify as needed.

---

**Happy Learning! 🚀**

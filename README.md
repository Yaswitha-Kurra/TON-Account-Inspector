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



## 📚 Learning Resources

- [TON Documentation](https://docs.ton.org/)
- [TonAPI Documentation](https://tonapi.io/docs)
- [TON Address Format](https://docs.ton.org/learn/overviews/addresses)
- [TON Account States](https://docs.ton.org/learn/overviews/accounts)

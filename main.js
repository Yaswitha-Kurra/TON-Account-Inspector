// TON Account Status Inspector
// Simple tool to inspect TON wallet and contract addresses

// Using TonAPI public endpoint (no API key required for basic usage)
const TONAPI_BASE_URL = 'https://tonapi.io/v2';

/**
 * Main function to inspect a TON address
 */
async function inspectAddress() {
    const addressInput = document.getElementById('address-input');
    const address = addressInput.value.trim();
    
    // Validate input
    if (!address) {
        showError('Please enter a TON address');
        return;
    }
    
    // Normalize address (remove any whitespace)
    const normalizedAddress = address.replace(/\s/g, '');
    
    // Show loading state
    showLoading(true);
    hideError();
    hideResults();
    
    try {
        // Fetch account information
        const accountInfo = await fetchAccountInfo(normalizedAddress);
        
        // Display results
        displayResults(accountInfo, normalizedAddress);
        
    } catch (error) {
        showError(`Failed to fetch account information: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/**
 * Fetch account information from TonAPI
 */
async function fetchAccountInfo(address) {
    try {
        // Fetch account data
        const response = await fetch(`${TONAPI_BASE_URL}/accounts/${address}`);
        
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Fetch balance - check multiple possible fields
        const balance = data.balance || 
                       data.balance_raw || 
                       data.account?.balance ||
                       (data.balances && data.balances[0]?.value) ||
                       '0';
        
        // Determine account status - prioritize state field, then check balance/code/data
        let status = determineAccountStatus(data, balance);
        
        // Determine contract type
        const contractType = determineContractType(data);
        
        // Get last activity from account data (this is the correct way)
        let lastActivity = null;
        if (data.last_activity) {
            // last_activity is a Unix timestamp
            lastActivity = new Date(data.last_activity * 1000).toLocaleString();
        }
        
        return {
            status,
            balance,
            contractType,
            lastActivity,
            accountData: data
        };
        
    } catch (error) {
        throw new Error(`Failed to fetch account: ${error.message}`);
    }
}

/**
 * Determine account status based on account data
 */
function determineAccountStatus(accountData, balance) {
    // Check multiple possible fields for account state
    const state = accountData.state || 
                  accountData.status || 
                  accountData.account_state ||
                  accountData.lifecycle_state ||
                  accountData.info?.state ||
                  accountData.account?.state;
    
    // Check if account has code or data (indicates it's initialized)
    const hasCode = (accountData.code && accountData.code.length > 0 && accountData.code !== 'te6cckEBAQEAOwAA') ||
                   (accountData.account?.code && accountData.account.code.length > 0) ||
                   (accountData.code_hash && accountData.code_hash !== '0' && accountData.code_hash !== '');
    
    const hasData = (accountData.data && accountData.data.length > 0 && accountData.data !== 'te6cckEBAQEAOwAA') ||
                   (accountData.account?.data && accountData.account.data.length > 0) ||
                   (accountData.data_hash && accountData.data_hash !== '0' && accountData.data_hash !== '');
    
    // Check balance - use the balance parameter passed in
    const balanceValue = balance || '0';
    let hasBalance = false;
    try {
        hasBalance = BigInt(balanceValue) > 0n;
    } catch (e) {
        // If balance is not a valid number, treat as 0
        hasBalance = false;
    }
    
    // Normalize state values from API
    if (state === 'active' || state === 'AccountActive') {
        return 'active';
    }
    
    if (state === 'frozen' || state === 'AccountFrozen') {
        return 'frozen';
    }
    
    // IMPORTANT: If account has balance, it MUST be active (even if state says uninit)
    // An account with balance cannot be uninitialized
    if (hasBalance) {
        return 'active';
    }
    
    // If account has code or data, it's active (initialized)
    if (hasCode || hasData) {
        return 'active';
    }
    
    // If state is explicitly uninit or uninitialized AND no balance/code/data
    if ((state === 'uninit' || state === 'uninitialized' || state === 'AccountUninit') && !hasBalance && !hasCode && !hasData) {
        return 'uninitialized';
    }
    
    // Default: if no state field and no code/data/balance, it's uninitialized
    if (!state && !hasCode && !hasData && !hasBalance) {
        return 'uninitialized';
    }
    
    // If we have some indication of activity but unclear state, default to active
    if (hasBalance || hasCode || hasData) {
        return 'active';
    }
    
    return 'uninitialized';
}

/**
 * Determine contract type
 */
function determineContractType(accountData) {
    // Check interfaces to determine type
    if (!accountData.interfaces || accountData.interfaces.length === 0) {
        return 'Unknown';
    }
    
    // Common wallet interfaces
    const walletInterfaces = ['wallet_v1r1', 'wallet_v1r2', 'wallet_v1r3', 'wallet_v2r1', 'wallet_v2r2', 'wallet_v3r1', 'wallet_v3r2', 'wallet_v4r1', 'wallet_v4r2'];
    
    for (const iface of accountData.interfaces) {
        if (walletInterfaces.includes(iface)) {
            return 'Wallet';
        }
    }
    
    // If it has interfaces but not wallet, it's likely a smart contract
    return 'Smart Contract';
}

/**
 * Format TON balance from nanotons to TON
 */
function formatBalance(nanotons) {
    if (!nanotons || nanotons === '0') {
        return '0 TON';
    }
    
    // Convert from nanotons (1 TON = 1,000,000,000 nanotons)
    const tons = BigInt(nanotons) / BigInt(1000000000);
    const remainder = BigInt(nanotons) % BigInt(1000000000);
    
    if (remainder === 0n) {
        return `${tons} TON`;
    }
    
    // Show with 2 decimal places
    const tonsFloat = Number(nanotons) / 1000000000;
    return `${tonsFloat.toFixed(2)} TON`;
}

/**
 * Display results in the UI
 */
function displayResults(accountInfo, address) {
    const resultsDiv = document.getElementById('results');
    const statusSpan = document.getElementById('account-status');
    const statusBadge = document.getElementById('status-badge');
    const balanceSpan = document.getElementById('balance');
    const contractTypeSpan = document.getElementById('contract-type');
    const lastTxSpan = document.getElementById('last-tx');
    const explorerLink = document.getElementById('explorer-link');
    
    // Display status
    statusSpan.textContent = accountInfo.status.toUpperCase();
    statusSpan.className = `value status-${accountInfo.status}`;
    
    // Update status badge
    if (statusBadge) {
        statusBadge.textContent = accountInfo.status.toUpperCase();
        statusBadge.className = `status-badge status-${accountInfo.status}`;
        
        // Set badge colors
        if (accountInfo.status === 'active') {
            statusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
            statusBadge.style.color = '#10b981';
            statusBadge.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        } else if (accountInfo.status === 'frozen') {
            statusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
            statusBadge.style.color = '#ef4444';
            statusBadge.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        } else {
            statusBadge.style.background = 'rgba(245, 158, 11, 0.2)';
            statusBadge.style.color = '#f59e0b';
            statusBadge.style.border = '1px solid rgba(245, 158, 11, 0.3)';
        }
    }
    
    // Display balance
    balanceSpan.textContent = formatBalance(accountInfo.balance);
    
    // Display contract type
    contractTypeSpan.textContent = accountInfo.contractType;
    
    // Display last activity
    if (accountInfo.lastActivity) {
        lastTxSpan.textContent = accountInfo.lastActivity;
        lastTxSpan.style.color = 'var(--text-primary)';
    } else {
        lastTxSpan.textContent = 'No activity recorded';
        lastTxSpan.style.color = 'var(--text-muted)';
    }
    
    // Update explorer link
    if (explorerLink) {
        explorerLink.href = `https://tonviewer.com/${address}`;
    }
    
    // Show results
    resultsDiv.classList.remove('hidden');
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
    const loadingDiv = document.getElementById('loading');
    if (show) {
        loadingDiv.classList.remove('hidden');
    } else {
        loadingDiv.classList.add('hidden');
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    const errorDiv = document.getElementById('error');
    errorDiv.classList.add('hidden');
}

/**
 * Hide results
 */
function hideResults() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.add('hidden');
}

// Allow Enter key to trigger inspection
document.addEventListener('DOMContentLoaded', function() {
    const addressInput = document.getElementById('address-input');
    addressInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            inspectAddress();
        }
    });
});

const TOKEN_ENTRY = "malphas-session"

/**
 * Do NOT use this directly! The session storage should be manipulated exclusively
 * through the Pinia store!
 */
function storeToken(token: string): void {
        localStorage.setItem(TOKEN_ENTRY, token);
}

/**
 * Do NOT use this directly! The session storage should be manipulated exclusively
 * through the Pinia store!
 */
function eraseToken(): void {
        localStorage.removeItem(TOKEN_ENTRY);
}

/**
 * Do NOT use this directly! The session storage should be manipulated exclusively
 * through the Pinia store!
 */
function retrieveToken(): string | undefined {
        return localStorage.getItem(TOKEN_ENTRY) || undefined
}

export {storeToken, eraseToken, retrieveToken}
/**
 * Password Security Analyzer - Complete JavaScript Implementation
 * All operations are performed locally in the browser. No data is logged, stored, or transmitted.
 */

// Global state for common passwords dataset
let commonPasswordsSet = new Set();
let isCommonDatasetLoaded = false;
let commonDatasetFallbackUsed = false;

// Fallback common passwords dataset if fetch fails
const FALLBACK_COMMON_PASSWORDS = [
    "password", "123456", "12345678", "123456789", "qwerty", "abc123",
    "monkey", "master", "dragon", "111111", "baseball", "football",
    "iloveyou", "trustme", "admin", "welcome", "password123", "secret"
];

document.addEventListener("DOMContentLoaded", () => {
    loadCommonPasswords();
    initializeEventListeners();
});

/**
 * Loads common_passwords.txt using fetch() and processes it into a Set for fast lookup.
 */
async function loadCommonPasswords() {
    try {
        const response = await fetch("common_passwords.txt");
        if (!response.ok) {
            throw new Error("Failed to load common passwords file");
        }
        const text = await response.text();
        const lines = text.split(/\r?\n/);
        
        commonPasswordsSet.clear();
        for (let line of lines) {
            const cleaned = line.trim().toLowerCase();
            if (cleaned) {
                commonPasswordsSet.add(cleaned);
            }
        }
        isCommonDatasetLoaded = true;
    } catch (error) {
        // Fallback mechanism if loading fails
        commonDatasetFallbackUsed = true;
        commonPasswordsSet.clear();
        for (let pwd of FALLBACK_COMMON_PASSWORDS) {
            commonPasswordsSet.add(pwd.toLowerCase());
        }
        isCommonDatasetLoaded = true;
    }
}

/**
 * Sets up all DOM event listeners.
 */
function initializeEventListeners() {
    const analyzeBtn = document.getElementById("analyzeBtn");
    const clearBtn = document.getElementById("clearBtn");
    const togglePasswordBtn = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("passwordInput");
    const generateBtn = document.getElementById("generateBtn");
    const copyPasswordBtn = document.getElementById("copyPasswordBtn");
    const generatorLength = document.getElementById("generatorLength");
    const lengthDisplay = document.getElementById("lengthDisplay");

    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", analyzePassword);
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", resetAnalyzer);
    }

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePasswordBtn.textContent = "🙈";
            } else {
                passwordInput.type = "password";
                togglePasswordBtn.textContent = "👁️";
            }
        });
    }

    if (generateBtn) {
        generateBtn.addEventListener("click", generatePassword);
    }

    if (copyPasswordBtn) {
        copyPasswordBtn.addEventListener("click", copyGeneratedPassword);
    }

    if (generatorLength && lengthDisplay) {
        generatorLength.addEventListener("input", (e) => {
            lengthDisplay.textContent = e.target.value;
        });
    }

    // Allow pressing Enter in password input to trigger analysis
    if (passwordInput) {
        passwordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                analyzePassword();
            }
        });
    }
}

/**
 * Main function that reads password, runs all checks, calculates metrics, and updates UI.
 */
function analyzePassword() {
    const passwordInput = document.getElementById("passwordInput");
    if (!passwordInput) return;
    
    const pwd = passwordInput.value;

    // Handle empty password state
    if (!pwd) {
        resetAnalyzer();
        return;
    }

    // 1. Length checks
    const length = pwd.length;
    const hasMinLength = length >= 8;
    const hasGoodLength = length >= 12;
    const hasGreatLength = length >= 16;

    // 2. Character set checks
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

    // 3. Common password check
    const isCommon = commonPasswordsSet.has(pwd.toLowerCase());

    // 4. Repeated character & Pattern detection
    const repeatResult = detectRepeatedCharacters(pwd);
    const patternResult = detectPatterns(pwd);

    // 5. Entropy calculation
    const entropy = calculateEntropy(pwd, { hasUpper, hasLower, hasNumber, hasSpecial });

    // 6. Crack time estimation
    const crackTimeData = estimateCrackTime(entropy);

    // 7. Score calculation
    const score = calculateScore({
        length,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial,
        isCommon,
        hasRepeats: repeatResult.detected,
        hasPatterns: patternResult.detected,
        entropy
    });

    // 8. Update UI Elements
    updateChecksUI({
        length: { passed: hasMinLength, statusText: hasMinLength ? `${length} chars (Pass)` : `${length} chars (Too short)`, state: hasMinLength ? "pass" : "fail" },
        uppercase: { passed: hasUpper, statusText: hasUpper ? "Found" : "Missing", state: hasUpper ? "pass" : "fail" },
        lowercase: { passed: hasLower, statusText: hasLower ? "Found" : "Missing", state: hasLower ? "pass" : "fail" },
        number: { passed: hasNumber, statusText: hasNumber ? "Found" : "Missing", state: hasNumber ? "pass" : "fail" },
        special: { passed: hasSpecial, statusText: hasSpecial ? "Found" : "Missing", state: hasSpecial ? "pass" : "fail" },
        common: { passed: !isCommon, statusText: isCommon ? "Found in dataset" : "Not found", state: isCommon ? "fail" : "pass" },
        repeat: { passed: !repeatResult.detected, statusText: repeatResult.detected ? "Excessive repeats" : "None detected", state: repeatResult.detected ? "warning" : "pass" },
        sequence: { passed: !patternResult.detected, statusText: patternResult.detected ? "Pattern detected" : "No patterns", state: patternResult.detected ? "warning" : "pass" }
    });

    updateDetailsUI({
        length: `${length} characters`,
        characterSet: getCharacterSetDescription({ hasUpper, hasLower, hasNumber, hasSpecial }),
        entropy: `${entropy.toFixed(1)} bits`,
        crackTime: crackTimeData,
        commonStatus: isCommon ? "Common/Breached password" : (commonDatasetFallbackUsed ? "Unique (Warning: Fallback dataset used)" : "Unique password"),
        patternStatus: patternResult.detected || repeatResult.detected ? "Predictable structure found" : "Clean structure"
    });

    updateScoreUI(score);
    showRecommendations({
        length,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial,
        isCommon,
        hasRepeats: repeatResult.detected,
        hasPatterns: patternResult.detected,
        score
    });
}

/**
 * Detects excessive repeated consecutive characters (e.g., "aaa", "111", "!!!").
 */
function detectRepeatedCharacters(pwd) {
    // Matches 3 or more identical consecutive characters
    const repeatRegex = /(.)\1{2,}/;
    const match = pwd.match(repeatRegex);
    return {
        detected: !!match,
        pattern: match ? match[0] : null
    };
}

/**
 * Detects predictable keyboard patterns, sequences, or simple combinations.
 */
function detectPatterns(pwd) {
    const lowerPwd = pwd.toLowerCase();
    const commonSequences = [
        "123456", "12345", "1234", "123456789", "12345678",
        "abcdef", "qwerty", "asdfgh", "zxcvbn", "password",
        "admin123", "password123", "letmein", "welcome"
    ];

    for (let seq of commonSequences) {
        if (lowerPwd.includes(seq)) {
            return { detected: true, type: "common_sequence" };
        }
    }

    // Check sequential numbers/letters (e.g., "3456", "abcd")
    let sequentialCount = 0;
    for (let i = 0; i < pwd.length - 1; i++) {
        const currentCode = pwd.charCodeAt(i);
        const nextCode = pwd.charCodeAt(i + 1);
        if (nextCode === currentCode + 1) {
            sequentialCount++;
            if (sequentialCount >= 3) {
                return { detected: true, type: "sequential_order" };
            }
        } else {
            sequentialCount = 0;
        }
    }

    return { detected: false, type: null };
}

/**
 * Calculates approximate password entropy in bits.
 * Formula: Entropy = length * log2(character-set-size)
 */
function calculateEntropy(pwd, sets) {
    let charsetSize = 0;
    if (sets.hasLower) charsetSize += 26;
    if (sets.hasUpper) charsetSize += 26;
    if (sets.hasNumber) charsetSize += 10;
    if (sets.hasSpecial) charsetSize += 32;

    if (charsetSize === 0 || pwd.length === 0) return 0;

    return pwd.length * Math.log2(charsetSize);
}

/**
 * Estimates approximate crack time based on entropy and an assumed guessing speed (e.g., 1e10 guesses/sec).
 */
function estimateCrackTime(entropy) {
    if (entropy === 0) return "Instant";
    
    // Assume an aggressive modern offline attack rate of 10^10 guesses per second
    const guessesPerSecond = 1e10;
    const totalPossibleCombinations = Math.pow(2, entropy);
    const seconds = (totalPossibleCombinations / 2) / guessesPerSecond;

    if (seconds < 1) return "Less than a second";
    if (seconds < 60) return "Seconds";
    if (seconds < 3600) return "Minutes";
    if (seconds < 86400) return "Hours";
    if (seconds < 31536000) return "Days";
    if (seconds < 31536000 * 100) return "Years";
    return "Centuries";
}

/**
 * Determines character set description text.
 */
function getCharacterSetDescription(sets) {
    let parts = [];
    if (sets.hasLower) parts.push("Lowercase");
    if (sets.hasUpper) parts.push("Uppercase");
    if (sets.hasNumber) parts.push("Numbers");
    if (sets.hasSpecial) parts.push("Special");
    return parts.length > 0 ? parts.join(", ") : "None";
}

/**
 * Calculates security score from 0 to 100 based on multiple factors.
 */
function calculateScore(data) {
    let score = 0;

    // Length contribution
    if (data.length >= 8) score += 20;
    if (data.length >= 12) score += 15;
    if (data.length >= 16) score += 15;

    // Character variety contribution
    if (data.hasUpper) score += 10;
    if (data.hasLower) score += 10;
    if (data.hasNumber) score += 10;
    if (data.hasSpecial) score += 10;

    // Entropy bonus (up to 10 points)
    if (data.entropy > 64) score += 10;
    else if (data.entropy > 40) score += 5;

    // Penalties
    if (data.isCommon) score -= 60;
    if (data.hasPatterns) score -= 25;
    if (data.hasRepeats) score -= 15;

    // Clamp score between 0 and 100
    return Math.max(0, Math.min(100, score));
}

/**
 * Updates individual check card elements and classes in the UI.
 */
function updateChecksUI(checks) {
    const mapping = {
        length: "lengthCheck",
        uppercase: "uppercaseCheck",
        lowercase: "lowercaseCheck",
        number: "numberCheck",
        special: "specialCheck",
        common: "commonCheck",
        repeat: "repeatCheck",
        sequence: "sequenceCheck"
    };

    for (let key in mapping) {
        const cardId = mapping[key];
        const cardElement = document.getElementById(cardId);
        if (!cardElement) continue;

        const checkData = checks[key];
        const iconElement = cardElement.querySelector(".check-icon");
        const resultElement = cardElement.querySelector(".check-result");

        // Remove previous status classes
        cardElement.classList.remove("check-pass", "check-fail", "check-warning", "check-neutral");
        cardElement.classList.add(`check-${checkData.state}`);

        if (checkData.state === "pass") {
            if (iconElement) iconElement.textContent = "✓";
        } else if (checkData.state === "fail") {
            if (iconElement) iconElement.textContent = "✕";
        } else if (checkData.state === "warning") {
            if (iconElement) iconElement.textContent = "⚠️";
        } else {
            if (iconElement) iconElement.textContent = "⚪";
        }

        if (resultElement) {
            resultElement.textContent = checkData.statusText;
        }
    }
}

/**
 * Updates analysis details values.
 */
function updateDetailsUI(details) {
    const setElem = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setElem("passwordLength", details.length);
    setElem("characterSet", details.characterSet);
    setElem("entropyValue", details.entropy);
    setElem("crackTime", details.crackTime);
    setElem("commonPasswordStatus", details.commonStatus);
    setElem("patternStatus", details.patternStatus);
}

/**
 * Updates overall score display, progress bar, and strength classification.
 */
function updateScoreUI(score) {
    const securityScoreElem = document.getElementById("securityScore");
    const scoreProgressElem = document.getElementById("scoreProgress");
    const scoreTextElem = document.getElementById("scoreText");
    const securityStatusElem = document.getElementById("securityStatus");
    const strengthTextElem = document.getElementById("strengthText");
    const strengthBarElem = document.getElementById("strengthBar");

    if (securityScoreElem) securityScoreElem.textContent = `${score} / 100`;
    if (scoreTextElem) scoreTextElem.textContent = `${score}/100`;
    if (scoreProgressElem) scoreProgressElem.style.width = `${score}%`;

    let statusText = "";
    let strengthClass = "";

    if (score <= 29) {
        statusText = "VERY WEAK";
        strengthClass = "strength-weak";
    } else if (score <= 49) {
        statusText = "WEAK";
        strengthClass = "strength-medium";
    } else if (score <= 69) {
        statusText = "MEDIUM";
        strengthClass = "strength-strong";
    } else if (score <= 84) {
        statusText = "STRONG";
        strengthClass = "strength-strong";
    } else {
        statusText = "VERY STRONG";
        strengthClass = "strength-very-strong";
    }

    if (securityStatusElem) securityStatusElem.textContent = statusText;
    if (strengthTextElem) strengthTextElem.textContent = statusText;

    if (strengthBarElem) {
        strengthBarElem.className = `strength-bar ${strengthClass}`;
        strengthBarElem.style.width = `${score}%`;
    }
}

/**
 * Generates and displays dynamic recommendations in the UI.
 */
function showRecommendations(data) {
    const recommendationsContainer = document.getElementById("recommendations");
    if (!recommendationsContainer) return;

    let recs = [];

    if (data.isCommon) {
        recs.push({ type: "rec-danger", text: "Avoid commonly used passwords. Your password matches known breached entries." });
    }
    if (data.length < 8) {
        recs.push({ type: "rec-danger", text: "Use at least 8 characters." });
    } else if (data.length < 12) {
        recs.push({ type: "rec-warning", text: "Consider using 12 or more characters for better protection." });
    }
    if (!data.hasUpper) {
        recs.push({ type: "rec-warning", text: "Add uppercase letters." });
    }
    if (!data.hasLower) {
        recs.push({ type: "rec-warning", text: "Add lowercase letters." });
    }
    if (!data.hasNumber) {
        recs.push({ type: "rec-warning", text: "Add numbers." });
    }
    if (!data.hasSpecial) {
        recs.push({ type: "rec-warning", text: "Add special characters." });
    }
    if (data.hasPatterns) {
        recs.push({ type: "rec-warning", text: "Avoid predictable sequences or keyboard patterns." });
    }
    if (data.hasRepeats) {
        recs.push({ type: "rec-warning", text: "Avoid excessive repeated characters." });
    }

    if (recs.length === 0 && data.score >= 70) {
        recs.push({ type: "rec-success", text: "Your password meets the major strength checks." });
    }

    if (recs.length === 0) {
        recommendationsContainer.innerHTML = "No immediate security issues detected.";
        return;
    }

    let html = "";
    for (let rec of recs) {
        html += `<div class="rec-item ${rec.type}"><span>•</span> <span>${rec.text}</span></div>`;
    }
    recommendationsContainer.innerHTML = html;
}

/**
 * Generates a strong random password using crypto.getRandomValues().
 */
function generatePassword() {
    const lengthInput = document.getElementById("generatorLength");
    const useUpper = document.getElementById("useUppercase");
    const useLower = document.getElementById("useLowercase");
    const useNumbers = document.getElementById("useNumbers");
    const useSpecial = document.getElementById("useSpecial");
    const generatedPasswordOutput = document.getElementById("generatedPassword");

    const length = lengthInput ? parseInt(lengthInput.value, 10) : 16;

    let chars = "";
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (useUpper && useUpper.checked) chars += upperChars;
    if (useLower && useLower.checked) chars += lowerChars;
    if (useNumbers && useNumbers.checked) chars += numberChars;
    if (useSpecial && useSpecial.checked) chars += specialChars;

    if (chars.length === 0) {
        if (generatedPasswordOutput) {
            generatedPasswordOutput.value = "Please select at least one character category.";
        }
        return;
    }

    let passwordArray = new Uint32Array(length);
    window.crypto.getRandomValues(passwordArray);

    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars[passwordArray[i] % chars.length];
    }

    if (generatedPasswordOutput) {
        generatedPasswordOutput.value = password;
    }
}

/**
 * Copies generated password to clipboard using the Clipboard API.
 */
async function copyGeneratedPassword() {
    const generatedPasswordOutput = document.getElementById("generatedPassword");
    if (!generatedPasswordOutput || !generatedPasswordOutput.value) return;

    const pwdToCopy = generatedPasswordOutput.value;
    if (pwdToCopy.startsWith("Please select")) return;

    try {
        await navigator.clipboard.writeText(pwdToCopy);
        const originalPlaceholder = generatedPasswordOutput.placeholder;
        generatedPasswordOutput.value = "Copied to clipboard!";
        setTimeout(() => {
            generatedPasswordOutput.value = pwdToCopy;
        }, 1500);
    } catch (err) {
        // Fallback or silent error handling if clipboard write fails
    }
}

/**
 * Resets the analyzer form and UI back to initial state.
 */
function resetAnalyzer() {
    const passwordInput = document.getElementById("passwordInput");
    if (passwordInput) passwordInput.value = "";

    const strengthBar = document.getElementById("strengthBar");
    if (strengthBar) {
        strengthBar.className = "strength-bar";
        strengthBar.style.width = "0%";
    }

    const setElem = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setElem("strengthText", "Not analyzed");
    setElem("scoreText", "0/100");
    setElem("securityScore", "0 / 100");

    const scoreProgress = document.getElementById("scoreProgress");
    if (scoreProgress) scoreProgress.style.width = "0%";

    setElem("securityStatus", "Not Checked");

    // Reset check cards
    const checkCardIds = [
        "lengthCheck", "uppercaseCheck", "lowercaseCheck", "numberCheck",
        "specialCheck", "commonCheck", "repeatCheck", "sequenceCheck"
    ];

    for (let id of checkCardIds) {
        const card = document.getElementById(id);
        if (card) {
            card.classList.remove("check-pass", "check-fail", "check-warning");
            card.classList.add("check-neutral");
            const icon = card.querySelector(".check-icon");
            const result = card.querySelector(".check-result");
            if (icon) icon.textContent = "⚪";
            if (result) result.textContent = "Not Checked";
        }
    }

    // Reset details values
    setElem("passwordLength", "--");
    setElem("characterSet", "--");
    setElem("entropyValue", "--");
    setElem("crackTime", "--");
    setElem("commonPasswordStatus", "--");
    setElem("patternStatus", "--");

    // Reset recommendations
    const recommendations = document.getElementById("recommendations");
    if (recommendations) {
        recommendations.innerHTML = "Recommendations will appear after analysis.";
    }
}
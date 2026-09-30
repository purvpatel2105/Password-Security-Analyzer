# 🔐 PassGuard — Password Security Analyzer

<p align="center">
  <strong>A privacy-first client-side password security analysis tool</strong>
</p>

<p align="center">
  Analyze password strength, detect common and predictable patterns, estimate entropy, and generate stronger passwords — directly in your browser.
</p>

---

## 📌 About

**PassGuard** is a cybersecurity-focused web application designed to analyze password security using multiple factors instead of relying only on password length.

The application evaluates password characteristics such as character diversity, common-password usage, repeated characters, predictable patterns, entropy, and estimated guessing time.

PassGuard follows a **local-first privacy approach**: password analysis is performed directly in the browser and passwords are not uploaded to a backend server.

---

## ✨ Features

### 🔍 Password Security Analysis

PassGuard checks:

* Password length
* Uppercase characters
* Lowercase characters
* Numbers
* Special characters
* Common password usage
* Repeated characters
* Predictable sequences
* Character-set complexity
* Approximate entropy
* Estimated crack time

### 📊 Security Score

Passwords receive an overall score from **0–100** based on multiple security characteristics.

|  Score | Strength       |
| -----: | -------------- |
|   0–29 | 🔴 Very Weak   |
|  30–49 | 🟠 Weak        |
|  50–69 | 🟡 Medium      |
|  70–84 | 🟢 Strong      |
| 85–100 | 🔵 Very Strong |

> The score is an educational security indicator and should not be treated as a definitive measure of password security.

---

## 📚 Common Password Detection

PassGuard uses a local `common_passwords.txt` dataset to identify commonly used passwords.

It can identify passwords such as:

```text
123456
password
qwerty
admin123
welcome123
password123
```

The analyzer also looks for predictable structures, so a password does not necessarily need to be an exact match in the dataset to receive a warning.

---

## 🧠 Pattern Detection

PassGuard detects common weak-password patterns including:

* Sequential numbers
* Sequential letters
* Repeated characters
* Keyboard sequences
* Common words followed by numbers
* Predictable password structures

Example:

```text
password123
     ↓
Common word + predictable number pattern
     ↓
⚠ Security Warning
```

---

## 📈 Entropy Analysis

PassGuard provides an approximate entropy calculation based on:

* Password length
* Character-set size

Entropy is displayed in **bits** to provide an additional measure of password complexity.

---

## ⏱️ Crack-Time Estimation

The application provides an educational approximation of password guessing time based on the estimated search space and an assumed guessing rate.

Example results:

```text
Less than a second
Minutes
Hours
Days
Years
Centuries
```

> ⚠️ Crack-time estimates are approximate. Actual attack speed varies significantly depending on the hashing algorithm, hardware, attack method, rate limiting, and other factors.

---

## 🔑 Secure Password Generator

PassGuard includes a built-in password generator.

Users can configure:

* Password length
* Uppercase letters
* Lowercase letters
* Numbers
* Special characters

The generator uses the browser's **Web Crypto API** for cryptographically stronger random generation instead of `Math.random()`.

---

## 🔒 Privacy by Design

PassGuard is designed to analyze passwords locally.

### The application does NOT:

* ❌ Upload passwords
* ❌ Send passwords to an API
* ❌ Store passwords in `localStorage`
* ❌ Store passwords in `sessionStorage`
* ❌ Put passwords in URLs
* ❌ Log passwords to the browser console
* ❌ Require a backend server

### The application DOES:

* ✅ Analyze passwords locally
* ✅ Use a local common-password dataset
* ✅ Generate passwords locally
* ✅ Provide security recommendations

> **Privacy Note:** Users should still avoid entering real, sensitive passwords into unfamiliar or untrusted applications.

---

## 🛠️ Tech Stack

| Technology     | Purpose                                       |
| -------------- | --------------------------------------------- |
| HTML5          | Application structure                         |
| CSS3           | Responsive UI and cybersecurity-themed design |
| JavaScript     | Password analysis and application logic       |
| TXT Dataset    | Common-password detection                     |
| Web Crypto API | Secure random password generation             |

---

## 📁 Project Structure

```text
PassGuard/
│
├── index.html
├── style.css
├── script.js
├── common_passwords.txt
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/PassGuard.git
```

### 2. Open the Project

```bash
cd PassGuard
```

### 3. Run a Local Server

Because the application loads `common_passwords.txt` using JavaScript, use a local HTTP server instead of opening the HTML file directly.

#### Option 1 — VS Code

Install the **Live Server** extension and open `index.html` using Live Server.

#### Option 2 — Python

If Python is installed:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## 🧪 Example Analysis

Example password:

```text
Admin@123
```

Possible analysis:

```text
Password Length      ✓
Uppercase            ✓
Lowercase            ✓
Number               ✓
Special Character    ✓
Predictable Pattern  ⚠
Common Structure     ⚠

Overall:
Needs Improvement
```

This demonstrates why simply satisfying character requirements does not necessarily make a password difficult to guess.

---

## 🎯 Project Objectives

PassGuard was developed to demonstrate practical concepts in:

* Password security
* Cybersecurity awareness
* Client-side security
* Pattern detection
* Dictionary-based password detection
* Entropy calculation
* Password-generation techniques
* Secure browser APIs
* Privacy-focused application design

---

## 🧩 Learning Outcomes

Through this project, the following concepts can be explored:

```text
Password Policies
       ↓
Password Strength
       ↓
Dictionary Attacks
       ↓
Pattern Detection
       ↓
Entropy
       ↓
Guessing Resistance
       ↓
Secure Password Generation
```

---

## 🚀 Future Improvements

Possible future versions may include:

* More advanced password-strength algorithms
* Larger and better-maintained password datasets
* Privacy-preserving breach checking
* More advanced pattern recognition
* Detailed security reports
* Password security education mode
* Browser extension
* Progressive Web App (PWA)
* Accessibility enhancements
* Offline application support

---

## ⚠️ Disclaimer

PassGuard is an **educational cybersecurity project**.

Password scores, entropy values, and crack-time estimates are approximations intended for security awareness and learning.

The tool should not be used as a guarantee that a password is secure against real-world attacks.

If an external password dataset is used, its license and attribution requirements must be followed.

---

## 👨‍💻 Project Information

**Project:** PassGuard — Password Security Analyzer

**Category:** Cybersecurity / Web Security

**Type:** Client-Side Web Application

**Technologies:** HTML5, CSS3, JavaScript

**Focus:** Password Security & Cybersecurity Awareness

---

## 📜 License

This project can be released under an open-source license such as **MIT License**.

If third-party datasets are included, their individual licenses and attribution requirements apply separately.

---

<p align="center">
  🔐 <strong>PassGuard</strong> — Learn. Analyze. Secure.
</p>

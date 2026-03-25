import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, doc, setDoc } from './firebase-config.js';

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');

// Toggle Tabs
tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabSignup.classList.remove('active');
  loginForm.style.display = 'block';
  signupForm.style.display = 'none';
  loginError.textContent = '';
});

tabSignup.addEventListener('click', () => {
  tabSignup.classList.add('active');
  tabLogin.classList.remove('active');
  signupForm.style.display = 'block';
  loginForm.style.display = 'none';
  signupError.textContent = '';
});

// We use a flag to prevent redirecting before Firestore write completes
let isSigningUp = false;

// Auth State Check (Redirect if already logged in)
onAuthStateChanged(auth, (user) => {
  if (user && !isSigningUp) {
    window.location.href = 'index.html';
  }
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    loginError.textContent = '';
    const btn = loginForm.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
    
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will redirect
  } catch (error) {
    loginError.textContent = error.message;
    const btn = loginForm.querySelector('button');
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
  }
});

// Signup
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  isSigningUp = true;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const role = document.getElementById('signup-role').value;
  
  try {
    signupError.textContent = '';
    const btn = signupForm.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save role to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: role, // "admin" or "staff"
      createdAt: new Date().toISOString()
    });
    
    // Redirect now that data is saved safely
    window.location.href = 'index.html';
  } catch (error) {
    isSigningUp = false;
    signupError.textContent = error.message;
    const btn = signupForm.querySelector('button');
    btn.disabled = false;
    btn.innerHTML = 'Create Account';
  }
});

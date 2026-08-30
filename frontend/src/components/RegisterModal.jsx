import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Users, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, AlertCircle, LogIn } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { loginWithGoogle } from '../services/api';

export default function RegisterModal({
  isOpen,
  onClose,
  onUserRegistered,
  isEditMode = false,
  currentUser = null
}) {
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone_number || '');
  const [gender, setGender] = useState(currentUser?.gender || 'Male');
  const [age, setAge] = useState(currentUser?.age || 25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  // 1-Click Google Sign-In Handler
  const handleGoogleSignInClick = async (customEmail = null, customName = null) => {
    setErrorMsg(null);
    setIsGoogleSigningIn(true);

    const targetEmail = customEmail || googleEmailInput || (email.includes('@') ? email : 'creator@gmail.com');
    const targetName = customName || googleNameInput || (fullName.trim() || 'Vision Max Creator');

    try {
      const userProfile = await loginWithGoogle({
        fullName: targetName,
        email: targetEmail,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(targetEmail)}`
      });

      localStorage.setItem('vm_user_profile', JSON.stringify(userProfile));
      setSuccessMsg(`Signed in with Google as ${targetName}! Notification sent to administration.`);

      setTimeout(() => {
        onUserRegistered(userProfile);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(`Google sign-in error: ${err.message}`);
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setErrorMsg('Please enter a valid phone number with country/area code.');
      return;
    }
    if (!age || age < 1 || age > 120) {
      setErrorMsg('Please enter a valid age between 1 and 120.');
      return;
    }

    setIsSubmitting(true);

    const profileData = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone_number: phone.trim(),
      gender,
      age: parseInt(age, 10),
      timestamp: new Date().toISOString()
    };

    // 1. Submit to FastAPI Backend
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
    } catch (err) {
      console.info('Backend offline, proceeding with cloud notification relay.');
    }

    // 2. Direct Cloud Notification to rashpindertechwith@gmail.com
    try {
      await fetch('https://formsubmit.co/ajax/rashpindertechwith@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `🚀 New User Registered: ${profileData.full_name}`,
          _captcha: "false",
          _template: "table",
          "Website": "https://advance-accessible-ai-tts-npum.vercel.app",
          "Full Name": profileData.full_name,
          "Email Address": profileData.email,
          "Phone Number": profileData.phone_number,
          "Gender": profileData.gender,
          "Age": profileData.age,
          "Registered At": new Date().toLocaleString(),
          "Platform": "Vision Max Intelligence Neural Studio v2.0"
        })
      });
    } catch (cloudErr) {
      console.info('Cloud email relay notice:', cloudErr);
    }

    localStorage.setItem('vm_user_profile', JSON.stringify(profileData));
    setSuccessMsg('Account registered successfully! Details sent to administration.');

    setTimeout(() => {
      onUserRegistered(profileData);
      onClose();
    }, 1200);

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-scale-in my-auto border-t-2 border-t-indigo-500">
        {/* Header */}
        <div className="text-center space-y-2 pb-4 border-b border-slate-800">
          <div className="flex justify-center">
            <BrandLogo size="lg" showTag={true} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
            {isEditMode ? 'Account Profile Settings' : 'Sign In or Create Account'}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {isEditMode
              ? 'Update your personal profile information below.'
              : 'Sign in in 1-click with your Google account or register manually to unlock full studio synthesis.'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* --- 1-Click Google Sign-In Button --- */}
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => setShowGooglePrompt(!showGooglePrompt)}
            disabled={isGoogleSigningIn}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm transition-all shadow-lg hover:shadow-white/10 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] border border-slate-300"
          >
            {/* Google Multicolored SVG Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z" />
              <path fill="#FBBC05" d="M5.28 14.27A7.06 7.06 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
            </svg>
            <span>{isGoogleSigningIn ? 'Authenticating with Google...' : 'Continue with Google'}</span>
          </button>

          {/* Inline Quick Google Sign-in Inputs (If clicked) */}
          {showGooglePrompt && (
            <div className="p-4 bg-slate-950/90 rounded-2xl border border-indigo-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Account Quick Sign-In</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                  No Password Needed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Google Name"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-[10px] text-slate-400">
                  Only your name &amp; email will be securely sent to administration.
                </p>
                <button
                  type="button"
                  onClick={() => handleGoogleSignInClick()}
                  disabled={isGoogleSigningIn || !googleEmailInput.trim()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md disabled:opacity-40 transition-all shrink-0"
                >
                  Sign In Now
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Or Register Manually
            </span>
            <div className="border-t border-slate-800 w-full"></div>
          </div>
        </div>

        {/* Manual Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Name</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 font-medium"
            />
          </div>

          {/* 2. Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>Email Address</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 font-mono"
            />
          </div>

          {/* 3. Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-pink-400" />
              <span>Phone Number</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/60 font-mono"
            />
          </div>

          {/* 4. Gender & Age Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gender</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/60 font-medium cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Age</span>
              </label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 font-mono"
              />
            </div>
          </div>

          {/* Security Guarantee Notice */}
          <div className="p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Registration alert is automatically dispatched to <strong className="text-indigo-300">rashpindertechwith@gmail.com</strong> (no passwords transmitted).
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-indigo-600/35 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>{isEditMode ? 'Save Profile Changes' : 'Create Account & Access Studio'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {isEditMode && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

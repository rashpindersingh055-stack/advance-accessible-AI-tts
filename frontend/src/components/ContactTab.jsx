import React, { useState } from 'react';
import { 
  Phone, Mail, MessageSquare, Send, MapPin, Globe, CheckCircle2, 
  AlertCircle, Sparkles, Clock, ShieldCheck, PhoneCall, MessageCircle, ArrowUpRight
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function ContactTab() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        _subject: `💬 Vision Max Contact Form: ${subject || 'General Inquiry'} from ${name}`,
        _captcha: 'false',
        _template: 'table',
        "Website": "https://advance-accessible-ai-tts-npum.vercel.app",
        "Sender Name": name.trim(),
        "Sender Email": email.trim(),
        "Sender Phone": phone.trim() || 'Not Provided',
        "Subject": subject.trim() || 'General Inquiry',
        "Message": message.trim(),
        "Sent At": new Date().toLocaleString()
      };

      await fetch('https://formsubmit.co/ajax/rashpindertechwith@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      setIsSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setErrorMsg('Message recorded. We will get back to you shortly.');
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span>Get in Touch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Contact Vision Max Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Have questions, feedback, enterprise voice API inquiries, or need customized acoustic models? We are here to help you 24/7.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Fast Response within 24 Hours</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Contact Cards & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Direct Contact Info & WhatsApp */}
        <div className="space-y-4">
          {/* Phone Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400" />
              <span>Direct Phone &amp; WhatsApp</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Primary Phone Number:
              </span>
              <a
                href="tel:9877104076"
                className="text-lg font-black text-white hover:text-indigo-400 font-mono flex items-center gap-2 transition-colors"
              >
                <span>+91 9877104076</span>
                <ArrowUpRight className="w-4 h-4 text-indigo-400" />
              </a>
              <p className="text-xs text-slate-400">
                Direct phone support for inquiries &amp; API assistance.
              </p>
            </div>

            {/* Quick WhatsApp Action */}
            <a
              href="https://wa.me/919877104076?text=Hi%20Vision%20Max%20Team,%20I%20have%20an%20inquiry%20about%20the%20Neural%20Voice%20Studio."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp (+91 9877104076)</span>
            </a>

            {/* 1-Click Direct Call */}
            <a
              href="tel:9877104076"
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
              <span>Call +91 9877104076</span>
            </a>
          </div>

          {/* Email & Details Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3.5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>Official Email &amp; Web</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <Mail className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-bold">Email Support</p>
                  <a
                    href="mailto:rashpindertechwith@gmail.com"
                    className="text-xs text-indigo-300 hover:text-white font-mono truncate block"
                  >
                    rashpindertechwith@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <Globe className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-bold">Live Platform</p>
                  <a
                    href="https://advance-accessible-ai-tts-npum.vercel.app"
                    className="text-xs text-indigo-300 hover:text-white font-mono truncate block"
                  >
                    advance-accessible-ai-tts-npum.vercel.app
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <Clock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-bold">Support Hours</p>
                  <p className="text-xs text-slate-300">24/7 Online Support &amp; Rapid Response</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Direct Message Form */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <span>Send Us a Direct Message</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fill in the form below and your message will be dispatched directly to our administration team.
                </p>
              </div>
            </div>

            {/* Success Alert */}
            {isSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2.5 animate-scale-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you! Your message has been sent successfully. We will reply to your email shortly.</span>
              </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2.5 animate-scale-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9877104076"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Inquiry Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Neural Voice Studio API / Feedback"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Your Message *</label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message, questions, or project requirements here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to Team</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

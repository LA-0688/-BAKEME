'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Step = 'email' | 'otp' | 'success';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { signInWithOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setOtp(['', '', '', '', '', '']);
      setError(null);
    }
  }, [isOpen]);

  // Auto-close after success
  useEffect(() => {
    if (step === 'success') {
      const t = setTimeout(onClose, 1800);
      return () => clearTimeout(t);
    }
  }, [step, onClose]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error } = await signInWithOtp(email.trim().toLowerCase());
    setLoading(false);
    if (error) { setError(error); return; }
    setStep('otp');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    // Auto-verify when all 6 digits are filled
    if (next.every((d) => d !== '') && next.join('').length === 6) {
      handleVerify(next.join(''));
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const token = code ?? otp.join('');
    if (token.length < 6) return;
    setLoading(true);
    setError(null);
    const { error } = await verifyOtp(email, token);
    setLoading(false);
    if (error) {
      setError(error);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      return;
    }
    setStep('success');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bakery-charcoal/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-bakery-cream w-full max-w-md rounded-3xl shadow-2xl border border-bakery-wheat/40 pointer-events-auto overflow-hidden">
              
              {/* Header */}
              <div className="flex items-start justify-between px-8 pt-8 pb-4">
                <div>
                  <span className="font-serif text-2xl text-bakery-charcoal">L'Artisan</span>
                  <p className="text-xs text-bakery-charcoal/50 mt-0.5 uppercase tracking-widest font-semibold">
                    {step === 'email' ? 'Sign in or create account' : step === 'otp' ? 'Enter verification code' : 'Welcome back!'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-bakery-wheat/60 text-bakery-charcoal/60 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-8 pb-8">
                <AnimatePresence mode="wait">

                  {/* Step 1: Email */}
                  {step === 'email' && (
                    <motion.form
                      key="email"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleSendOtp}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 bg-bakery-wheat/40 rounded-2xl px-4 py-3 border border-bakery-wheat focus-within:border-bakery-crust transition-colors">
                        <Mail className="h-4 w-4 text-bakery-charcoal/40 shrink-0" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="bg-transparent flex-1 text-sm text-bakery-charcoal placeholder:text-bakery-charcoal/30 outline-none"
                          id="auth-email"
                          autoFocus
                        />
                      </div>

                      {error && (
                        <p className="text-xs text-red-500 font-medium">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-bakery-crust text-white py-3.5 rounded-2xl text-sm font-semibold tracking-wide hover:bg-bakery-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        id="send-otp-btn"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                        {loading ? 'Sending code...' : 'Send magic code'}
                      </button>

                      <p className="text-[11px] text-bakery-charcoal/40 text-center">
                        We'll email you a 6-digit code. No password needed.
                      </p>
                    </motion.form>
                  )}

                  {/* Step 2: OTP */}
                  {step === 'otp' && (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <p className="text-xs text-bakery-charcoal/60 text-center">
                        Code sent to <span className="font-semibold text-bakery-charcoal">{email}</span>
                      </p>

                      {/* OTP Boxes */}
                      <div className="flex gap-2 justify-center">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => { otpRefs.current[idx] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-11 h-13 text-center text-xl font-bold text-bakery-charcoal bg-bakery-wheat/40 border-2 border-bakery-wheat focus:border-bakery-crust rounded-xl outline-none transition-colors"
                            id={`otp-digit-${idx}`}
                          />
                        ))}
                      </div>

                      {error && (
                        <p className="text-xs text-red-500 font-medium text-center">{error}</p>
                      )}

                      <button
                        onClick={() => handleVerify()}
                        disabled={loading || otp.some((d) => !d)}
                        className="w-full bg-bakery-crust text-white py-3.5 rounded-2xl text-sm font-semibold tracking-wide hover:bg-bakery-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        id="verify-otp-btn"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                        {loading ? 'Verifying...' : 'Verify & Sign In'}
                      </button>

                      <button
                        onClick={() => { setStep('email'); setError(null); }}
                        className="w-full text-xs text-bakery-charcoal/50 hover:text-bakery-charcoal transition-colors text-center"
                      >
                        ← Use a different email
                      </button>
                    </motion.div>
                  )}

                  {/* Step 3: Success */}
                  {step === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4 py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
                      >
                        <CheckCircle2 className="h-14 w-14 text-green-500" />
                      </motion.div>
                      <p className="font-serif text-xl text-bakery-charcoal">Welcome!</p>
                      <p className="text-xs text-bakery-charcoal/50">Signed in as {email}</p>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

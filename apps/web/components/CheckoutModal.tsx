'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CreditCard, QrCode, Truck, Store, Clock, 
  Loader2, CheckCircle2, Phone, MapPin, Sparkles, ChevronRight
} from 'lucide-react';
import { type CartEntry } from '../store/cartStore';
import { useAuth } from '../context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartEntry[];
  totalAmount: number;
  onSuccess: () => void;
}

type PaymentMethod = 'upi_qr' | 'card';
type DeliveryType = 'pickup' | 'delivery';

export default function CheckoutModal({ isOpen, onClose, cart, totalAmount, onSuccess }: CheckoutModalProps) {
  const { user } = useAuth();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [scheduledTime, setScheduledTime] = useState('Today, 11:00 AM');
  
  // Checkout flow state
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment_method' | 'simulating' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Payment gateway order details
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pgOrderId, setPgOrderId] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('upi_qr');
  
  // Simulator states
  const [qrCountdown, setQrCountdown] = useState(300); // 5 minutes
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardFocused, setCardFocused] = useState(false);

  // Inject Razorpay checkout script dynamically
  useEffect(() => {
    if (isOpen) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setCheckoutStep('details');
      setLoading(false);
      setError(null);
      setQrCountdown(300);
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCvv('');
    }
  }, [isOpen]);

  // Dynamic QR Code Countdown timer
  useEffect(() => {
    let timer: any;
    if (checkoutStep === 'payment_method' && selectedPayment === 'upi_qr' && qrCountdown > 0) {
      timer = setTimeout(() => setQrCountdown(qrCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [checkoutStep, selectedPayment, qrCountdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryType === 'delivery' && !address.trim()) {
      setError('Please provide a delivery address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch user session/JWT token
      const session = localStorage.getItem('sb-kimmnbpopbmutkowdssa-auth-token');
      const token = session ? JSON.parse(session)?.access_token : null;

      if (!token) {
        throw new Error('You must be signed in to check out.');
      }

      // 1. Create order on Next.js API backend
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
          delivery_type: deliveryType,
          delivery_address: deliveryType === 'delivery' ? address : null,
          scheduled_time: scheduledTime,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || 'Failed to place order.');

      setOrderId(orderData.order_id);
      setPgOrderId(orderData.payment_gateway_order_id);
      setIsMock(orderData.is_mock);

      setLoading(false);

      // 2. Route the payment
      if (orderData.is_mock) {
        // If credentials not found, proceed to dynamic sandbox simulator
        setCheckoutStep('payment_method');
      } else {
        // Run live/test Razorpay Standard Overlay checkout
        launchRazorpayCheckout(orderData.total_amount, orderData.payment_gateway_order_id, orderData.order_id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during checkout.');
      setLoading(false);
    }
  };

  const launchRazorpayCheckout = (amount: number, rzpOrderId: string, appOrderId: string) => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    
    if (!(window as any).Razorpay) {
      setError('Razorpay SDK failed to load. Please try again.');
      return;
    }

    const options = {
      key: keyId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: "L'Artisan Bakery",
      description: 'Artisanal Bread & Pastries',
      image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=120&q=80',
      order_id: rzpOrderId,
      handler: async function (response: any) {
        // Successful payment callback
        console.log('Razorpay Payment Success:', response);
        setCheckoutStep('simulating');
        
        try {
          // Trigger local state verify/webhook update
          const verifyRes = await fetch('/api/webhooks/razorpay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'payment.captured',
              payload: {
                payment: {
                  entity: {
                    id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    amount: Math.round(amount * 100),
                  }
                }
              }
            }),
          });

          if (verifyRes.ok) {
            setCheckoutStep('success');
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 3000);
          } else {
            throw new Error('Failed to verify payment status.');
          }
        } catch (e) {
          setError('Payment succeeded but local order verification failed.');
          setCheckoutStep('details');
        }
      },
      prefill: {
        email: user?.email || '',
        contact: phone,
      },
      theme: {
        color: '#8A583C',
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (resp: any) {
      setError(`Payment Failed: ${resp.error.description}`);
    });
    rzp.open();
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    setCheckoutStep('simulating');

    try {
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 12)}`;
      // Trigger AI Orchestrator with the order payload
      const res = await fetch('/api/ai/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId || mockPaymentId,
          items: cart.map(item => ({ itemName: item.product.name, quantity: item.quantity })),
          totalAmount: totalAmount,
          customer: {
            phone: phone,
            name: user?.user_metadata?.full_name || 'Valued Customer'
          },
          deliveryType: deliveryType,
          scheduledTime: scheduledTime,
        }),
      });

      if (!res.ok) console.warn('AI Orchestrator returned an error, but proceeding with checkout success.');

      // Delay to show simulating spinner beautifully
      setTimeout(() => {
        setLoading(false);
        setCheckoutStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2500);
      }, 1800);
    } catch (err: any) {
      console.error(err);
      setError('Sandbox simulation failed. Please try again.');
      setCheckoutStep('payment_method');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Slide Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bakery-charcoal/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Premium Checkout Side-Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-bakery-cream shadow-2xl border-l border-bakery-wheat/40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-bakery-wheat/30 flex items-center justify-between bg-bakery-cream/80 backdrop-blur-md">
              <div>
                <h3 className="font-serif text-2xl text-bakery-charcoal flex items-center gap-2">
                  L'Artisan Checkout <Sparkles className="h-4 w-4 text-bakery-amber animate-pulse" />
                </h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-bakery-amber mt-0.5">
                  {checkoutStep === 'details' ? 'Delivery & Schedule details' : 
                   checkoutStep === 'payment_method' ? 'Choose payment method (Sandbox)' : 
                   checkoutStep === 'simulating' ? 'Securing Transaction...' : 'Order Confirmed!'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-full hover:bg-bakery-wheat/60 text-bakery-charcoal/60 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main scrollable body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-xs font-semibold border border-red-100">
                  {error}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* STEP 1: DELIVERY PREFERENCES AND DETAILS */}
                {checkoutStep === 'details' && (
                  <motion.form
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handlePlaceOrder}
                    className="space-y-6"
                  >
                    {/* Delivery / Pickup Tabs */}
                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-bakery-wheat/30 rounded-2xl border border-bakery-wheat/40">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('pickup')}
                        className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          deliveryType === 'pickup' 
                            ? 'bg-bakery-charcoal text-white shadow-sm' 
                            : 'text-bakery-charcoal/60 hover:text-bakery-charcoal'
                        }`}
                      >
                        <Store className="h-4 w-4" /> Bakery Pickup
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType('delivery')}
                        className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          deliveryType === 'delivery' 
                            ? 'bg-bakery-charcoal text-white shadow-sm' 
                            : 'text-bakery-charcoal/60 hover:text-bakery-charcoal'
                        }`}
                      >
                        <Truck className="h-4 w-4" /> Home Delivery
                      </button>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                      {/* Phone Number */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-bakery-charcoal/50 uppercase tracking-widest block">Contact Number</label>
                        <div className="flex items-center gap-3 bg-bakery-wheat/40 rounded-2xl px-4 py-3.5 border border-bakery-wheat/50 focus-within:border-bakery-crust transition-all">
                          <Phone className="h-4 w-4 text-bakery-charcoal/40" />
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-transparent flex-1 text-sm outline-none text-bakery-charcoal placeholder:text-bakery-charcoal/30"
                          />
                        </div>
                      </div>

                      {/* Scheduled Time */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-bakery-charcoal/50 uppercase tracking-widest block">Schedule Pickup/Delivery Time</label>
                        <div className="flex items-center gap-3 bg-bakery-wheat/40 rounded-2xl px-4 py-3.5 border border-bakery-wheat/50 focus-within:border-bakery-crust transition-all">
                          <Clock className="h-4 w-4 text-bakery-charcoal/40" />
                          <select
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="bg-transparent flex-1 text-sm outline-none text-bakery-charcoal font-medium cursor-pointer"
                          >
                            <option value="Today, 11:00 AM">Today, 11:00 AM (Fresh Counter)</option>
                            <option value="Today, 02:00 PM">Today, 02:00 PM (Afternoon Bake)</option>
                            <option value="Tomorrow, 09:00 AM">Tomorrow, 09:00 AM (Morning Sourdough)</option>
                            <option value="Tomorrow, 01:00 PM">Tomorrow, 01:00 PM (Lunch Specials)</option>
                          </select>
                        </div>
                      </div>

                      {/* Address (If Delivery) */}
                      {deliveryType === 'delivery' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          <label className="text-[11px] font-bold text-bakery-charcoal/50 uppercase tracking-widest block">Delivery Address</label>
                          <div className="flex items-start gap-3 bg-bakery-wheat/40 rounded-2xl px-4 py-3.5 border border-bakery-wheat/50 focus-within:border-bakery-crust transition-all">
                            <MapPin className="h-4 w-4 text-bakery-charcoal/40 mt-1" />
                            <textarea
                              required
                              rows={3}
                              placeholder="123 Sourdough Lane, Flour District, Paris Quarter..."
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="bg-transparent flex-1 text-sm outline-none text-bakery-charcoal placeholder:text-bakery-charcoal/30 resize-none"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Order summary card */}
                    <div className="bg-bakery-wheat/20 rounded-3xl p-6 border border-bakery-wheat/40 space-y-4">
                      <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-bakery-charcoal border-b border-bakery-wheat/30 pb-2">
                        Summary
                      </h4>
                      <div className="max-h-[160px] overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex justify-between items-center text-xs font-light text-bakery-charcoal/80">
                            <span className="truncate max-w-[200px]">
                              {item.product.name} <span className="font-semibold text-bakery-amber">x{item.quantity}</span>
                            </span>
                            <span className="font-mono">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-bakery-wheat/30 pt-3 flex justify-between items-baseline">
                        <span className="font-bold text-sm uppercase tracking-wider text-bakery-charcoal">Total Amount</span>
                        <span className="font-serif text-2xl font-bold text-bakery-amber">₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Submit CTA */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-bakery-charcoal text-white hover:bg-bakery-crust py-4 rounded-2xl text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                      id="place-order-btn"
                    >
                      {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <ChevronRight className="h-4.5 w-4.5" />}
                      {loading ? 'Validating Order Prices...' : 'Place Secure Order'}
                    </button>
                  </motion.form>
                )}

                {/* STEP 2: PAYMENT METHOD (SANDBOX VISUAL SIMULATOR) */}
                {checkoutStep === 'payment_method' && (
                  <motion.div
                    key="payment_method"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Sandbox Alert Tag */}
                    <div className="bg-bakery-wheat p-4 rounded-2xl border border-bakery-amber/30 text-xs text-bakery-amber font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span><strong>Sandbox Payment:</strong> Razorpay Credentials not detected. Enjoy the premium Visual Checkout simulator!</span>
                    </div>

                    {/* Selector Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedPayment('upi_qr')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                          selectedPayment === 'upi_qr'
                            ? 'border-bakery-amber bg-bakery-wheat/20 text-bakery-charcoal'
                            : 'border-bakery-wheat/40 hover:border-bakery-wheat text-bakery-charcoal/50'
                        }`}
                      >
                        <QrCode className="h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Scan UPI QR</span>
                      </button>
                      <button
                        onClick={() => setSelectedPayment('card')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                          selectedPayment === 'card'
                            ? 'border-bakery-amber bg-bakery-wheat/20 text-bakery-charcoal'
                            : 'border-bakery-wheat/40 hover:border-bakery-wheat text-bakery-charcoal/50'
                        }`}
                      >
                        <CreditCard className="h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Credit / Debit Card</span>
                      </button>
                    </div>

                    {/* METHOD CONTENTS */}
                    <AnimatePresence mode="wait">
                      {/* UPI QR Code Screen */}
                      {selectedPayment === 'upi_qr' && (
                        <motion.div
                          key="qr"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex flex-col items-center p-6 bg-white rounded-3xl border border-bakery-wheat/30 shadow-sm"
                        >
                          <span className="text-[10px] uppercase font-bold tracking-widest text-bakery-charcoal/40 mb-1">UPI Dynamic Merchant QR</span>
                          <span className="font-serif text-lg text-bakery-charcoal mb-4">L'Artisan Bakery Store</span>
                          
                          {/* QR Code Container */}
                          <div className="w-48 h-48 bg-white border-2 border-bakery-wheat/60 rounded-2xl flex items-center justify-center p-3 relative shadow-inner">
                            {/* Simulated custom luxury QR */}
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=lartisan@icici%26pn=LArtisan%2520Bakery%26am=${totalAmount}%26cu=INR%26tr=${orderId}`}
                              alt="L'Artisan Dynamic Checkout QR"
                              className="w-full h-full object-contain"
                            />
                            {/* Centered Bakery Logo */}
                            <div className="absolute h-10 w-10 bg-bakery-cream rounded-full border border-bakery-wheat flex items-center justify-center shadow-md">
                              <span className="font-serif text-[10px] font-bold text-bakery-amber">L'A</span>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-1.5 text-xs text-bakery-charcoal/60 bg-bakery-wheat/30 px-3 py-1.5 rounded-full">
                            <Clock className="h-3.5 w-3.5 text-bakery-amber" />
                            <span>Scan to Pay: <strong className="font-mono">{formatTime(qrCountdown)}</strong></span>
                          </div>

                          <button
                            onClick={handleSimulatePayment}
                            disabled={loading}
                            className="mt-6 w-full bg-bakery-charcoal text-white hover:bg-bakery-crust py-3.5 rounded-2xl text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
                          >
                            <CheckCircle2 className="h-4.5 w-4.5 text-green-400" /> Simulate Scan Success
                          </button>
                        </motion.div>
                      )}

                      {/* Luxurious Card Payment Screen */}
                      {selectedPayment === 'card' && (
                        <motion.div
                          key="card"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          {/* Premium Gold Card graphic */}
                          <div className="relative w-full aspect-[1.58/1] rounded-[24px] bg-gradient-to-tr from-[#1E1E1E] via-[#2F221B] to-[#1A1A1A] p-6 text-white flex flex-col justify-between shadow-xl border border-white/10 overflow-hidden select-none">
                            <div className="absolute right-0 top-0 w-48 h-48 bg-bakery-gold/5 rounded-full blur-[40px] pointer-events-none" />
                            
                            <div className="flex justify-between items-start">
                              <span className="font-serif text-lg tracking-wider text-bakery-gold/80 italic font-semibold">L'Artisan Exclusive</span>
                              {/* Chip */}
                              <div className="w-10 h-8 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-300 opacity-80" />
                            </div>

                            {/* Card Details */}
                            <div className="space-y-4">
                              <div className="font-mono text-lg sm:text-xl tracking-[0.2em] text-white/90">
                                {cardNumber || '••••  ••••  ••••  ••••'}
                              </div>
                              <div className="flex justify-between items-end">
                                <div>
                                  <span className="text-[8px] uppercase tracking-wider text-white/40 block">Card Holder</span>
                                  <span className="text-xs uppercase tracking-widest text-white/80 font-medium truncate max-w-[200px]">
                                    {cardName || 'YOUR FULL NAME'}
                                  </span>
                                </div>
                                <div className="flex gap-4">
                                  <div>
                                    <span className="text-[8px] uppercase tracking-wider text-white/40 block">Expiry</span>
                                    <span className="text-xs font-mono text-white/80">{cardExpiry || 'MM/YY'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] uppercase tracking-wider text-white/40 block">CVV</span>
                                    <span className="text-xs font-mono text-white/80">{cardCvv || '•••'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Inputs */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2 bg-bakery-wheat/30 rounded-2xl border border-bakery-wheat/40 focus-within:border-bakery-crust px-4 py-2">
                                <label className="text-[8px] font-bold text-bakery-charcoal/50 uppercase tracking-widest block">Cardholder Name</label>
                                <input
                                  type="text"
                                  placeholder="John Doe"
                                  value={cardName}
                                  onChange={(e) => setCardName(e.target.value)}
                                  className="bg-transparent w-full text-xs font-semibold outline-none text-bakery-charcoal pt-0.5"
                                />
                              </div>
                              <div className="col-span-2 bg-bakery-wheat/30 rounded-2xl border border-bakery-wheat/40 focus-within:border-bakery-crust px-4 py-2">
                                <label className="text-[8px] font-bold text-bakery-charcoal/50 uppercase tracking-widest block">Card Number</label>
                                <input
                                  type="text"
                                  maxLength={19}
                                  placeholder="4321 0987 6543 2100"
                                  value={cardNumber}
                                  onChange={(e) => {
                                    // Auto-format card spaces
                                    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                    const matches = v.match(/\d{4,16}/g);
                                    const match = (matches && matches[0]) || '';
                                    const parts = [];
                                    for (let i = 0, len = match.length; i < len; i += 4) {
                                      parts.push(match.substring(i, i + 4));
                                    }
                                    if (parts.length > 0) {
                                      setCardNumber(parts.join('  '));
                                    } else {
                                      setCardNumber(v);
                                    }
                                  }}
                                  className="bg-transparent w-full text-xs font-mono font-semibold outline-none text-bakery-charcoal pt-0.5"
                                />
                              </div>
                              <div className="bg-bakery-wheat/30 rounded-2xl border border-bakery-wheat/40 focus-within:border-bakery-crust px-4 py-2">
                                <label className="text-[8px] font-bold text-bakery-charcoal/50 uppercase tracking-widest block">Expiry Date</label>
                                <input
                                  type="text"
                                  maxLength={5}
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => {
                                    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                    if (v.length >= 2) {
                                      setCardExpiry(`${v.slice(0, 2)}/${v.slice(2, 4)}`);
                                    } else {
                                      setCardExpiry(v);
                                    }
                                  }}
                                  className="bg-transparent w-full text-xs font-mono font-semibold outline-none text-bakery-charcoal pt-0.5"
                                />
                              </div>
                              <div className="bg-bakery-wheat/30 rounded-2xl border border-bakery-wheat/40 focus-within:border-bakery-crust px-4 py-2">
                                <label className="text-[8px] font-bold text-bakery-charcoal/50 uppercase tracking-widest block">CVV</label>
                                <input
                                  type="password"
                                  maxLength={3}
                                  placeholder="•••"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                                  className="bg-transparent w-full text-xs font-mono font-semibold outline-none text-bakery-charcoal pt-0.5"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={handleSimulatePayment}
                            disabled={loading || !cardName || !cardNumber || !cardExpiry || !cardCvv}
                            className="w-full bg-bakery-charcoal text-white hover:bg-bakery-crust py-4 rounded-2xl text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                          >
                            <CreditCard className="h-4 w-4" /> Pay ₹{totalAmount.toFixed(2)}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* STEP 3: SECURING ORDER / WEBHOOK SIMULATION LOADING */}
                {checkoutStep === 'simulating' && (
                  <motion.div
                    key="simulating"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                  >
                    <div className="relative">
                      <div className="h-20 w-20 bg-bakery-wheat/30 rounded-full flex items-center justify-center border border-bakery-wheat animate-pulse">
                        <Loader2 className="h-10 w-10 text-bakery-amber animate-spin" />
                      </div>
                    </div>
                    <h4 className="font-serif text-xl text-bakery-charcoal">Securing Transaction</h4>
                    <p className="text-xs text-bakery-charcoal/60 max-w-xs font-light">
                      Verifying payment signatures, reconciling bread counts with inventory, and updating your live sync store...
                    </p>
                  </motion.div>
                )}

                {/* STEP 4: SUCCESS CONFIRMATION */}
                {checkoutStep === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center space-y-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                      className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center border border-green-200"
                    >
                      <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </motion.div>
                    <h4 className="font-serif text-2xl text-bakery-charcoal">Bake Registered!</h4>
                    <span className="text-[10px] bg-green-100 text-green-800 px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                      Payment Confirmed
                    </span>
                    <p className="text-xs text-bakery-charcoal/60 max-w-xs font-light leading-relaxed">
                      Your order **`{orderId?.slice(0, 8)}`** is successfully recorded in the bakery logs. Check your phone app for immediate sync!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

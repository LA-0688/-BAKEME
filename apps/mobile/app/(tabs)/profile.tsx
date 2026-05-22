import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// ---------------------------------------------------------------
// Step 1: User enters their phone or email.
// Step 2: Supabase sends an OTP. User enters the 6-digit code.
// Step 3: Verified session is stored securely via expo-secure-store.
//
// JWT auto-refresh (configured in lib/supabase.ts) ensures the user
// never gets logged out mid-checkout, even if the token expires while
// they are browsing the catalog.
// ---------------------------------------------------------------

type OtpStep = 'enterContact' | 'enterOtp' | 'loggedIn';

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [step, setStep] = useState<OtpStep>('enterContact');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync the session state whenever auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setStep('loggedIn');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setStep(session ? 'loggedIn' : 'enterContact');
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ---------------------------------------------------------------
  // sendOtp: Determines if the user entered an email or phone number
  // and routes to the correct Supabase signInWithOtp method.
  // ---------------------------------------------------------------
  const sendOtp = async () => {
    if (!contact.trim()) {
      Alert.alert('Required', 'Please enter your email or phone number.');
      return;
    }
    setLoading(true);

    const isPhone = contact.trim().startsWith('+');
    const { error } = isPhone
      ? await supabase.auth.signInWithOtp({ phone: contact.trim() })
      : await supabase.auth.signInWithOtp({
          email: contact.trim(),
          options: { emailRedirectTo: 'lartisan://login' },
        });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setStep('enterOtp');
    }
  };

  // ---------------------------------------------------------------
  // verifyOtp: Verifies the 6-digit code sent to the user.
  // On success, the session is stored in SecureStore automatically.
  // ---------------------------------------------------------------
  const verifyOtp = async () => {
    if (otp.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the full 6-digit code.');
      return;
    }
    setLoading(true);

    const isPhone = contact.trim().startsWith('+');
    const { error } = isPhone
      ? await supabase.auth.verifyOtp({
          phone: contact.trim(),
          token: otp.trim(),
          type: 'sms',
        })
      : await supabase.auth.verifyOtp({
          email: contact.trim(),
          token: otp.trim(),
          type: 'email',
        });

    setLoading(false);

    if (error) {
      Alert.alert('Verification Failed', error.message);
    }
    // On success, onAuthStateChange listener above auto-handles state transition
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setContact('');
    setOtp('');
  };

  // ----------------------------------------------------------------
  // LOGGED-IN STATE
  // ----------------------------------------------------------------
  if (step === 'loggedIn' && session) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.headerEyebrow}>Your Account</Text>
            <Text style={styles.headerTitle}>Welcome back</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(session.user.email ?? session.user.phone ?? 'U')[0].toUpperCase()}
              </Text>
            </View>
            <Text style={styles.profileIdentifier} numberOfLines={1}>
              {session.user.email ?? session.user.phone}
            </Text>
            <Text style={styles.profileNote}>
              Your session is actively refreshing in the background.{'\n'}
              You will never be logged out mid-checkout.
            </Text>

            <View style={styles.jwtInfo}>
              <Text style={styles.jwtLabel}>JWT expires at</Text>
              <Text style={styles.jwtValue}>
                {new Date(session.expires_at! * 1000).toLocaleTimeString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={signOut}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------------------
  // STEP 1: Enter contact info
  // ----------------------------------------------------------------
  if (step === 'enterContact') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.inner}
        >
          <Animated.View entering={FadeIn.duration(400)}>
            <View style={styles.header}>
              <Text style={styles.headerEyebrow}>Secure Login</Text>
              <Text style={styles.headerTitle}>L'Artisan Access</Text>
            </View>

            <Text style={styles.subheading}>
              Enter your email or phone number. We'll send a one-time code — no password needed.
            </Text>

            <TextInput
              style={styles.input}
              value={contact}
              onChangeText={setContact}
              placeholder="+91 9876543210 or email@example.com"
              placeholderTextColor="#1C160E50"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <TouchableOpacity
              onPress={sendOtp}
              disabled={loading}
              activeOpacity={0.85}
              style={{ marginTop: 8 }}
            >
              <LinearGradient
                colors={loading ? ['#D9832480', '#8F531080'] : ['#D98324', '#8F5310']}
                style={styles.ctaBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.ctaBtnText}>Send Code</Text>
                    <Feather name="arrow-right" size={16} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------------------
  // STEP 2: Enter OTP
  // ----------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={styles.header}>
            <Text style={styles.headerEyebrow}>Verification</Text>
            <Text style={styles.headerTitle}>Enter Code</Text>
          </View>

          <Text style={styles.subheading}>
            We sent a 6-digit code to{'\n'}
            <Text style={{ fontFamily: 'Inter-SemiBold', color: '#D98324' }}>
              {contact}
            </Text>
          </Text>

          <TextInput
            style={[styles.input, styles.otpInput]}
            value={otp}
            onChangeText={setOtp}
            placeholder="000000"
            placeholderTextColor="#1C160E30"
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity
            onPress={verifyOtp}
            disabled={loading}
            activeOpacity={0.85}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={loading ? ['#D9832480', '#8F531080'] : ['#D98324', '#8F5310']}
              style={styles.ctaBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.ctaBtnText}>Verify & Sign In</Text>
                  <Feather name="arrow-right" size={16} color="#FFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setStep('enterContact'); setOtp(''); }}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>← Use a different address</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFBF7',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerEyebrow: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#8F5310',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 34,
    color: '#1C160E',
    lineHeight: 40,
  },
  subheading: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1C160E80',
    lineHeight: 22,
    marginBottom: 28,
  },
  input: {
    backgroundColor: '#F5ECE1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#1C160E',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  otpInput: {
    fontSize: 28,
    letterSpacing: 12,
    textAlign: 'center',
    fontFamily: 'PlayfairDisplay-Bold',
  },
  ctaBtn: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#D98324',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaBtnDisabled: {
    opacity: 0.6,
  },
  ctaBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  backLinkText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#1C160E60',
  },
  // Logged-in state
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 236, 225, 0.5)',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    shadowColor: '#1C160E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F5ECE1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: '#D98324',
  },
  profileIdentifier: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1C160E',
    maxWidth: '90%',
    textAlign: 'center',
  },
  profileNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#1C160E60',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  jwtInfo: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#F5ECE1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  jwtLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#1C160E60',
  },
  jwtValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#D98324',
  },
  signOutBtn: {
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: '#F5ECE1',
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    letterSpacing: 0.5,
    color: '#1C160E80',
  },
});

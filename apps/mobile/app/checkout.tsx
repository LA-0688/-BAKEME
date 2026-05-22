import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useCartStore } from '../store/cartStore';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function CheckoutScreen() {
  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totalINR = (subtotal * 83).toFixed(2); // Convert to INR

  // Ensure amount has at most 2 decimal places and is valid
  const upiId = 'bakery@upi';
  const payeeName = encodeURIComponent("L'Artisan Bakery");
  const upiUrl = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${totalINR}&cu=INR`;
  
  // Use a reliable QR Code API to generate the QR image
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}&margin=10`;

  const handleFinish = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${apiUrl}/api/ai/orchestrator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `mob_${Math.random().toString(36).substring(2, 10)}`,
          items: items.map(i => ({ itemName: i.product.name, quantity: i.quantity })),
          totalAmount: subtotal,
          customer: { phone: 'Unknown Mobile User', name: 'Mobile Customer' },
          deliveryType: 'pickup',
          scheduledTime: 'ASAP',
        })
      });
    } catch (e) {
      console.warn('Orchestrator ping failed', e);
    }
    clearCart();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Checkout',
        headerStyle: { backgroundColor: '#FCFBF7' },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: 'PlayfairDisplay-Bold', color: '#1C160E' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#1C160E" />
          </TouchableOpacity>
        )
      }} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Payment</Text>
          <Text style={styles.subtitle}>Scan the QR Code with Google Pay, PhonePe, or any UPI app to pay.</Text>
        </View>

        <View style={styles.qrContainer}>
          <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} />
          <View style={styles.amountBadge}>
            <Text style={styles.amountText}>₹{totalINR}</Text>
          </View>
        </View>

        <View style={styles.instructions}>
          <View style={styles.instructionRow}>
            <Feather name="smartphone" size={20} color="#8F5310" />
            <Text style={styles.instructionText}>Open your UPI app</Text>
          </View>
          <View style={styles.instructionRow}>
            <Feather name="maximize" size={20} color="#8F5310" />
            <Text style={styles.instructionText}>Scan this QR code</Text>
          </View>
          <View style={styles.instructionRow}>
            <Feather name="check-circle" size={20} color="#8F5310" />
            <Text style={styles.instructionText}>Confirm the payment</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} onPress={handleFinish}>
          <LinearGradient
            colors={['#1C160E', '#2D2416']}
            style={styles.doneBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.doneBtnText}>I've completed the payment</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFBF7',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: '#1C160E',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1C160E80',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#1C160E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 236, 225, 0.8)',
    alignItems: 'center',
    marginBottom: 40,
  },
  qrCode: {
    width: 220,
    height: 220,
  },
  amountBadge: {
    backgroundColor: '#F5ECE1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: 20,
  },
  amountText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#8F5310',
  },
  instructions: {
    width: '100%',
    gap: 16,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5ECE1',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#1C160E',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  doneBtn: {
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});

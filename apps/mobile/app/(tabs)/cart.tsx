import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Animated, {
  FadeInRight,
  SlideOutRight,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen() {
  const { items, removeItem } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const handleRemove = async (productId: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await removeItem(productId);
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>Live Sync · Supabase</Text>
          <Text style={styles.headerTitle}>Your Basket</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛍️</Text>
          <Text style={styles.emptyTitle}>Your basket is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items from the Catalog tab.{'\n'}Items will sync instantly to the web app.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerEyebrow}>Live Sync · Supabase</Text>
            <Text style={styles.headerTitle}>Your Basket</Text>
          </View>
          {/* Live sync indicator */}
          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Synced</Text>
          </View>
        </View>
      </View>

      {/* Item List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        itemLayoutAnimation={Layout.springify()}
        renderItem={({ item }) => (
          <Animated.View
            entering={FadeInRight.duration(350)}
            exiting={SlideOutRight.duration(250)}
            style={styles.cartRow}
          >
            <Image
              source={{ uri: item.product.image_url }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={styles.itemCategory}>{item.product.category}</Text>
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemPrice}>
                ₹{(item.product.price * item.quantity * 83).toFixed(0)}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemove(item.product.id)}
                style={styles.removeBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      />

      {/* Sticky Checkout Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalAmount}>₹{(subtotal * 83).toFixed(0)}</Text>
        </View>
        <Text style={styles.footerNote}>
          Taxes calculated at checkout · Synced across your devices
        </Text>
        <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE140',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
    fontSize: 30,
    color: '#1C160E',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#22c55e18',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  syncText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: '#22c55e',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 180,
    gap: 12,
  },
  cartRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F5ECE1',
    alignItems: 'center',
    gap: 12,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 14,
    color: '#1C160E',
  },
  itemCategory: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#8F5310',
  },
  itemQty: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#1C160E80',
    marginTop: 4,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  itemPrice: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 15,
    color: '#1C160E',
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
  },
  removeBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: '#dc2626',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FCFBF7',
    borderTopWidth: 1,
    borderTopColor: '#F5ECE1',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    gap: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1C160E80',
  },
  totalAmount: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 22,
    color: '#1C160E',
  },
  footerNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#1C160E50',
    lineHeight: 14,
  },
  checkoutBtn: {
    backgroundColor: '#D98324',
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: 'center',
    marginTop: 4,
  },
  checkoutBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 22,
    color: '#1C160E',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#1C160E60',
    textAlign: 'center',
    lineHeight: 20,
  },
});

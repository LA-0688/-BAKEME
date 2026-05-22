import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import { useCartStore, CartProduct } from '../../store/cartStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');

// ---------------------------------------------------------------
// ProductCard: native-optimized card with press-scale animation
// and haptic feedback — replaces web's heavy hover animations.
// ---------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ProductCard({
  product,
  index,
}: {
  product: CartProduct;
  index: number;
}) {
  const { addItem } = useCartStore();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const handleAddToCart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addItem(product);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(500).springify()}
      style={[styles.cardContainer, animatedStyle]}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageGradient}
          />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.productPrice}>
              ₹{(product.price * 83).toFixed(0)}
            </Text>
            <TouchableOpacity
              onPress={handleAddToCart}
              style={styles.addButton}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={14} color="#FFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------
// CatalogScreen: Fetches products from Supabase and renders them
// in a 2-column native grid with pull-to-refresh.
// ---------------------------------------------------------------
export default function CatalogScreen() {
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CatalogScreen] fetch error:', error.message);
    } else {
      setProducts(data as CartProduct[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D98324" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>Fresh from the oven</Text>
        <Text style={styles.headerTitle}>The Daily Counter</Text>
      </View>

      {/* Product Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D98324"
            colors={['#D98324']}
          />
        }
        renderItem={({ item, index }) => (
          <ProductCard product={item} index={index} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🥖</Text>
            <Text style={styles.emptyText}>
              All loaves have sold out today. Pull to refresh!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFBF7', // bakery-cream
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCFBF7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  headerEyebrow: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#8F5310', // bakery-amber
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 34,
    color: '#1C160E',  // bakery-charcoal
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    maxWidth: (SCREEN_W - 48) / 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#1C160E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 236, 225, 0.5)',
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(252, 251, 247, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#8F5310',
  },
  cardContent: {
    padding: 14,
    gap: 4,
  },
  productName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 15,
    color: '#1C160E',
    lineHeight: 20,
  },
  productDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#1C160E80',
    lineHeight: 16,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  productPrice: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    color: '#1C160E',
  },
  addButton: {
    backgroundColor: '#D98324',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1C160E60',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
});

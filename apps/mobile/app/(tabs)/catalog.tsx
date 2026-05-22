import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Pressable,
  Dimensions,
  ActivityIndicator,
  ScrollView,
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
const PADDING = 16;
const CONTENT_WIDTH = SCREEN_W - PADDING * 2;

// ---------------------------------------------------------------
// BentoCard: Adaptive card that changes dimensions based on layout
// ---------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type LayoutType = 'hero' | 'portrait' | 'standard';

function BentoCard({
  product,
  index,
  layoutType,
}: {
  product: CartProduct;
  index: number;
  layoutType: LayoutType;
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

  // Determine styles based on layoutType
  const isHero = layoutType === 'hero';
  const isPortrait = layoutType === 'portrait';
  
  const containerStyle = [
    styles.cardContainer,
    isHero && { width: CONTENT_WIDTH, height: 320 },
    isPortrait && { flex: 1, height: 260 },
    layoutType === 'standard' && { width: (CONTENT_WIDTH - 16) / 2, height: 260 },
  ];

  const imageContainerStyle = [
    styles.imageContainer,
    isHero && { height: 180 },
    (isPortrait || layoutType === 'standard') && { height: 130 },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(500).springify()}
      style={[containerStyle, animatedStyle]}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* Product Image */}
        <View style={imageContainerStyle}>
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
          <Text style={[styles.productName, isHero && { fontSize: 20 }]} numberOfLines={isHero ? 1 : 2}>
            {product.name}
          </Text>
          <Text style={[styles.productDescription, isHero && { fontSize: 13 }]} numberOfLines={2}>
            {product.description}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={[styles.productPrice, isHero && { fontSize: 20 }]}>
              ₹{product.price.toFixed(2)}
            </Text>
            <TouchableOpacity
              onPress={handleAddToCart}
              style={[styles.addButton, isHero && { paddingHorizontal: 16, paddingVertical: 10 }]}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={isHero ? 16 : 14} color="#FFF" />
              {isHero && <Text style={[styles.addButtonText, { fontSize: 12 }]}>Add to Cart</Text>}
              {!isHero && <Text style={styles.addButtonText}>Add</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------
// CatalogScreen: Renders products in a highly styled Bento Grid
// ---------------------------------------------------------------

const FALLBACK_PRODUCTS = [
  {
    id: 'sourdough-country-loaf',
    name: 'Sourdough Country Loaf',
    price: 290.00,
    category: 'Sourdough',
    image_url: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&q=80&w=800',
    description: '36-hour slow-fermented heirloom wheat, bold caramelized crust, airy open crumb, and robust wild levain tang.',
    is_available: true,
    stock: 12,
  },
  {
    id: 'sprouted-ragi-sourdough',
    name: 'Sprouted Ragi Sourdough',
    price: 240.00,
    category: 'Sourdough',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    description: 'Deeply nutritious sprouted finger millet (Ragi) sourdough, dense mineral-rich crumb, earthy rustic aroma, and complex whole-grain notes.',
    is_available: true,
    stock: 15,
  },
  {
    id: 'multi-millet-gf-sourdough',
    name: 'Multi Millet Gluten Free Sourdough',
    price: 260.00,
    category: 'Sourdough',
    image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=800',
    description: 'Crafted with ancient superfood millets: sorghum, pearl millet, and amaranth. Fully gluten-free with a delicate moist interior and toasted gold crust.',
    is_available: true,
    stock: 10,
  },
  {
    id: 'sourdough-focaccia',
    name: 'Sourdough Focaccia',
    price: 180.00,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Focaccia_al_rosmarino_01.jpg',
    description: 'Naturally fermented sheet-baked focaccia infused with organic extra virgin olive oil, fresh hand-picked rosemary, and coarse sea salt crystals.',
    is_available: true,
    stock: 8,
  },
];

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
    }

    const dbProducts = (data || []).filter((p) => {
      const isCroissantCategory = p.category === 'Croissants';
      const isActualCroissant = isCroissantCategory && !p.name.toLowerCase().includes('focaccia');
      const hasCroissantInName = p.name.toLowerCase().includes('croissant');
      const isDuplicateCountrySourdough = p.name.toLowerCase().includes('country sourdough') || p.name.toLowerCase().includes('sourdough country');
      const isUSDTemplateProduct = p.price < 50;

      return !isActualCroissant && !hasCroissantInName && !isDuplicateCountrySourdough && !isUSDTemplateProduct;
    });

    const merged = [...FALLBACK_PRODUCTS];

    dbProducts.forEach((dbProd) => {
      const exists = FALLBACK_PRODUCTS.some(
        (sig) => sig.name.toLowerCase() === dbProd.name.toLowerCase()
      );
      if (!exists) {
        merged.push(dbProd);
      }
    });

    setProducts(merged as CartProduct[]);
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
        <Text style={styles.headerEyebrow}>Freshly Baked Daily</Text>
        <Text style={styles.headerTitle}>The Daily Counter</Text>
        <Text style={styles.headerSubtitle}>
          Explore our curated small-batch breads, hand-rolled pastries, and classic beverages.
        </Text>
      </View>

      <ScrollView
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
      >
        {/* Japanese Shokupan Section */}
        <View style={styles.shokupanSection}>
          <Text style={styles.shokupanEyebrow}>Signature Baking Art</Text>
          <Text style={styles.shokupanTitle}>Pillowy Soft Japanese Milk Bread</Text>
          <Text style={styles.shokupanDesc}>
            Our legendary Japanese Shokupan milk bread is baked fresh at 4 AM every morning. Made with organic cream, sweet honey, and imported Japanese wheat.
          </Text>
          <View style={styles.shokupanBadge}>
            <Feather name="star" size={14} color="#D98324" />
            <Text style={styles.shokupanBadgeText}>Available Daily</Text>
          </View>
        </View>
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🥖</Text>
            <Text style={styles.emptyText}>
              All loaves have sold out today. Pull to refresh!
            </Text>
          </View>
        ) : (
          <View style={styles.bentoContainer}>
            {/* 1. Hero Landscape */}
            {products[0] && (
              <BentoCard product={products[0]} index={0} layoutType="hero" />
            )}

            {/* 2. Portrait Side-by-Side */}
            {(products[1] || products[2]) && (
              <View style={styles.bentoRow}>
                {products[1] && <BentoCard product={products[1]} index={1} layoutType="portrait" />}
                {products[2] && <BentoCard product={products[2]} index={2} layoutType="portrait" />}
              </View>
            )}

            {/* 3. Secondary Hero Landscape */}
            {products[3] && (
              <BentoCard product={products[3]} index={3} layoutType="hero" />
            )}

            {/* 4. More Specials Divider */}
            {products.length > 4 && (
              <View style={styles.dividerContainer}>
                <Text style={styles.headerEyebrow}>Specialty Collections</Text>
                <Text style={styles.headerTitle}>More Specials</Text>
              </View>
            )}

            {/* 5. Standard Grid for remaining */}
            {products.length > 4 && (
              <View style={styles.standardGrid}>
                {products.slice(4).map((item, idx) => (
                  <BentoCard key={item.id} product={item} index={idx + 4} layoutType="standard" />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: PADDING,
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
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#1C160E80',
    marginTop: 8,
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: PADDING,
    paddingTop: 0,
    paddingBottom: 100,
  },
  shokupanSection: {
    backgroundColor: 'rgba(217, 131, 36, 0.05)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 131, 36, 0.2)',
  },
  shokupanEyebrow: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#D98324',
    marginBottom: 8,
  },
  shokupanTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 24,
    color: '#1C160E',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
  },
  shokupanDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(28, 22, 14, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  shokupanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#1C160E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  shokupanBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#1C160E',
  },
  bentoContainer: {
    gap: 16,
    flexDirection: 'column',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  standardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  dividerContainer: {
    marginTop: 24,
    marginBottom: 8,
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(245, 236, 225, 1)',
  },
  cardContainer: {
    // Width and Height are dynamically set based on layoutType
  },
  card: {
    flex: 1,
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
    width: '100%',
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
    backgroundColor: 'rgba(252, 251, 247, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 15,
    color: '#1C160E',
    lineHeight: 22,
    marginBottom: 4,
  },
  productDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#1C160E80',
    lineHeight: 16,
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

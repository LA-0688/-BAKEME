import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useCartStore } from '../../store/cartStore';

// Premium icon components (inline SVG-style using React Native Views)
// avoids an extra icon library dependency
const CatalogIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
    <Text style={[styles.emoji, focused && styles.emojiActive]}>🥐</Text>
  </View>
);

const CartIcon = ({ focused }: { focused: boolean }) => {
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.emoji, focused && styles.emojiActive]}>🛍️</Text>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
};

const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
    <Text style={[styles.emoji, focused && styles.emojiActive]}>👤</Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#D98324',       // bakery-crust golden orange
        tabBarInactiveTintColor: '#1C160E99',   // bakery-charcoal at 60% opacity
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ focused }) => <CatalogIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Basket',
          tabBarIcon: ({ focused }) => <CartIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FCFBF7',    // bakery-cream
    borderTopColor: '#F5ECE140',   // bakery-wheat at 25% opacity
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 8,
    height: 68,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 36,
    height: 28,
  },
  iconWrapActive: {},
  emoji: {
    fontSize: 20,
    opacity: 0.5,
  },
  emojiActive: {
    opacity: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#D98324',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FCFBF7',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Inter-SemiBold',
  },
});

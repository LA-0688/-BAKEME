import { Tabs } from 'expo-router';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useCartStore } from '../../store/cartStore';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

const CatalogIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.iconWrap}>
    <Feather name="coffee" size={22} color={focused ? '#D98324' : '#1C160E80'} />
  </View>
);

const CartIcon = ({ focused }: { focused: boolean }) => {
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  return (
    <View style={styles.iconWrap}>
      <Feather name="shopping-bag" size={22} color={focused ? '#D98324' : '#1C160E80'} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
};

const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.iconWrap}>
    <Feather name="user" size={22} color={focused ? '#D98324' : '#1C160E80'} />
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: '#D98324',
        tabBarInactiveTintColor: '#1C160E80',
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
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 10,
  },
  tabLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 30,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -2,
    backgroundColor: '#D98324',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FCFBF7',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Inter-SemiBold',
  },
});

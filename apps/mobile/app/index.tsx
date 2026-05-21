import { Redirect } from 'expo-router';

// Root index redirects directly to the Catalog tab
export default function Index() {
  return <Redirect href="/(tabs)/catalog" />;
}

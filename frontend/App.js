import React, { useEffect } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FamilyBubble from './FamilyBubble'; // Assuming FamilyBubble.jsx is now a component
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const Stack = createNativeStackNavigator();

function App() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    // Platform-specific API keys
    const iosApiKey = 'test_ZUBBwQojxkZCoVcCxjqjtUdSdzr';
    const androidApiKey = 'test_ZUBBwQojxkZCoVcCxjqjtUdSdzr';

    if (Platform.OS === 'ios') {
       Purchases.configure({apiKey: iosApiKey});
    } else if (Platform.OS === 'android') {
       Purchases.configure({apiKey: androidApiKey});
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Bubble" component={FamilyBubble} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Home Screen</Text>
        <Button
          title="Go to Bubble"
          onPress={() => navigation.navigate('Bubble')}
        />
      </View>
    );
}

export default App;

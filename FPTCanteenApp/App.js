import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import AuthStack from './src/navigation/AuthStack';
import { LogBox } from 'react-native';

// --- ẨN CẢNH BÁO "Text strings must be rendered within a <Text> component" ---
LogBox.ignoreLogs([
    "Warning: Text strings must be rendered within a <Text> component.",
]);
// -------------------------------------------------------------------------

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AuthStack />
            </NavigationContainer>
        </AuthProvider>
    );
} 
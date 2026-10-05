import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useBiometricAuth } from '../hooks/useBiometricAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const biometric = useBiometricAuth();

  // Verificar si hay credenciales guardadas para login biométrico
  useEffect(() => {
    const checkSavedCredentials = async () => {
      const savedEmail = await SecureStore.getItemAsync('user_email');
      if (savedEmail && biometric.isSupported) {
        // Mostrar botón de login biométrico
      }
    };
    checkSavedCredentials();
  }, [biometric.isSupported]);

  // Login tradicional con email/contraseña
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      // Simulación de autenticación (en producción, llamar a tu API/SQLite)
      // Aquí validarías contra tu base de datos SQLite
      const isValid = email === 'usuario@test.com' && password === '123456';

      if (isValid) {
        // Guardar credenciales de forma segura para login biométrico posterior
        await SecureStore.setItemAsync('user_email', email);
        await SecureStore.setItemAsync('user_password', password);
        await SecureStore.setItemAsync('is_logged_in', 'true');

        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Login con biometría
  const handleBiometricLogin = async () => {
    setIsLoading(true);
    try {
      const success = await biometric.authenticate();

      if (success) {
        const savedEmail = await SecureStore.getItemAsync('user_email');
        const savedPassword = await SecureStore.getItemAsync('user_password');

        if (savedEmail && savedPassword) {
          await SecureStore.setItemAsync('is_logged_in', 'true');
          router.replace('/(tabs)');
        } else {
          Alert.alert('Error', 'No hay credenciales guardadas. Inicia sesión con contraseña primero.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Autenticación biométrica fallida');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si hay credenciales guardadas
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  useEffect(() => {
    const check = async () => {
      const saved = await SecureStore.getItemAsync('user_email');
      setHasSavedCredentials(!!saved);
    };
    check();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejercicio Hooks</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      {/* Formulario de login tradicional */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      {/* Botón de login biométrico (solo si está disponible) */}
      {biometric.isSupported && hasSavedCredentials && (
        <TouchableOpacity
          style={[styles.button, styles.biometricButton]}
          onPress={handleBiometricLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {biometric.biometricType === 'face' ? '🔒 Usar Face ID' : '🔒 Usar Huella'}
          </Text>
        </TouchableOpacity>
      )}

      {biometric.error && (
        <Text style={styles.error}>{biometric.error}</Text>
      )}

      {!biometric.isSupported && (
        <Text style={styles.info}>
          Biometría no disponible en este dispositivo
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  biometricButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
  info: {
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
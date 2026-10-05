import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useCamera } from '../../hooks/useCamera';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { useShake } from '../../hooks/useShake';

export default function HomeScreen() {
  const [shakeCount, setShakeCount] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const geo = useGeoLocation();
  const camera = useCamera();

  const shake = useShake({
    onShake: () => setShakeCount(prev => prev + 1),
  });

  // Verificar sesión al montar
  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await SecureStore.getItemAsync('is_logged_in');
      if (isLoggedIn !== 'true') {
        router.replace('/login');
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  // Cerrar sesión
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('is_logged_in');
    await SecureStore.deleteItemAsync('user_email');
    await SecureStore.deleteItemAsync('user_password');
    router.replace('/login');
  };

  // Geolocalización en contexto
  const handleGetLocation = async () => {
    if (geo.permissionStatus !== 'granted') {
      const status = await geo.requestPermission();
      if (status !== 'granted') return;
    }
    await geo.getCurrentLocation();
  };

  // Cámara en contexto
  const handleOpenCamera = async () => {
    if (camera.permissionStatus !== 'granted') {
      const result = await camera.requestCameraPermission();
      if (!result?.granted) return;
    }
    setShowCamera(true);
  };

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header con botón de cerrar sesión */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ejercicio Hooks</Text>
        <Button title="Cerrar Sesión" onPress={handleLogout} color="red" />
      </View>

      {/* ===== Geolocalización ===== */}
      <View style={styles.section}>
        <Text style={styles.title}>📍 Geolocalización</Text>
        <Text style={styles.status}>Estado: {geo.permissionStatus}</Text>

        {geo.error && <Text style={styles.error}>{geo.error}</Text>}

        {geo.location && (
          <Text style={styles.data}>
            Lat: {geo.location.coords.latitude.toFixed(4)}
            {'\n'}
            Lng: {geo.location.coords.longitude.toFixed(4)}
          </Text>
        )}

        {geo.permissionStatus === 'blocked' && (
          <Button
            title="Abrir Ajustes"
            onPress={geo.openSettings}
            color="orange"
          />
        )}

        <View style={styles.buttonSpacer} />
        <Button title="Obtener Ubicación" onPress={handleGetLocation} />
      </View>

      {/* ===== Cámara ===== */}
      <View style={styles.section}>
        <Text style={styles.title}>📷 Cámara</Text>
        <Text style={styles.status}>Estado: {camera.permissionStatus}</Text>

        {camera.error && <Text style={styles.error}>{camera.error}</Text>}

        {camera.permissionStatus === 'blocked' && (
          <Button
            title="Abrir Ajustes"
            onPress={camera.openSettings}
            color="orange"
          />
        )}

        <View style={styles.buttonSpacer} />

        {!showCamera ? (
          <Button title="Abrir Cámara" onPress={handleOpenCamera} />
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView style={styles.camera} facing="back" />
            <View style={styles.buttonSpacer} />
            <Button
              title="Cerrar Cámara"
              onPress={() => setShowCamera(false)}
              color="gray"
            />
          </View>
        )}
      </View>

      {/* ===== Shake ===== */}
      <View style={styles.section}>
        <Text style={styles.title}>📳 Shake</Text>
        <Text style={styles.status}>Sacudidas detectadas: {shakeCount}</Text>

        {shake.error && <Text style={styles.error}>{shake.error}</Text>}

        {shake.isAvailable === false && (
          <Text style={styles.error}>Sensor no disponible en este dispositivo</Text>
        )}

        <Text style={styles.hint}>Sacude el dispositivo para probar</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  data: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  error: {
    color: 'red',
    marginVertical: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttonSpacer: {
    height: 8,
  },
  cameraContainer: {
    height: 300,
    marginTop: 8,
  },
  camera: {
    flex: 1,
    borderRadius: 8,
  },
});
import { useCameraPermissions } from 'expo-camera';
import { useCallback, useState } from 'react';
import { Linking, Platform } from 'react-native';

export type CameraPermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

export function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);

  // Mapear el estado de expo-camera a nuestros tipos
  const permissionStatus: CameraPermissionStatus = permission === null
    ? 'undetermined'
    : permission.granted
      ? 'granted'
      : permission.canAskAgain
        ? 'denied'
        : 'blocked';

  // Solicitar permiso en contexto
  const requestCameraPermission = useCallback(async () => {
    try {
      setError(null);
      const result = await requestPermission();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al solicitar permiso de cámara';
      setError(message);
      return null;
    }
  }, [requestPermission]);

  // Abrir ajustes del sistema
  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  return {
    permission,
    permissionStatus,
    requestCameraPermission,
    error,
    openSettings,
  };
}
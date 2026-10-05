import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

interface GeoLocationState {
  location: Location.LocationObject | null;
  error: string | null;
  permissionStatus: PermissionStatus;
}

export function useGeoLocation() {
  const [state, setState] = useState<GeoLocationState>({
    location: null,
    error: null,
    permissionStatus: 'undetermined',
  });

  // Verificar estado actual del permiso
  const checkPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setState(prev => ({ ...prev, permissionStatus: status as PermissionStatus }));
    return status;
  }, []);

  // Solicitar permiso (en contexto)
  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setState(prev => ({ ...prev, permissionStatus: status as PermissionStatus }));
    return status;
  }, []);

  // Obtener ubicación actual
  const getCurrentLocation = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState(prev => ({ ...prev, location, error: null }));
      return location;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener ubicación';
      setState(prev => ({ ...prev, error: message }));
      return null;
    }
  }, []);

  // Suscribirse a cambios de ubicación (con limpieza)
  const watchLocation = useCallback(async (callback?: (location: Location.LocationObject) => void) => {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        setState(prev => ({ ...prev, location, error: null }));
        callback?.(location);
      }
    );

    // Retorna la función de limpieza
    return () => {
      subscription.remove();
    };
  }, []);

  // Verificar permiso al montar (sin solicitarlo automáticamente)
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Abrir ajustes del sistema
  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  return {
    ...state,
    checkPermission,
    requestPermission,
    getCurrentLocation,
    watchLocation,
    openSettings,
  };
}
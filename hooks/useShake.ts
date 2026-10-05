import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';

interface ShakeOptions {
  threshold?: number;
  timeout?: number;
  onShake: () => void;
}

export function useShake({ threshold = 1.5, timeout = 1000, onShake }: ShakeOptions) {
  const lastShakeTime = useRef<number>(0);
  const subscription = useRef<ReturnType<typeof DeviceMotion.addListener> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const handleMotion = useCallback(
    (data: DeviceMotionMeasurement) => {
      const { acceleration } = data;
      if (!acceleration) return;

      const { x, y, z } = acceleration;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      const now = Date.now();
      if (magnitude > threshold && now - lastShakeTime.current > timeout) {
        lastShakeTime.current = now;
        onShake();
      }
    },
    [threshold, timeout, onShake]
  );

  useEffect(() => {
    let active = true;

    const startListening = async () => {
      try {
        const available = await DeviceMotion.isAvailableAsync();
        setIsAvailable(available);

        if (!available) {
          setError('Sensor de movimiento no disponible en este dispositivo');
          return;
        }

        if (Platform.OS === 'ios') {
          const { status } = await DeviceMotion.getPermissionsAsync();
          if (status !== 'granted') {
            const { status: newStatus } = await DeviceMotion.requestPermissionsAsync();
            if (newStatus !== 'granted') {
              setError('Permiso de movimiento denegado. La función de shake no estará disponible.');
              return;
            }
          }
        }

        if (!active) return;

        DeviceMotion.setUpdateInterval(100);
        subscription.current = DeviceMotion.addListener(handleMotion);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al iniciar sensor de movimiento';
        setError(message);
      }
    };

    startListening();

    return () => {
      active = false;
      if (subscription.current) {
        subscription.current.remove();
        subscription.current = null;
      }
      DeviceMotion.removeAllListeners();
    };
  }, [handleMotion]);

  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  return { error, isAvailable, openSettings };  // ✅ ESTO ES CLAVE
}
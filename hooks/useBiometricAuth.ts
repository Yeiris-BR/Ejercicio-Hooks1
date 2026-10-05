import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useState } from 'react';

interface BiometricState {
  isSupported: boolean;
  isEnrolled: boolean;
  biometricType: 'face' | 'fingerprint' | 'none';
  error: string | null;
}

export function useBiometricAuth() {
  const [state, setState] = useState<BiometricState>({
    isSupported: false,
    isEnrolled: false,
    biometricType: 'none',
    error: null,
  });

  // Verificar disponibilidad de biometría al montar
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

        let type: 'face' | 'fingerprint' | 'none' = 'none';
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          type = 'face';
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          type = 'fingerprint';
        }

        setState({
          isSupported: hasHardware && enrolled,
          isEnrolled: enrolled,
          biometricType: type,
          error: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al verificar biometría';
        setState(prev => ({ ...prev, error: message }));
      }
    };

    checkBiometrics();
  }, []);

  // Autenticar con biometría
  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentícate para acceder a la app',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        setState(prev => ({ ...prev, error: 'Autenticación cancelada o fallida' }));
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error en autenticación biométrica';
      setState(prev => ({ ...prev, error: message }));
      return false;
    }
  }, []);

  return {
    ...state,
    authenticate,
  };
}
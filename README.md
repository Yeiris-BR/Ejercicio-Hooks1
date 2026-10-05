# Custom Hooks con Manejo de Permisos — Semana 6

Proyecto de demostración con tres Custom Hooks nativos en React Native/Expo:
- `useGeoLocation` — Ubicación con manejo de permisos.
- `useCamera` — Cámara con manejo de permisos.
- `useShake` — Detección de shake con limpieza automática.

## Instalación

```bash
npx expo install expo-location expo-camera expo-sensors expo-local-authentication expo-sqlite
npx expo start
```

## Verificación de requisitos

-  La app pide permisos en contexto (botones, no al abrir).
-  Negar ubicación no afecta a la cámara.
-  Botón "Abrir Ajustes" cuando el permiso está bloqueado.
-  Todas las suscripciones (GPS, acelerómetro) se limpian al salir.
-  Hooks tipados, sin `any`.

## Capturas de pantalla

> Insertar capturas o GIF de los tres estados de permiso:
> 1. **Concedido** — Permiso aceptado, funcionalidad activa.
> 2. **Rechazado** — Permiso denegado pero se puede volver a preguntar.
> 3. **Bloqueado** — Permiso denegado permanentemente, botón "Abrir Ajustes" visible.
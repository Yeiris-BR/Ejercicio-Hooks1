# AI-LOG — Semana 6

## Uso de IA en el desarrollo

### Asistente utilizado
DeepSeek / Claude / ChatGPT (selecciona el que uses)

### Prompts clave
1. "¿Cómo implementar un Custom Hook en React Native/Expo que maneje permisos de ubicación y limpie suscripciones al desmontar?"
2. "¿Cómo detectar shake con expo-sensors y limpiar el listener correctamente?"
3. "¿Cómo diferenciar entre permiso denegado y bloqueado en expo-camera?"

### Soluciones aportadas por IA
- Estructura base de los tres hooks con manejo de estados de permiso.
- Patrón de limpieza de suscripciones con `useEffect` y referencias.
- Mapeo de estados de `expo-camera` a tipos unificados.

### Ajustes manuales realizados
- Corrección de tipos para evitar `any`.
- Añadida verificación de disponibilidad del sensor de movimiento.
- Integración de `openSettings` con Linking nativo.

### Aprendizajes
- Los permisos siempre se solicitan en contexto (al presionar un botón), nunca al montar.
- La limpieza de suscripciones es crítica para evitar memory leaks.
- El estado `blocked` requiere abrir ajustes manualmente.
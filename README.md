# FitAdapt

App móvil de entrenamiento adaptativo construida con React Native y Expo. Genera rutinas de ejercicio personalizadas según el perfil físico, nivel de experiencia, equipo disponible y lesiones del usuario, y ajusta las recomendaciones en función de la fatiga acumulada en sesiones previas.

## Funcionalidades

- **Onboarding guiado**: perfil físico, experiencia, horario, equipo disponible y lesiones.
- **Motor de recomendación**: selecciona y puntúa ejercicios considerando fatiga, objetivos y restricciones del usuario (`logic/recommender`).
- **Sesiones de entrenamiento activas**: temporizadores de descanso, series por intervalos, registro de RPE y resumen de sesión (`app/workout`).
- **Seguimiento de progreso**: calorías, récords personales y pistas adaptativas basadas en el historial (`logic/session`).
- **Persistencia local**: base de datos SQLite on-device con migraciones y repositorios (`db/`).
- **Notificaciones**: recordatorios de entrenamiento y avisos de descanso (`notifications/`).

## Stack

- [Expo](https://expo.dev) + React Native
- [Expo Router](https://docs.expo.dev/router/introduction/) para navegación basada en archivos
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) para persistencia local
- TypeScript

## Cómo correr el proyecto

```bash
npm install
npm start
```

Luego elige la plataforma:

```bash
npm run android   # Android
npm run ios       # iOS
npm run web       # Web
```

## Tests

```bash
npm test
```

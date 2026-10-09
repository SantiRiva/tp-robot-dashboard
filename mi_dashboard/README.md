# Frontend React del TP05

Desde esta carpeta ejecutar:

```powershell
npm install
npm run dev
```

Consultar el README de la raíz del repositorio para iniciar el simulador y conectar el dashboard.

- `src/App.jsx`: pantalla y conexión HTTP/WebSocket.
- `src/index.css`: estilos adaptables.
- `src/main.jsx`: entrada de React.

Verificación: `npm run lint` y `npm run build`.

### Historial de inclinación

El dashboard muestra roll, pitch y yaw de la IMU en grados, con tres líneas y sus valores actuales. Conserva las últimas 120 muestras por conexión, independientemente de la frecuencia de recepción (supera el mínimo de 60 del enunciado). El eje horizontal indica los segundos respecto de la última lectura. El historial se limpia al desconectar o reconectar; no une valores ausentes, pausas de 2 segundos o más ni saltos angulares mayores a 180 grados.

### Batería (BMS)

El panel muestra carga (%), corriente (mA), temperatura (°C) y voltaje de cada celda (V) recibidos por WebSocket. Las celdas usan barras con escala compartida y valores con tres decimales. Al desconectar se limpian las lecturas; los campos ausentes aparecen como Sin dato y una lista vacía de celdas se informa explícitamente. Los ceros enviados por el simulador se conservan sin inventar lecturas.

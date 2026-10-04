# TP Robot Dashboard

Frontend React para Desarrollo de Aplicaciones II (UADE).

## Ejecutar el frontend

Requiere Node.js 22.12 o superior compatible con Vite 8.

```powershell
cd mi_dashboard
npm install
npm run dev
```

Abrir la dirección que muestra Vite (habitualmente http://localhost:5173).
En PowerShell, si la política bloquea npm.ps1, usar npm.cmd en lugar de npm.

## Conectar el robot

1. En el paquete UadeRobotLab, abrir `05LaboratoriosTPs/TP05_Desarrollo_de_Aplicaciones_II/INICIAR_TP05.bat`.
2. Elegir Go2 o G1 y mantener el entorno abierto.
3. Probar `http://localhost:8001/telemetria`. Si el backend está en otra PC, usar la IP que muestra el lanzador.
4. Ingresar esa dirección base en el dashboard y pulsar Conectar robot.

El frontend consulta /info y recibe datos de /ws. Reintenta la conexión cada 3 segundos; no inventa valores cuando no hay servidor.

## Estructura

- `mi_dashboard/src/App.jsx`: pantalla, consulta de información y conexión WebSocket.
- `mi_dashboard/src/index.css`: estilos adaptables a móvil.
- `mi_dashboard/src/main.jsx`: entrada de React.

Esta primera versión muestra batería, orientación, motores y apoyo de patas del Go2. Pendiente: gráficos históricos y pruebas con el simulador en ejecución. Los valores derivados de la simulación no equivalen a mediciones físicas.

## Verificación

```powershell
cd mi_dashboard
npm run lint
npm run build
```

El backend y los modelos se mantienen en el paquete original; para entregar, esta carpeta mi_dashboard se puede colocar dentro del TP05.

Consigna: https://github.com/tsamaan/UadeRobotLab/tree/main/05LaboratoriosTPs/TP05_Desarrollo_de_Aplicaciones_II

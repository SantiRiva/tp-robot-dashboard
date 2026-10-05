# TP Robot Dashboard

Trabajo práctico de Desarrollo de Aplicaciones II (UADE): frontend React que visualiza telemetría de robots Unitree.

## Contenido

- `mi_dashboard/`: frontend React + Vite desarrollado para el TP.
- `simulador/`: entorno TP05 original con backend, simulador, modelos Go2/G1 y consignas.

## 1. Encender el simulador y el backend (Windows)

Instalar Python 3.10 o superior. Desde la raíz del repositorio:

```powershell
py -3 -m pip install -r simulador/requirements.txt
.\simulador\INICIAR_TP05.bat
```

Elegir `2` para Go2 o `1` para G1. Mantener el simulador y el backend abiertos.
Si MuJoCo falla al cargar una DLL, consultar `simulador/INSTALACION.md` (Visual C++ Redistributable).
En Linux/macOS, instalar las mismas dependencias con Python y ejecutar `bash simulador/INICIAR_TP05.sh`.

## 2. Encender el frontend

Requiere Node.js 22.12 o superior compatible con Vite 8. Abrir otra terminal:

```powershell
cd mi_dashboard
npm install
npm run dev
```

Abrir la dirección que imprime Vite (habitualmente http://localhost:5173).
En PowerShell, si se bloquea npm.ps1, usar npm.cmd en lugar de npm.

## 3. Conectar

En el dashboard, ingresar `http://localhost:8001` y pulsar **Conectar robot**.
Si el backend está en otra computadora, usar la IP que muestra el lanzador.
Para diagnosticar, abrir `http://localhost:8001/telemetria`: debe mostrar JSON.

El frontend consulta `/info` y recibe actualizaciones de `/ws`; reintenta la conexión cada 3 segundos. Muestra batería, orientación, motores y apoyo de patas del Go2. No genera datos falsos cuando no hay conexión.

## Estado

Primera versión conectada y probada con el simulador Go2. Incluye gráfico de ángulos en vivo con selector de motor e historial de los últimos 30 segundos; se reinicia al reconectar. Incluye barras de temperatura por motor, promedio y máxima actual (naranja indica comparación, no alarma). Pendiente: mejoras de visualización de patas. Algunos valores del simulador son derivados, no mediciones físicas. Consultar `simulador/API.md`.

## Verificar el frontend

```powershell
cd mi_dashboard
npm run lint
npm run build
```

## Procedencia

El contenido de `simulador/` proviene del TP05 de [tsamaan/UadeRobotLab](https://github.com/tsamaan/UadeRobotLab/tree/main/05LaboratoriosTPs/TP05_Desarrollo_de_Aplicaciones_II). Se conserva su documentación. Los modelos Unitree conservan su licencia BSD de tres cláusulas en `simulador/entorno/sim/unitree_mujoco/LICENSE`. La documentación de instalación original contiene ejemplos genéricos de otros TPs; para este proyecto usar el lanzador TP05 indicado arriba.

No se incluyen dependencias instaladas, cachés, entornos virtuales ni estado temporal del simulador. Se regeneran al instalar o ejecutar.

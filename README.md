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

Primera versión conectada y probada con el simulador Go2. Incluye gráfico de ángulos en vivo con selección de hasta cuatro motores y magnitudes (ángulo, temperatura, velocidad y torque) e historial de los últimos 30 segundos; se reinicia al reconectar. Incluye barras de temperatura por motor, promedio y máxima actual. Las barras y la tabla usan el semáforo del enunciado: verde por debajo de 40 °C, amarillo de 40 a 60 °C inclusive y rojo por encima de 60 °C; también muestran una etiqueta textual del estado. Incluye diagrama superior de las cuatro patas del Go2 (apoyada, en el aire o sin dato), oculto para G1. La reconexión cuenta con pruebas automatizadas de cortes, datos congelados, tiempos de espera y desconexión manual. Pendiente: validación manual completa en navegador y preparación de entrega. Algunos valores del simulador son derivados, no mediciones físicas. Consultar `simulador/API.md`.

## Verificar el frontend

```powershell
cd mi_dashboard
npm test
npm run lint
npm run build
```

## Procedencia

El contenido de `simulador/` proviene del TP05 de [tsamaan/UadeRobotLab](https://github.com/tsamaan/UadeRobotLab/tree/main/05LaboratoriosTPs/TP05_Desarrollo_de_Aplicaciones_II). Se conserva su documentación. Los modelos Unitree conservan su licencia BSD de tres cláusulas en `simulador/entorno/sim/unitree_mujoco/LICENSE`. La documentación de instalación original contiene ejemplos genéricos de otros TPs; para este proyecto usar el lanzador TP05 indicado arriba.

No se incluyen dependencias instaladas, cachés, entornos virtuales ni estado temporal del simulador. Se regeneran al instalar o ejecutar.

### Comportamiento ante cortes

- Si se cierra el backend, se limpian los datos y el historial y se reintenta cada 3 segundos.
- Si el backend repite el mismo tiempo de telemetría (`ts`) durante 10 segundos, se considera que el robot dejó de actualizarse, aunque lleguen mensajes WebSocket.
- Las consultas HTTP y la apertura del WebSocket tienen un límite de espera de 10 segundos.
- Solo un dato nuevo recupera el estado En vivo. Un reinicio del reloj de telemetría inicia un historial nuevo.
- Desconectar cancela las conexiones, consultas y reintentos pendientes.

Prueba manual: conectar Go2; cerrar el backend y comprobar Reconectando; iniciarlo de nuevo y comprobar En vivo. Luego cerrar solo el simulador, esperar 10 segundos y comprobar que desaparezcan los valores antiguos; iniciarlo de nuevo y verificar recuperación. Finalmente pulsar Desconectar y comprobar que no reconecte solo.

### Arranque coordinado en Windows

`INICIAR_TP05.bat` comprueba el robot y el backend antes de abrir procesos. Reutiliza un backend del mismo modelo en modo simulador; si hay un robot diferente o un puerto ocupado, explica qué consola cerrar. No termina procesos ajenos automáticamente. Para cambiar de Go2 a G1, cerrar el simulador y la consola del backend anterior con Ctrl+C y volver a elegir el robot.

El lector de telemetría verifica el modelo mediante el saludo del simulador. Ante una discrepancia rechaza sus datos para evitar mostrar motores G1 con etiquetas Go2.

Pruebas del lanzador: `py -3 simulador/entorno/test_iniciar_tp05.py`.

### Inclinación visual

El dashboard incluye horizonte artificial (roll/pitch) y rumbo relativo (yaw). El rumbo cero es la referencia del entorno, no el norte geográfico. El dibujo limita pitch a ±45° y mantiene el valor numérico completo; al desconectar muestra Sin datos.

### Captura y exportación CSV

En Capturar y exportar, pulsar Capturar muestra mientras el estado sea En vivo. Cada clic guarda una fila con fecha UTC, modelo, modo y telemetría. Exportar CSV descarga todas las muestras con coma o punto y coma, UTF-8 con BOM y punto decimal. El archivo conserva columnas separadas para motores de distintos modelos. Descartar muestras pide confirmación. Máximo: 1000 capturas por registro. Las muestras sobreviven a la desconexión pero se pierden al recargar o cerrar la página: exportarlas antes. La exportación está disponible sin conexión.

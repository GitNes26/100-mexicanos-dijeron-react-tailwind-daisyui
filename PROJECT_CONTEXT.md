# Contexto del sistema — 100 Mexicanos Dijeron

> Fuente de verdad del estado actual del proyecto. Este documento describe el código existente en el commit analizado; no implica que los hallazgos estén corregidos.

## A. Propósito y alcance

Aplicación web para jugar una versión casera de **100 Mexicanos Dijeron** en tiempo real. Una persona conduce la partida desde el panel, una pantalla grande muestra el tablero y dos dispositivos móviles funcionan como pulsadores para los equipos.

El sistema permite crear o unirse a una sala de cuatro caracteres, compartir la sala mediante enlaces, seleccionar preguntas precargadas, revelar respuestas, acumular puntos, marcar errores, activar robo/muerte súbita, usar un contador y declarar victoria manualmente. No existe actualmente persistencia entre reinicios del servidor ni carga dinámica de archivos JSON.

## B. Arquitectura y módulos

### Frontend (`client/`)

- **Vite + React 19**: compilación y ejecución de la SPA.
- `src/App.jsx`: `HashRouter`, rutas y `JuegoContextProvider`.
- `src/contexts/JuegoContext.jsx`: estado local de equipos, rondas, errores, contador, celebraciones, sonidos y transporte WebSocket. También contiene la mayor parte de las reglas de juego.
- `src/pages/Lobby.jsx`: creación/unión a salas y enlaces de tablero, panel y pulsadores.
- `src/pages/Panel.jsx`: selección/envío de preguntas y controles del conductor.
- `src/pages/Tablero.jsx`: tablero público y formulario inicial de nombres.
- `src/pages/Control.jsx`: pulsador de equipo; envía la acción `press`.
- `src/components/`: tarjetas de respuestas, equipos, formulario, panel de controles, letreros y celebración.
- `src/data.js` y `src/data_v2.js`: bancos de preguntas embebidos como módulos JavaScript; el contexto usa `data_v2.js`.
- `src/hooks/useSound.js` y `src/assets/sounds/`: reproducción de efectos de juego.
- `src/assets/images/`, `src/const/`, `src/utils/`: imágenes, iconos, configuración y utilidades.

### Backend (`server/`)

- `server/server.js`: servidor WebSocket basado en `ws`, escucha en `ws://localhost:3001`.
- `rooms`: `Map` en memoria con código de sala, clientes conectados y un estado parcial (`teamNames`, `puntosEquipo`).
- No hay base de datos, API HTTP, autenticación, autorización por rol ni almacenamiento en disco.

### Dependencias entre módulos

`App` monta el contexto; las páginas consumen el contexto; el contexto abre el WebSocket; el servidor retransmite mensajes a los clientes de la sala. El servidor no ejecuta reglas de juego: cada navegador aplica su propia copia de la lógica al recibir eventos.

## C. Actores y roles

| Actor | Responsabilidad actual | Permisos actuales |
|---|---|---|
| Conductor | Opera `Panel` o el formulario del tablero | Puede enviar cualquier acción WebSocket desde el cliente |
| Tablero | TV/proyector con `Tablero` | Recibe eventos y muestra estado; técnicamente también puede emitir acciones |
| Equipo 1 | Móvil con `/control/1` | Envía `press` identificando al equipo 1 |
| Equipo 2 | Móvil con `/control/2` | Envía `press` identificando al equipo 2 |
| Servidor WebSocket | Distribuye mensajes de una sala | Retransmite; no valida reglas ni autoridad |
| Navegador/Audio | Reproduce sonidos y animaciones | Dependencia local del cliente |

No hay identidad persistente de usuario ni separación técnica entre conductor, tablero y controles en el servidor.

## D. Flujos end-to-end

### Crear una sala

1. El usuario abre `/` y pulsa crear.
2. `Lobby` envía `createRoom`.
3. El servidor genera un código único, registra la conexión y responde `roomCreated`.
4. El lobby muestra enlaces construidos con `room=<código>`.

### Unirse a una sala

1. El usuario introduce un código de cuatro caracteres.
2. `Lobby` envía `joinRoom`.
3. Si existe, el servidor agrega el socket, responde `roomJoined` y notifica `playerJoined`.
4. Si la sala tenía estado parcial, responde `syncAll`; el cliente recupera nombres y puntuaciones.
5. Si no existe, devuelve `error`.

### Preparar e iniciar una partida

1. El conductor escribe nombres en `FormEquipos` o en el panel.
2. Se envían `updateAllState`/`updateTeamName`.
3. El tablero/panel muestra los nombres localmente.
4. No existe una acción de inicio de partida en el servidor ni una fase de preparación formal; el juego comienza al enviar una pregunta.

### Jugar una ronda

1. El panel selecciona una pregunta y envía `setQuestion`.
2. Cada cliente ejecuta `mostrarPregunta`, reinicia errores y activa la ronda.
3. Un pulsador envía `press`; el primer cliente que procesa el evento activa el equipo.
4. El conductor revela con `setAnswer`; el contexto suma la respuesta y puede iniciar robo, muerte súbita o cierre de ronda.
5. `markError`, `activarMuerteSubita`, `contador`, `repetida` y `darVictoria` son retransmitidos a todos los clientes.

### Reconexión y cierre

- El contexto intenta reconectar cada dos segundos.
- Al reconectar no reenvía automáticamente la sala anterior.
- El servidor elimina una sala cuando su último socket se desconecta.
- `closeRoom` envía `goToLobby` y elimina la sala.

## E. Reglas de negocio observadas

- Código de sala: cuatro caracteres alfanuméricos, único mientras vive el proceso.
- Dos equipos numerados 1 y 2.
- Máximo de tres errores (`MAX_ERRORES = 3`).
- Bloqueo visual del equipo contrario durante cinco segundos (`BLOQUEO_MS = 5000`).
- Contador visual de diez segundos.
- La ronda usa respuestas con puntos del banco seleccionado.
- Se contemplan uno contra uno, robo, muerte súbita, respuesta repetida y celebración.
- La meta declarada por código es 300 puntos (`META_PUNTOS`), pero no hay activación automática de victoria al alcanzar esa meta.
- La victoria se declara manualmente mediante `darVictoria`.
- El estado compartido no es una transacción: cada cliente muta su copia al recibir eventos.

## F. Restricciones y dependencias externas

- Node.js con módulos ES, `ws` en backend.
- React, React Router, Vite, Tailwind/DaisyUI, Framer Motion, SweetAlert2, Notistack y React Icons en frontend.
- Requiere navegador moderno con WebSocket y reproducción de audio habilitada por interacción.
- El servidor escucha en el puerto fijo 3001; Vite usa su puerto habitual de desarrollo.
- Estado de salas y partida en memoria: reiniciar Node elimina todas las partidas.
- No hay base de datos, almacenamiento de preguntas, subida de archivos ni límite de tamaño/tipo para datos enviados.

## G. Hallazgos y requisitos pendientes

1. **Autoridad distribuida:** el servidor solo retransmite; un cliente puede emitir acciones arbitrarias y cada navegador calcula resultados de forma independiente.
2. **Reconexión incompleta:** la reconexión automática no restaura la sala si el cliente no vuelve a ejecutar `joinRoom`; una sala desaparece cuando no quedan clientes.
3. **Estado parcial:** `syncAll` solo conserva nombres y puntuaciones, no ronda, respuestas, errores, contador, preguntas usadas ni victoria.
4. **Protección inexistente:** no hay token de administrador ni validación de roles para panel, tablero y controles.
5. **Inicio de partida:** falta un flujo explícito y autoritativo para iniciar después de asignar nombres.
6. **Meta de victoria:** falta configurar la puntuación objetivo y finalizar automáticamente al alcanzarla; solo existe declaración manual.
7. **Carga dinámica de preguntas:** los bancos son módulos estáticos; no se enumeran archivos JSON, no se cargan nuevos bancos desde el panel y no se valida un esquema de importación.
8. **Concurrencia del pulsador:** la prioridad depende de la llegada/procesamiento de mensajes y no de una decisión única del servidor.
9. **Persistencia y escalabilidad:** una sola instancia y memoria volátil; no hay recuperación tras reinicio ni coordinación multiinstancia.
10. **Documentación base:** el README actual es la plantilla de Vite y no describe el sistema ni sus comandos reales.

## H. Decisiones confirmadas por el usuario para próximas iteraciones

- El uso principal es presencial: conductor, tablero para TV/proyector y dos celulares como pulsadores.
- Cada sala debe tener una partida independiente.
- Deben sobrevivir recargas y reconexiones de todos los dispositivos.
- El servidor debe ser la autoridad y el panel debe quedar protegido.
- La meta de victoria debe ser configurable, con victoria automática y botones manuales.
- El diseño actual no debe modificarse hasta nuevas instrucciones.
- El pulsador debe incorporar en el centro la referencia visual adjunta, sin rediseñar las demás pantallas.
- El panel deberá poder elegir entre bancos JSON existentes y cargar nuevos archivos JSON, sujeto a definir el esquema y los límites de importación.

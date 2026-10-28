# ☀ Solar PV Planner · Planificador solar fotovoltaico

Planifica una instalación solar **dibujando tu tejado sobre un mapa**: eliges paneles, y obtienes energía, cargas estructurales, diseño eléctrico (strings, MPPT, baterías, inversor) y un diagrama de conexionado. Todo corre en el navegador; no hay servidor ni cuenta.

- Interfaz en **español e inglés**, tema **automático / claro / oscuro** (grises y azules).
- Mapa de OpenStreetMap, y satélite (Esri).
- Datos de radiación y temperatura de **NASA POWER** (climatología de 25 años), calculados solos para tu zona.
- Un solo clic en **`?`** abre el tutorial guiado dentro de la app (con un proyecto de ejemplo).

> Es una herramienta de **estimación**. Verifica siempre con las hojas de datos, la normativa local y un instalador o ingeniero habilitado.

---

## Tutorial de uso

El botón **`?`** (arriba a la derecha) abre un recorrido guiado de un minuto. Este es el resumen.

### 1 · Encuentra tu lugar
Arriba a la derecha del mapa, junto al selector de capas (que activa el **satélite**), está la búsqueda **🔍**: escribe una dirección o unas coordenadas (`-0.19, -78.50`), o edita los campos de latitud y longitud y pulsa Enter. También puedes mover y hacer zoom en el mapa. No hay que colocar ningún punto: los datos solares se calculan para el centro de tus zonas (o del mapa mientras no haya ninguna).

### 2 · Dibuja el tejado o terreno
En el panel plegable **Zonas** (arriba a la izquierda, bajo el zoom) pulsa **✏ Dibujar zona** y haz clic en las esquinas, un clic por punto. Cierra la forma con el primer punto resaltado o con **Enter** (**Retroceso** quita el último punto, **Esc** cancela); mientras dibujas el panel muestra «Deshacer punto» y «Terminar», y «Borrar todas las zonas» aparece cuando hay zonas. Dibuja **una zona por cada faldón**: cada zona tiene su propio azimut y se dimensiona por separado.

### 3 · Edita las zonas
Haz clic en una zona para seleccionarla:

| Acción | Cómo |
|---|---|
| Mover una esquina | Arrastra el círculo blanco |
| Añadir una esquina | Clic en el punto pequeño entre dos esquinas |
| Borrar una esquina | Doble clic (o clic derecho) sobre ella (mínimo 3) |
| Mover toda la zona | Arrastra dentro de la zona seleccionada |
| Orientación | Editor flotante junto a la zona: *desvío de azimut* (0° = mira al ecuador) y «Alinear al borde más largo» |
| Borrar la zona | Botón «Borrar zona» o tecla **Supr** (se puede deshacer 9 s) |

### 4 · Paneles y presupuesto
En el panel inferior: **−/+** o el deslizador cambian cuántos paneles instalas; avanzan **en strings completos** para que el conexionado siga siendo válido. Verás kWp, kWh/año y costo estimado. La **insignia** (✔ / ⚠ / ✖) resume las comprobaciones; un clic te lleva al problema.

### 5 · Los cajones laterales
Izquierda:
- **1 Sitio y sol** — datos solares, inclinación del plano y la «mejor inclinación» para el año o para el peor mes (sistemas aislados).
- **2 Paneles y distribución** — módulo estándar o propio, montaje (pegado, estructura con lastre o anclada), orientación, **presupuesto máximo** y «Buscar diseño óptimo».

Derecha:
- **3 Potencia y peso** — producción mensual con pérdidas, masa por módulo, carga sobre la cubierta, succión del viento y lastre.
- **4 Diseño eléctrico** — por zona: strings, controladores MPPT (o inversores de red), fusibles, seccionadores y cables; además banco de baterías e inversor.
- **5 Diagrama** — esquema de conexionado con **cada conductor entre terminales, positivo (rojo) y negativo (negro) por separado**: módulos en serie (− a la izquierda, + a la derecha), fusible en el + de cada string, buses + y − del combinador, seccionador CC, entradas PV+/PV− del MPPT, bus CC hacia el banco de baterías (fusible Clase T) y el inversor, y salida CA con L, N y PE. Un bloque por zona y controlador; se actualiza al editar; descarga SVG (siempre en paleta clara para imprimir).
- **6 Exportar y compartir** — enlace, archivo `.json`, lista de materiales `.csv` e informe imprimible (PDF).

### 6 · Guardar y compartir
El proyecto se **autoguarda** en tu navegador. «Crear y copiar enlace» genera una URL con todo el proyecto; «Descargar proyecto» guarda un `.json` que se puede reabrir. «Empezar un proyecto nuevo» se puede deshacer.

### Atajos
`Enter` cierra la zona · `Retroceso` quita un punto · `Esc` cancela / cierra el cajón · `Supr` borra la zona seleccionada · `←` `→` en el tutorial.

---

## Estructura del proyecto

```
index.html          Página y estructura de la interfaz
css/style.css       Estilos y temas (claro / oscuro grises-azules)
js/theme-boot.js    Aplica el tema guardado antes de pintar (evita parpadeo)
js/i18n.js          Español ⇄ inglés (traduce el texto ya dibujado)
js/data.js          Utilidades, estado global y bibliotecas (módulos, MPPT, baterías)
js/solar.js         Geometría solar y modelo de irradiación en plano inclinado
js/layout.js        Colocación de paneles en las zonas, separación entre filas, optimizador
js/compute.js       Strings por zona, energía, cargas, baterías, inversor, costos
js/render.js        Gráficos, tarjetas y paneles de los cajones
js/diagram.js       Generador del diagrama de conexionado (SVG)
js/map.js           Mapa Leaflet, datos NASA, dibujo y edición de zonas
js/project.js       Autoguardado, deshacer, enlace, JSON, CSV, informe
js/tour.js          Tutorial guiado y proyecto de ejemplo
js/theme.js         Selector de tema y mapa base oscuro
js/main.js          Conecta la interfaz y arranca la app
docs/RESEARCH.md    Investigación de buenas prácticas (cálculos, normas, cargas)
.nojekyll           Evita que GitHub Pages procese los archivos con Jekyll
```

Son scripts clásicos (sin *build*, sin módulos ES): se cargan en el orden de `index.html` y comparten el ámbito global, por eso funciona incluso abriendo `index.html` con doble clic.

## Ejecutar en local

Doble clic en `index.html` (necesita Internet para el mapa, Leaflet y los datos de NASA). O con un servidor:

```bash
python -m http.server 5173
```

y abre <http://localhost:5173>.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub (p. ej. `solar-pv-planner`) y sube **todos** los archivos de esta carpeta (el `index.html` debe quedar en la raíz).

   ```bash
   git init
   git add .
   git commit -m "Solar PV Planner"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/solar-pv-planner.git
   git push -u origin main
   ```

2. En el repositorio: **Settings → Pages → Build and deployment → Source: *Deploy from a branch***, rama **main**, carpeta **/ (root)** → *Save*.
3. En uno o dos minutos estará en `https://TU_USUARIO.github.io/solar-pv-planner/`.

Notas:
- Todas las rutas son relativas, así que funciona en un subdirectorio de GitHub Pages sin cambios.
- Al publicar cambios, sube la versión en las rutas de `index.html` (`?v=1.0.0` → `?v=1.0.1`) para que los navegadores no usen archivos antiguos en caché.
- Los enlaces para compartir llevan el proyecto en la URL (`#s=…`); funcionan con tu dirección de GitHub Pages (no con `file://`).

## Datos, mapas y atribuciones

| Qué | Fuente | Nota |
|---|---|---|
| Radiación (GHI) y temperatura | [NASA POWER](https://power.larc.nasa.gov/) climatología 2001–2025 | Se consulta desde el navegador; si no responde se usa una estimación aproximada y se avisa |
| Mapa base | © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright) | Respeta su [política de uso de teselas](https://operations.osmfoundation.org/policies/tiles/): uso moderado, no para tráfico masivo |
| Satélite | Imágenes © Esri, Maxar, Earthstar Geographics | Válido para demos; para uso comercial revisa sus términos o usa otro proveedor |
| Búsqueda de lugares | [Nominatim](https://nominatim.org/) (OSM) | Búsquedas puntuales, sin automatizar |
| Librería de mapas | [Leaflet](https://leafletjs.com/) 1.9.4 (CDN de cdnjs) | |

**Privacidad:** no hay cuentas ni analítica. El proyecto vive en tu navegador (`localStorage`) y solo sale de él cuando creas un enlace o descargas un archivo. Las únicas peticiones externas son: NASA POWER, las teselas del mapa, Nominatim y cdnjs.

## Límites del cálculo

Modelo de cielo isotrópico con fracción difusa de Erbs, pérdida por azimut aproximada, separación entre filas al mediodía solar del solsticio de invierno, viento y nieve simplificados, sin sombras de obstáculos, sin comprobación de deslizamiento ni de capacidad estructural de la cubierta. Más detalle y criterios en [`docs/RESEARCH.md`](docs/RESEARCH.md).

## Licencia

© 2026 FalconLight. **Todos los derechos reservados** (licencia propietaria, ver [`LICENSE`](LICENSE)). El código es visible públicamente para poder evaluarlo, pero no se concede permiso para usarlo, copiarlo, modificarlo ni redistribuirlo sin autorización escrita. Las librerías, mapas y datos de terceros (Leaflet, OpenStreetMap, Esri, NASA POWER) siguen sus propios términos.

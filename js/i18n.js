/* English <-> Spanish layer: translates the rendered text, formats follow the language. */
/* English <-> Spanish for the PV planner.
   The app always renders English; this layer translates text nodes after the fact (and reverts on switch). */
(function(){
const EXACT={
'Demo — estimates only; verify with datasheets, local code and a licensed installer.':'Demo — solo estimaciones; verifica con hojas de datos, normativa local y un instalador autorizado.',
'1 · Site & sun':'1 · Sitio y sol','2 · Panels & layout':'2 · Paneles y distribución','3 · Power & weight':'3 · Potencia y peso','4 · Electrical design':'4 · Diseño eléctrico','5 · Diagram':'5 · Diagrama',
'Choose the zone (OpenStreetMap)':'Elige la zona (OpenStreetMap)','Search place':'Buscar lugar','Latitude':'Latitud','Longitude':'Longitud','Search':'Buscar','My location':'Mi ubicación',
'✏ Draw zone':'✏ Dibujar zona','Finish':'Terminar','Undo point':'Deshacer punto','Clear all zones':'Borrar todas las zonas',
'Layer switch (top-right of map) = satellite. Click a zone to select and edit it.':'El selector de capas (arriba a la derecha del mapa) activa el satélite. Haz clic en una zona para seleccionarla y editarla.',
'Satellite (Esri)':'Satélite (Esri)','Zone name':'Nombre de la zona','Azimuth offset (°) · 0 = faces equator':'Desvío de azimut (°) · 0 = mira al ecuador','Align to longest edge':'Alinear al borde más largo','Delete zone':'Borrar zona',
'Edit: drag a white corner to move it · click a small dot between two corners to add one · double-click (or right-click) a corner to delete it · drag inside the selected zone to move it · Esc cancels drawing · Del deletes the selected zone.':'Editar: arrastra una esquina blanca para moverla · clic en un punto pequeño entre dos esquinas para añadir una · doble clic (o clic derecho) en una esquina para borrarla · arrastra dentro de la zona seleccionada para moverla · Esc cancela el dibujo · Supr borra la zona seleccionada.',
'Solar data (NASA POWER 25-yr climatology: GHI & temperature) loads automatically for your zone, or for the map centre until you draw one.':'Los datos solares (climatología de 25 años de NASA POWER: GHI y temperatura) se cargan automáticamente para tu zona, o para el centro del mapa hasta que dibujes una.',
'centre of your zones':'centro de tus zonas','map centre — draw a zone to refine':'centro del mapa — dibuja una zona para afinar',
'Loading NASA POWER data…':'Cargando datos de NASA POWER…',
'NASA POWER 25-yr climatology (MERRA-2/CERES)':'Climatología NASA POWER de 25 años (MERRA-2/CERES)',
'⚠ Offline estimate (Kt = 0.5, crude temperature) — NASA POWER unreachable':'⚠ Estimación sin conexión (Kt = 0,5, temperatura aproximada) — NASA POWER no disponible',
'Need at least 3 points.':'Se necesitan al menos 3 puntos.','Zone created. Drag corners to edit; use ✏ Draw zone to add another.':'Zona creada. Arrastra las esquinas para editar; usa ✏ Dibujar zona para añadir otra.',
'A zone needs at least 3 corners.':'Una zona necesita al menos 3 esquinas.','Drawing cancelled.':'Dibujo cancelado.','Place not found.':'Lugar no encontrado.','Search unavailable.':'Búsqueda no disponible.',
'Map library failed to load (offline?) — enter latitude/longitude manually.':'No se cargó la librería del mapa (¿sin conexión?) — introduce latitud/longitud a mano.',
'Solar light calculator':'Calculadora de luz solar','Tilt (°)':'Inclinación (°)','Azimuth deviation (°) — rectangle mode only':'Desvío de azimut (°) — solo modo rectángulo',
'Best tilt: annual':'Mejor inclinación: anual','Best tilt: worst month (off-grid)':'Mejor inclinación: peor mes (aislado)',
'GHI avg kWh/m²/day':'GHI medio kWh/m²/día','on tilted plane kWh/m²/day':'en plano inclinado kWh/m²/día','kWh/m²/yr on plane':'kWh/m²/año en el plano','vs horizontal':'vs horizontal','South':'Sur','North':'Norte',
'Monthly irradiation (kWh/m²/day = peak sun hours)':'Irradiación mensual (kWh/m²/día = horas sol pico)','Daily irradiation on the tilted plane (kWh/m²/day) by month':'Irradiación diaria en el plano inclinado (kWh/m²/día) por mes',
'Site & sun':'Sitio y sol','Panels & layout':'Paneles y distribución','Power & weight':'Potencia y peso','Electrical design':'Diseño eléctrico','Diagram':'Diagrama',
'Budget & cost':'Presupuesto y costo','Panel price ($ each)':'Precio por panel ($ c/u)','Other equipment & install ($/kWp)':'Otros equipos e instalación ($/kWp)','Battery ($/kWh)':'Batería ($/kWh)','Budget limit ($, 0 = none)':'Presupuesto máximo ($, 0 = sin límite)',
'Placeholder prices — replace with real quotes.':'Precios de ejemplo — reemplázalos con cotizaciones reales.','Item':'Concepto','Cost ($)':'Costo ($)','Other equipment & install':'Otros equipos e instalación','Total':'Total','kWh/yr':'kWh/año','est. cost':'costo est.',
'Plan your solar system in 4 steps':'Planifica tu sistema solar en 4 pasos','Find your place — use the 🔍 search (top-right) or pan and zoom the map':'Encuentra tu lugar — usa la búsqueda 🔍 (arriba a la derecha) o mueve y haz zoom en el mapa','Draw the roof or lot with ✏ Draw zone — the sun data is calculated for it automatically':'Dibuja el tejado o terreno con ✏ Dibujar zona — los datos solares se calculan solos para él',
'Choose panels and how many your budget allows':'Elige los paneles y cuántos permite tu presupuesto','Review power, cost and wiring in the side panels':'Revisa potencia, costo y conexionado en los paneles laterales','Use a simple rectangle instead':'Usar un rectángulo simple',
'Close':'Cerrar','Language':'Idioma','Number of panels':'Cantidad de paneles','Remove one string of panels':'Quitar un string de paneles','Add one string of panels':'Añadir un string de paneles',
'Click the roof corners · click the highlighted first point or press Enter to finish · Backspace removes a point · Esc cancels':'Haz clic en las esquinas del tejado · cierra con el primer punto resaltado o con Enter · Retroceso quita un punto · Esc cancela','✔ All checks OK':'✔ Todas las comprobaciones OK',
'Export & share':'Exportar y compartir','Share link':'Enlace para compartir','Anyone opening the link gets a copy of this project (zones, panels, system, costs).':'Quien abra el enlace recibe una copia de este proyecto (zonas, paneles, sistema, costos).',
'Create & copy link':'Crear y copiar enlace','Project file':'Archivo del proyecto','Download project (.json)':'Descargar proyecto (.json)','Open project…':'Abrir proyecto…','The project is also autosaved in this browser.':'El proyecto también se guarda solo en este navegador.',
'Reports':'Informes','Print / save report as PDF':'Imprimir / guardar informe como PDF','Download bill of materials (.csv)':'Descargar lista de materiales (.csv)','Project':'Proyecto','Start a new project':'Empezar un proyecto nuevo',
'Link copied to the clipboard.':'Enlace copiado al portapapeles.','Select the link and copy it (Ctrl+C).':'Selecciona el enlace y cópialo (Ctrl+C).','Opened from a local file: the link only works on this computer.':'Abierto desde un archivo local: el enlace solo funciona en este equipo.',
'Zones cleared':'Zonas borradas','Zone deleted':'Zona borrada','Project reset':'Proyecto reiniciado','Shared project loaded.':'Proyecto compartido cargado.','The shared link could not be read.':'No se pudo leer el enlace compartido.','Project loaded.':'Proyecto cargado.','Could not open that file.':'No se pudo abrir ese archivo.','Undo':'Deshacer',
'Electrical parameters (datasheet)':'Parámetros eléctricos (hoja de datos)','Rectangle surface (only if no zone is drawn)':'Superficie rectangular (solo si no hay zona dibujada)',
'Solar PV plan report':'Informe del plan solar fotovoltaico','Site':'Sitio','Zones':'Zonas','Module':'Módulo',
'Welcome to the Solar PV Planner':'Bienvenido al planificador solar fotovoltaico',
'You draw your roof on a map, pick panels and get the energy, structure loads, electrical design and wiring diagram. This one-minute tour shows how it works.':'Dibujas tu tejado en un mapa, eliges paneles y obtienes la energía, las cargas estructurales, el diseño eléctrico y el diagrama de conexionado. Este recorrido de un minuto te muestra cómo funciona.',
'1 · Find your place':'1 · Encuentra tu lugar','Use the 🔍 search (top-right, next to the layer switch) for an address or coordinates such as -0.19, -78.50, or pan and zoom the map. The layer switch turns on satellite imagery. Sun data is calculated automatically for your zone — there is no point to place.':'Usa la búsqueda 🔍 (arriba a la derecha, junto al selector de capas) para una dirección o coordenadas como -0,19, -78,50, o mueve y haz zoom en el mapa. El selector de capas activa el satélite. Los datos solares se calculan solos para tu zona — no hay que colocar ningún punto.',
'2 · Draw your roof':'2 · Dibuja tu tejado','Open the Zones panel (top-left), press “Draw zone” and click the corners of the roof or lot. Close the shape with the highlighted first point or Enter. Draw one zone per roof face: each zone has its own direction.':'Abre el panel Zonas (arriba a la izquierda), pulsa «Dibujar zona» y haz clic en las esquinas del tejado o terreno. Cierra la forma con el primer punto resaltado o con Enter. Dibuja una zona por cada faldón: cada zona tiene su propia orientación.',
'3 · Edit zones':'3 · Edita las zonas','Click a zone to select it. Drag a white corner to move it, click a small dot to add a corner, double-click a corner to delete it, or drag inside the zone to move it. Panels recalculate live.':'Haz clic en una zona para seleccionarla. Arrastra una esquina blanca para moverla, haz clic en un punto pequeño para añadir una esquina, doble clic en una esquina para borrarla, o arrastra dentro de la zona para moverla. Los paneles se recalculan al instante.',
'4 · Panels and budget':'4 · Paneles y presupuesto','Use − / + or the slider to change how many panels you install — it moves in whole strings so the wiring stays valid. The badge shows warnings; click it to jump to the problem.':'Usa − / + o el deslizador para cambiar cuántos paneles instalas: avanza en strings completos para que el conexionado siga siendo válido. La insignia muestra avisos; haz clic para ir al problema.',
'Solar data for your zone (NASA POWER) and the best tilt for the whole year or for the worst month. Each zone also has its own azimuth.':'Datos solares de tu zona (NASA POWER) y la mejor inclinación para todo el año o para el peor mes. Cada zona tiene además su propio azimut.',
'Pick a standard module or enter your own, choose mounting and orientation, set a budget and press “Find optimal design” to compare tilts.':'Elige un módulo estándar o introduce el tuyo, define montaje y orientación, fija un presupuesto y pulsa «Buscar diseño óptimo» para comparar inclinaciones.',
'Monthly production with losses, weight per module, roof load, wind uplift and the ballast or anchor loads you need.':'Producción mensual con pérdidas, peso por módulo, carga sobre la cubierta, succión del viento y el lastre o las cargas de anclaje necesarias.',
'Strings, controllers, fuses and cables are sized zone by zone, plus the battery bank and inverter. ✔ means a check passes; ⚠ and ✖ need your attention.':'Strings, controladores, fusibles y cables se dimensionan zona por zona, además del banco de baterías y el inversor. ✔ significa que la comprobación pasa; ⚠ y ✖ requieren tu atención.',
'One block per zone — strings, combiner and MPPT — joined to the battery bank and inverter. It updates as you edit zones, and you can download it as SVG.':'Un bloque por zona — strings, combinador y MPPT — unido al banco de baterías y al inversor. Se actualiza al editar las zonas y puedes descargarlo como SVG.',
'Share a link, save the project file, download the bill of materials (.csv) or print a PDF report. Your work is also autosaved in this browser.':'Comparte un enlace, guarda el archivo del proyecto, descarga la lista de materiales (.csv) o imprime un informe en PDF. Tu trabajo también se guarda solo en este navegador.',
'Theme, language and help':'Tema, idioma y ayuda','Switch between automatic, light and dark theme and between English and Spanish. Reopen this tutorial any time with the ? button.':'Cambia entre tema automático, claro y oscuro, y entre inglés y español. Vuelve a abrir este tutorial cuando quieras con el botón ?.',
'Back':'Atrás','Next':'Siguiente','Done':'Listo','Skip tutorial':'Saltar tutorial','Load an example project':'Cargar un proyecto de ejemplo','Take the tutorial':'Hacer el tutorial','Tutorial':'Tutorial',
'Theme: auto':'Tema: automático','Theme: light':'Tema: claro','Theme: dark':'Tema: oscuro',
'Search place or coordinates':'Buscar lugar o coordenadas','All groups are drawn.':'Se dibujan todos los grupos.','Coordinates out of range.':'Coordenadas fuera de rango.','Month':'Mes','Tilted':'Inclinado','none':'ninguno','Small 100 W – 12 V':'Pequeño 100 W – 12 V','Jan':'Ene','Apr':'Abr','Aug':'Ago','Dec':'Dic',
'Panel drawer — module':'Selector de panel — módulo','Library':'Biblioteca','Custom (edit fields)':'Personalizado (edita los campos)',
'Pmax (W)':'Pmáx (W)','Length (m)':'Largo (m)','Width (m)':'Ancho (m)','Weight (kg)':'Peso (kg)','Voc coef (%/°C)':'Coef. Voc (%/°C)','Pmax coef (%/°C)':'Coef. Pmáx (%/°C)','Max series fuse (A)':'Fusible serie máx. (A)',
'Pick a standard module or edit any field for a custom one.':'Elige un módulo estándar o edita cualquier campo para uno personalizado.',
'Surface':'Superficie','Depth (m)':'Fondo (m)','Edge setback (m)':'Retranqueo de borde (m)','Mounting':'Montaje','Flush on pitched roof':'Pegado a tejado inclinado','Tilted racks – ballasted':'Estructura inclinada – con lastre','Tilted racks – anchored':'Estructura inclinada – anclada',
'Orientation':'Orientación','Portrait':'Vertical','Landscape':'Horizontal','portrait':'vertical','landscape':'horizontal','Max panels (0 = fill)':'Máx. paneles (0 = llenar)',
'Optimise for':'Optimizar para','Annual energy':'Energía anual','Worst-month energy':'Energía del peor mes','Find optimal design':'Buscar diseño óptimo','Best options':'Mejores opciones','Orient.':'Orient.','Tilt':'Incl.','Panels':'Paneles','MWh/yr*':'MWh/año*','Apply':'Aplicar',
'*Quick estimate at PR 0.80. Ranked by the selected objective.':'*Estimación rápida con PR 0,80. Ordenado según el objetivo elegido.',
'No zone drawn — using the rectangle above. Draw zones on the map (step 1) for real roof outlines.':'Sin zonas dibujadas — se usa el rectángulo de arriba. Dibuja zonas en el mapa (paso 1) para contornos reales de tejado.',
'Layout':'Distribución','panels fit':'paneles caben','installed power':'potencia instalada','drawn areas':'áreas dibujadas','row pitch':'paso entre filas','module area':'área de módulos','rows × columns':'filas × columnas',
'north is down; equator side is up':'el norte está abajo; el lado del ecuador está arriba','▼ equator side (south) ▼ · north is up':'▼ lado del ecuador (sur) ▼ · norte arriba',
'Flush mounting: no row spacing applied; the surface is the roof plane.':'Montaje pegado: sin separación entre filas; la superficie es el plano del tejado.',
'Generation':'Generación','Soiling loss (%)':'Pérdida por suciedad (%)','Mismatch (%)':'Pérdida por desajuste (%)','DC wiring (%)':'Cableado CC (%)','Inverter / charge eff. (%)':'Efic. inversor / carga (%)',
'per year':'por año','specific yield':'rendimiento específico','performance ratio':'ratio de rendimiento (PR)','avg per day':'media por día',
'Average daily production per month (kWh/day); dashed = daily load':'Producción diaria media por mes (kWh/día); línea discontinua = carga diaria','kWh/mo':'kWh/mes','short':'insuficiente',
'Weight & structural loads':'Peso y cargas estructurales','Design gust speed (m/s)':'Velocidad de ráfaga de diseño (m/s)','Roof zone':'Zona de cubierta','Field ×1.0':'Centro ×1,0','Edge ×1.5':'Borde ×1,5','Corner ×2.0':'Esquina ×2,0',
'Ground snow (kN/m²)':'Nieve en suelo (kN/m²)','Racking (kg/m² of module)':'Estructura (kg/m² de módulo)',
'module + racking each':'módulo + estructura (c/u)','ballast per module':'lastre por módulo','total array mass':'masa total del campo','dead load on roof':'carga permanente en cubierta','dead + snow':'permanente + nieve',
'Simplified (Cnet by zone, no terrain/height factors, no sliding check). Use ASCE 7-16 §29.4 / EN 1991-1-4 for real projects.':'Simplificado (Cnet por zona, sin factores de terreno/altura, sin comprobación de deslizamiento). Usa ASCE 7-16 §29.4 / EN 1991-1-4 en proyectos reales.',
'System & load':'Sistema y carga','System type':'Tipo de sistema','Off-grid / hybrid (MPPT + battery + inverter)':'Aislado / híbrido (MPPT + batería + inversor)','Grid-tied string inverter':'Inversor string conectado a red',
'Daily energy use (kWh/day)':'Consumo diario (kWh/día)','Peak AC load (W)':'Carga pico CA (W)','AC voltage (V)':'Tensión CA (V)','Design low temp (°C)':'Temperatura mínima de diseño (°C)','Design high temp (°C)':'Temperatura máxima de diseño (°C)',
'MPPT controller / inverter input':'Controlador MPPT / entrada del inversor','Max PV voltage (V)':'Tensión FV máx. (V)','Min MPPT voltage (V)':'Tensión MPPT mín. (V)','Max input Isc (A)':'Isc de entrada máx. (A)','Max array power (W)':'Potencia máx. del campo (W)',
'Output current (A) – off-grid':'Corriente de salida (A) – aislado','AC rating (W) – grid-tied':'Potencia CA (W) – red','Battery bank':'Banco de baterías','Bank voltage':'Tensión del banco','Battery unit':'Unidad de batería',
'Unit voltage (V)':'Tensión unitaria (V)','Unit capacity (Ah)':'Capacidad unitaria (Ah)','Usable DoD (%)':'DoD útil (%)','Round-trip eff. (%)':'Efic. ida y vuelta (%)','Autonomy (days)':'Autonomía (días)',
'Cable runs (one-way, m)':'Longitud de cables (solo ida, m)','Array → combiner/controller':'Campo → combinador/controlador','Controller → battery bus':'Controlador → bus de batería','Battery ↔ inverter':'Batería ↔ inversor',
'Design results':'Resultados del diseño','Array & protection':'Campo y protecciones','String:':'String:',
'MPPT controller(s)':'controlador(es) MPPT','inverter(s)':'inversor(es)','DC isolator per input':'seccionador CC por entrada','required':'requerido','inverter (peak ×1.25)':'inversor (pico ×1,25)','Class T fuse at battery':'fusible Clase T en batería',
'AC breaker':'Interruptor CA','AC breaker + RCD':'Interruptor CA + diferencial','Grid inverter':'Inversor de red','DC/AC ratio (1.1–1.3 typical)':'relación CC/CA (típico 1,1–1,3)',
'Wiring diagram':'Diagrama de conexionado','— generated from the electrical design':'— generado a partir del diseño eléctrico','Download SVG':'Descargar SVG',
'Schematic only. Not a permit drawing. Conductor, OCPD and isolator ratings must follow the local code (NEC 690/705/706, IEC 60364-7-712 / 62548).':'Solo esquema. No es un plano para permisos. Las secciones de conductor, protecciones y seccionadores deben seguir la normativa local (NEC 690/705/706, IEC 60364-7-712 / 62548).',
'DC combiner':'Combinador CC','no fuses (≤2)':'sin fusibles (≤2)','DC isolator':'Seccionador CC','SPD type 2':'SPD tipo 2','DC brk':'Int. CC','(first 4×4 units shown)':'(se muestran las primeras 4×4 unidades)',
'Inverter / charger':'Inversor / cargador','AC':'CA','AC loads panel':'Cuadro de cargas CA','RCD 30 mA':'Diferencial 30 mA','SPD':'SPD','Main panel':'Cuadro principal','bi-directional meter':'contador bidireccional','Utility grid':'Red eléctrica',
'Earth / equipotential bonding: module frames, rails, controller, inverter, battery isolator':'Tierra / unión equipotencial: marcos de módulos, carriles, controlador, inversor, seccionador de batería',
'Earth / equipotential bonding: module frames, rails, inverter, main panel':'Tierra / unión equipotencial: marcos de módulos, carriles, inversor, cuadro principal',
'■ DC +':'■ CC +','■ DC −':'■ CC −','■ Series link':'■ Unión en serie','■ AC L':'■ CA L','■ AC N':'■ CA N','■ Earth':'■ Tierra'
};
const REX=[
['Solar data for {n}, {n} ({s}): {s}','Datos solares para {n}, {n} ({s}): {s}'],
['Source: {s}','Fuente: {s}'],
['Drawing: {n} point(s) — click corners; click the first (orange) point, Finish or double-click to close.','Dibujando: {n} punto(s) — haz clic en las esquinas; cierra con el primer punto (naranja), Terminar o doble clic.'],
['Zone {n}','Zona {n}'],
['{s} · {n} panels · {n} m² · az {n}° ({n} %)','{s} · {n} paneles · {n} m² · az {n}° ({n} %)'],
['panel faces (tilt {n}°)','orientación del panel (inclinación {n}°)'],
['… + {n} more group(s): {n} strings · {n} panels','… + {n} grupo(s) más: {n} strings · {n} paneles'],
['This diagram covers {n} panels in {n} strings and {n} controller(s).','Este diagrama cubre {n} paneles en {n} strings y {n} controlador(es).'],
['This diagram covers {n} panels in {n} strings and {n} inverter(s).','Este diagrama cubre {n} paneles en {n} strings y {n} inversor(es).'],
['Repeated groups are summarised: {n} of {n} panels drawn.','Los grupos repetidos se resumen: se dibujan {n} de {n} paneles.'],
['{s} – {n} half-cell','{s} – {n} media celda'],['{s} – {n} cell','{s} – {n} celdas'],
['{n} drawn zone(s), {n} m² — width/depth inputs are ignored. Edit zones on the map (step 1).','{n} zona(s) dibujada(s), {n} m² — se ignoran ancho/fondo. Edita las zonas en el mapa (paso 1).'],
['{n} zone(s)','{n} zona(s)'],
['Row spacing keeps rows unshaded at solar noon on the winter solstice (pitch {n} m for {n}° tilt). Use 9:00–15:00 criteria for stricter designs.','La separación evita sombras entre filas al mediodía solar del solsticio de invierno (paso {n} m con inclinación {n}°). Usa el criterio 9:00–15:00 para diseños más exigentes.'],
['{n} panels in strings','{n} paneles en strings'],['{n} in strings','{n} en strings'],['Generated: {s}','Generado: {s}'],['✖ {n} issue(s)','✖ {n} problema(s)'],['⚠ {n} warning(s)','⚠ {n} aviso(s)'],['✏ Drawing · {n} point(s)','✏ Dibujando · {n} punto(s)'],
['max {n} · 1 string = {n} panels','máx. {n} · 1 string = {n} paneles'],['max {n} · 1 string = {n} panels · budget limit','máx. {n} · 1 string = {n} paneles · límite de presupuesto'],['max {n}','máx. {n}'],['max {n} · budget limit','máx. {n} · límite de presupuesto'],['Budget allows {n} panels','El presupuesto permite {n} paneles'],['load {n}','carga {n}'],
['Worst month yields {n} kWh/day vs {n} kWh load → covered.','El peor mes rinde {n} kWh/día frente a {n} kWh de carga → cubierto.'],
['Worst month yields {n} kWh/day vs {n} kWh load →','El peor mes rinde {n} kWh/día frente a {n} kWh de carga →'],
['— about {n} kWp needed for the worst month.','— se necesitan unos {n} kWp para el peor mes.'],
['panels ({n} × {n} kg)','paneles ({n} × {n} kg)'],
['Wind pressure {n} Pa (q = 0.613·V² = {n} Pa, Cnet {n}) vs 2400 Pa module test load','Presión de viento {n} Pa (q = 0,613·V² = {n} Pa, Cnet {n}) vs carga de ensayo del módulo 2400 Pa'],
['Snow pressure {n} Pa vs 5400 Pa module test load','Presión de nieve {n} Pa vs carga de ensayo del módulo 5400 Pa'],
['Added load {n} kg/m² (rule of thumb ≲ 15–25 kg/m² without a structural check)','Carga añadida {n} kg/m² (regla práctica ≲ 15–25 kg/m² sin comprobación estructural)'],
['Uplift per module ≈ {n} kgf → ballast {n} kg (1.5·F − 0.9·G).','Succión por módulo ≈ {n} kgf → lastre {n} kg (1,5·F − 0,9·G).'],
['Anchored: each attachment (2 per module) needs ≥ {n} kgf factored pull-out; check rafters.','Anclado: cada fijación (2 por módulo) requiere ≥ {n} kgf de arranque mayorado; revisa las vigas.'],
['Generic MPPT {s} ({n} V bank)','MPPT genérico {s} (banco de {n} V)'],['Generic {n} kW string inverter','Inversor string genérico de {n} kW'],
['{n} in series × {n} parallel','{n} en serie × {n} en paralelo'],
['= {n} of {n} panels ({n}–{n} allowed in series)','= {n} de {n} paneles (de {n} a {n} permitidos en serie)'],
['No valid series count: needs {n}–{n} in series — pick another controller/panel','Sin número de serie válido: requiere {n}–{n} en serie — elige otro controlador/panel'],
['Cold Voc {n} V ({n} V/panel at {n} °C) ≤ 95 % of {n} V','Voc en frío {n} V ({n} V/panel a {n} °C) ≤ 95 % de {n} V'],
['Hot Vmp {n} V ≥ MPPT minimum {n} V','Vmp en caliente {n} V ≥ mínimo MPPT {n} V'],
['Input Isc {n} A ({n} string) ≤ {n} A','Isc de entrada {n} A ({n} string) ≤ {n} A'],['Input Isc {n} A ({n} strings) ≤ {n} A','Isc de entrada {n} A ({n} strings) ≤ {n} A'],
['Array {n} W per controller vs {n} W rating','Campo {n} W por controlador vs {n} W nominales'],['Array {n} W per inverter vs {n} W rating','Campo {n} W por inversor vs {n} W nominales'],
['{n} panel(s) left unused by the string layout','{n} panel(es) sin usar por la configuración de strings'],
['string(s) per controller','string(s) por controlador'],['string(s) per inverter','string(s) por inversor'],
['string fuse','fusible de string'],['string fuse ⚠ > module max','fusible de string ⚠ > máx. del módulo'],
['string cable ({n} % drop)','cable de string ({n} % de caída)'],['installed ({n}S × {n}P)','instalado ({n}S × {n}P)'],['battery cable ({n} %)','cable de batería ({n} %)'],
['Charge rate {n}C ({n} A) — limit ≈ 0.5C Li-ion / per BMS','Tasa de carga {n}C ({n} A) — límite ≈ 0,5C Li-ion / según BMS'],
['Charge rate {n}C ({n} A) — limit ≈ 0.2C lead-acid','Tasa de carga {n}C ({n} A) — límite ≈ 0,2C plomo-ácido'],
['Worst-month production {n} vs load {n} kWh/day','Producción del peor mes {n} vs carga {n} kWh/día'],
['Battery current up to {n} A at {n} V — acceptable','Corriente de batería hasta {n} A a {n} V — aceptable'],
['Battery current up to {n} A at {n} V — consider higher bank voltage','Corriente de batería hasta {n} A a {n} V — considera mayor tensión del banco'],
['Unit voltage × series = {n} V vs bank {n} V — check compatibility.','Tensión unitaria × serie = {n} V vs banco {n} V — comprueba la compatibilidad.'],
['{n} kW AC','{n} kW CA'],['total ({n} unit)','total ({n} unidad(es))'],
['… + {n} more identical group(s) ({n} total)','… + {n} grupo(s) idéntico(s) más ({n} en total)'],
['… + {n} more identical groups ({n} total)','… + {n} grupos idénticos más ({n} en total)'],
['… + {n} more identical group ({n} total)','… + {n} grupo idéntico más ({n} en total)'],
['{n}× {n} A fuses','{n}× fusibles de {n} A'],['Battery bank {n} V · {n} kWh','Banco de baterías {n} V · {n} kWh'],['{n}S × {n}P of {n} V {n} Ah','{n}S × {n}P de {n} V {n} Ah'],
['{n} W pure sine','{n} W onda senoidal pura'],['DC {n} V → AC {n} V','CC {n} V → CA {n} V'],['brk {n}A','int. {n}A'],['peak {n} W','pico {n} W'],
['Inverter {n}','Inversor {n}'],['{n} kW AC · MPPT','{n} kW CA · MPPT'],['{n} A + RCD','{n} A + diferencial'],
['Class T fuse {n} A at battery +; cables: array {n} mm², MPPT→bus {n} mm², battery {n} mm²','Fusible Clase T {n} A en el + de la batería; cables: campo {n} mm², MPPT→bus {n} mm², batería {n} mm²'],
['Class T fuse {n} A at battery +; cables: array {n} mm², MPPT→bus {n} mm², battery {n} mm² (parallel)','Fusible Clase T {n} A en el + de la batería; cables: campo {n} mm², MPPT→bus {n} mm², batería {n} mm² (en paralelo)'],
['String cable {n} mm² ({n} % drop); inverter total {n} kW, DC/AC {n}','Cable de string {n} mm² ({n} % de caída); inversor total {n} kW, CC/CA {n}']
].map(([a,b])=>{const parts=a.split(/(\{[ns]\})/);let re='^';parts.forEach(p=>re+=p==='{n}'?'(-?[\\d.,]+)':p==='{s}'?'(.+?)':p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));return[new RegExp(re+'$'),b]});
const KEY_CACHE=new Map();
function tr(s){const t=s.trim();if(!t||!/[A-Za-z]{2}/.test(t))return s;const lead=s.slice(0,s.indexOf(t)),trail=s.slice(s.indexOf(t)+t.length);
 let out=KEY_CACHE.get(t);
 if(out===undefined){out=t;
  if(EXACT[t]!==undefined)out=EXACT[t];
  else for(const [re,b] of REX){const m=re.exec(t);if(m){let i=0;out=b.replace(/\{[ns]\}/g,()=>{const c=m[++i];return /^-?[\d.,]+$/.test(c)?c:tr(c)});break}}
  if(KEY_CACHE.size<5000)KEY_CACHE.set(t,out)}
 return lead+out+trail}
let LANG='en',dirty=false,busy=false;const info=new WeakMap();
function walk(){busy=true;const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let x;
 while(x=w.nextNode()){const p=x.parentNode&&x.parentNode.nodeName;if(p==='SCRIPT'||p==='STYLE')continue;
  const c=info.get(x);let src=c&&x.nodeValue===c.out?c.src:x.nodeValue;
  if(LANG==='en'&&!c)continue;
  const out=LANG==='es'?tr(src):src;if(out!==x.nodeValue)x.nodeValue=out;info.set(x,{src,out})}
 document.querySelectorAll('[aria-label]').forEach(el=>{if(el.dataset.l0===undefined)el.dataset.l0=el.getAttribute('aria-label');el.setAttribute('aria-label',LANG==='es'?tr(el.dataset.l0):el.dataset.l0)});
 const q=document.getElementById('q');if(q)q.placeholder=LANG==='es'?'Quito, Ecuador — o -0,19, -78,50':'Quito, Ecuador — or -0.19, -78.50';
 document.documentElement.lang=LANG;if(mo)mo.takeRecords();busy=false}
let mo=null,raf=0;
function schedule(){if(busy||raf)return;raf=requestAnimationFrame(()=>{raf=0;walk()})}
window.LANG_NOW=()=>LANG;window.trs=s=>LANG==='es'?tr(s):s;
const fixName=()=>{if(typeof selZone!=='function')return;const z=selZone(),el=document.getElementById('zName');if(z&&el)el.value=LANG==='es'?tr(z.name):z.name};
window.setLang=l=>{LANG=l;try{localStorage.setItem('lang',l)}catch(e){}if(typeof render==='function')render();fixName();walk()};
window.applyLang=walk;
document.addEventListener('DOMContentLoaded',()=>{let l='en';try{l=localStorage.getItem('lang')||''}catch(e){}if(!l)l=(navigator.language||'').toLowerCase().startsWith('es')?'es':'en';
 const sel=document.getElementById('lang');if(sel){sel.value=l;sel.onchange=()=>setLang(sel.value)}
 LANG=l;if(typeof render==='function')render();fixName();mo=new MutationObserver(recs=>{if(recs.some(r=>{const el=r.target.nodeType===1?r.target:r.target.parentElement;return!(el&&el.closest&&el.closest('.leaflet-tile-pane,.leaflet-overlay-pane,.leaflet-marker-pane'))}))schedule()});mo.observe(document.body,{childList:true,subtree:true,characterData:true});walk()});
})();


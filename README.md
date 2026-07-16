# Nuestro universo

Experiencia romántica 3D creada con Three.js. El planeta, sus anillos, las estrellas y las texturas se generan mediante código; no necesita imágenes ni modelos externos.

## Ejecutar

Los módulos JavaScript necesitan un servidor local. Desde esta carpeta ejecuta:

```powershell
python -m http.server 8080
```

Después abre `http://localhost:8080` en el navegador.

## Personalizar

- Frases: edita `PHRASES` en `js/config.js`.
- Colores y órbitas: edita `COLORS` y `ORBIT_BANDS` en `js/config.js`.
- Dedicatoria inicial: edita el contenido de `.intro__content` en `index.html`.
- Carta secreta de la luna: edita `SECRET_LETTER` en `js/config.js`.
- Cantidad necesaria para activar el final: edita `discoveryGoal` en `js/config.js`.

## Añadir música

Coloca una canción MP3 en `assets/audio/` y llámala exactamente `musica.mp3`. El botón musical ya está visible y la reproducción comenzará después de pulsar el botón de entrada. No existe sonido alternativo.

## Estructura

- `script.js`: coordina la experiencia y el ciclo de animación.
- `js/scene/`: elementos independientes de la escena 3D.
- `js/controls/`: controles orbitales y selección de frases.
- `js/experience/`: recorrido cinematográfico y seguimiento de descubrimientos.
- `js/integrations/`: conexión opcional para la música proporcionada por el usuario.
- `js/utils/`: texturas procedurales y utilidades.
- `js/ui/`: portada, avisos e interfaz.
- `styles/`: estilos separados por responsabilidad.

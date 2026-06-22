# Inducción Personal Nuevo · Consorcio Rovella-INMAC

Presentación web interactiva tipo e-learning para la inducción del personal ingresante.
Replica una presentación de PowerPoint usando imágenes PNG como diapositivas y archivos
MP3 como narración, con reproducción automática, navegación manual y un video embebido de
YouTube.

🔗 **Publicación:** GitHub Pages (ver pestaña *Settings → Pages* del repositorio).

---

## ✨ Características

- **Inicio directo** en la portada (Diapositiva 01), sin pantalla de bienvenida.
- **Reproducción automática**: cada diapositiva permanece visible hasta que termina su
  audio; el avance depende de la duración real del audio, no de temporizadores fijos.
- **Navegación manual** con controles laterales y atajos de teclado.
- **Transiciones suaves** (crossfade) entre diapositivas.
- **Video embebido** de YouTube en la diapositiva 06, con autoplay y sonido automático.
- **Diapositivas 17–18** comparten un único audio; el cambio ocurre exactamente al 50 %.
- **Barra lateral flotante** que se oculta durante la reproducción automática y reaparece
  al acercar el mouse al borde derecho.
- **Diseño responsivo** 16:9 (Full HD, laptop, tablet, celular) sin deformar ni recortar
  las imágenes.

---

## 🎮 Controles

| Control | Función |
|---------|---------|
| ▶ / ❚❚ | Reproducir / Pausar (alterna) |
| ■ | Detener (vuelve a la lámina 01) |
| ↺ | Reiniciar audio de la diapositiva |
| ‹ › | Diapositiva anterior / siguiente |
| 🔊 | Activar / desactivar sonido |
| Volumen | Control deslizante de volumen |
| ⟳ | Activar / desactivar reproducción automática |
| ⛶ | Pantalla completa |

**Atajos de teclado:** `Espacio` reproducir/pausar · `←` / `→` navegar ·
`F` pantalla completa · `M` silenciar.

---

## 📁 Estructura del proyecto

```
.
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos (escenario 16:9, controles, indicadores)
├── js/
│   └── app.js          # Lógica de reproducción, navegación y video
├── img/
│   └── Diapositiva01.png … Diapositiva20.png   (1920 × 1080)
└── audio/
    ├── Audio01.mp3 … Audio16.mp3
    ├── Audio17-18.mp3   # compartido por las diapositivas 17 y 18
    ├── Audio19.mp3
    └── Audio20.mp3
```

---

## 🚀 Uso

### En línea (GitHub Pages)
Abrir la URL publicada del repositorio. El video con sonido funciona correctamente
porque se sirve sobre HTTPS.

### Local
Servir la carpeta con un servidor HTTP (no abrir `index.html` directo desde el disco,
ya que el video de YouTube requiere un origen HTTP válido):

```bash
python -m http.server 8000
# luego abrir http://localhost:8000
```

---

## ⚙️ Notas técnicas

- HTML5 + CSS3 + JavaScript puro, **sin frameworks**.
- El video usa la **YouTube IFrame API**. El reproductor se "desbloquea" con el primer
  clic en *Reproducir* para permitir autoplay **con sonido** sin clics adicionales.
- Las imágenes se escalan con `object-fit: contain`: nunca se deforman ni se recortan.
- El avance automático se basa en los eventos `ended` del audio y del video.

> En algunos navegadores móviles con políticas de autoplay muy estrictas, el sonido del
> video podría requerir una interacción del usuario. Es una limitación del navegador, no
> de la aplicación.

---

## 🛠️ Mantenimiento

- **Reemplazar diapositivas:** sustituir los PNG en `img/` conservando los nombres.
- **Reemplazar narraciones:** sustituir los MP3 en `audio/` conservando los nombres.
- **Cambiar el video:** editar `YT_VIDEO_ID` en `js/app.js`.

---

© Consorcio Rovella-INMAC · Recursos Humanos

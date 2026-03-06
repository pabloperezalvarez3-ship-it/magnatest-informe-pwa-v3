MAGNATEST - Informe de Inspección (build)
===========================================

Cambios clave:
- Logo fijado arriba-izquierda en PDF (A4) exactamente al margen.
- Hoja sin padding en impresión para respetar márgenes.
- Se mantiene todo el estilo/tablas/galería y botones de guardado/carga.
- Service Worker registrado (opcional) para modo offline.

Cómo imprimir a PDF en Chrome:
1) Archivo → Imprimir…
2) Destino: Guardar como PDF.
3) Márgenes: Predeterminados (o "Personalizados" = 10 mm).
4) Encabezados y pies de página: DESACTIVADOS.
5) Escala: 100%.

Si desea ajustar la posición/tamaño del logo,
edite en index.html las variables:
  --mgt-page-margin  (margen de la página)
  --mgt-logo-size    (altura del logo)

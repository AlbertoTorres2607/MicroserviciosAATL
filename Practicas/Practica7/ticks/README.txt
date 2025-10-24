PRACTICA TICKS STACK + MICRO-SERVICIO (Node.js) - Windows (Docker)
==================================================================

Contenido:
- docker-compose.yml
- microservicio/
    - app.js
    - package.json
    - Dockerfile
- telegraf/telegraf.conf
- kapacitor/tick_script.tick

Servicios y puertos:
- Microservicio: http://localhost:4000/personas
- Métricas JSON: http://localhost:4000/metrics
- Telegraf listener: http://localhost:8080/metrics
- InfluxDB: http://localhost:8086
- Chronograf: http://localhost:8888
- Kapacitor: http://localhost:9092

Ejecución:
1. Abre PowerShell en la carpeta descomprimida.
2. Ejecuta: docker-compose up --build
3. Espera a que todos los servicios estén listos.

Configuración inicial:
- Accede a Chronograf: http://localhost:8888
- Conecta a InfluxDB: http://influxdb:8086
- Conecta a Kapacitor: http://kapacitor:9092
- Explora las métricas (cpu, mem, disco y /metrics del microservicio).

Alerta en Kapacitor:
- La alerta está definida en kapacitor/tick_script.tick.
- Se activa cuando errorCount > 3 en las métricas JSON.
- Los logs se guardan en el contenedor en /tmp/alerts.log.

Pruebas rápidas:
- curl http://localhost:4000/personas
- curl http://localhost:4000/personas/999 (genera error para subir errorCount)

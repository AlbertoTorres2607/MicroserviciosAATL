PRACTICA ELK + MICRO-SERVICIO (Node.js) - Windows (Docker)
=========================================================

Contenido del ZIP:
- docker-compose.yml
- microservicio/
    - app.js
    - package.json
    - Dockerfile
- logstash/
    - logstash.conf
- README.txt  (este archivo)

Requisitos previos (Windows):
- Docker Desktop instalado y corriendo.
- Recomendado: WSL2 activado (no obligatorio para Docker Desktop moderno).
- Puerto 9200 (Elasticsearch), 5601 (Kibana), 5044 (Logstash) y 3000 (microservicio) libres.

Pasos para ejecutar:
1) Abrir PowerShell (o terminal) en la carpeta donde descomprimiste este ZIP.
2) Ejecutar: docker-compose up --build
3) Espera a que los contenedores estén listos. Puedes ver los logs en la terminal.
   - Elasticsearch: http://localhost:9200
   - Kibana: http://localhost:5601
   - Microservicio: http://localhost:3000/personas
   - Health: http://localhost:3000/health

Configuración en Kibana:
1) Abrir http://localhost:5601
2) Ve a "Stack Management" -> "Index Patterns" (o "Index Management" -> "Index Patterns")
3) Crea un patrón de índice: microservicio-logs-*
4) Ve a "Discover" y selecciona el patrón para ver los logs que llegan.

Pruebas rápidas (en otra terminal o desde Postman):
- GET todas las personas:
  curl http://localhost:3000/personas

- GET persona por id:
  curl http://localhost:3000/personas/1

- POST nueva persona:
  curl -X POST http://localhost:3000/personas -H "Content-Type: application/json" -d "{"id":3,"nombre":"Luis","edad":28}"

Notas:
- Esta configuración desactiva la seguridad de Elasticsearch (xpack.security.enabled=false)
  para facilitar la práctica en local. NO usar esto en producción.
- Si los logs no aparecen inmediatamente en Kibana, revisa los logs de Logstash:
  docker logs -f logstash



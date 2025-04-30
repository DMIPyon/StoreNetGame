# StoreNetGames Server

Este proyecto es el servidor de la aplicación StoreNetGames.

## Requisitos

- Node.js >= 14
- PostgreSQL

## Instalación

1. Clona el repositorio:

   ```bash
   git clone <url-del-repo>
   cd StoreNetGames/server
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las variables de entorno creando un archivo `.env` en la raíz con las siguientes variables:

   ```env
   PORT=3000
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   RAWG_API_KEY=tu_api_key_rawg
   ```

4. Compila el proyecto:

   ```bash
   npm run build
   ```

5. Ejecuta las migraciones y seeds (si aplica). Puedes usar nuestros scripts en `src/scripts`:

   ```bash
   npx ts-node src/scripts/importMoreGames.ts
   ```

6. Inicia el servidor:

   ```bash
   npm start
   ```

## Scripts Disponibles

- `npm start`: Inicia el servidor.
- `npm run build`: Compila el proyecto.
- `npx ts-node src/scripts/[script.ts]`: Ejecuta un script de importación.

## Estructura del Proyecto

```
server/
├── src/
│   ├── config/      # Configuraciones de la base de datos y servidor
│   ├── controllers/ # Controladores de la API
│   ├── models/      # Definiciones de modelos de datos (opcional)
│   ├── services/    # Servicios de integración (RAWG API, tiendas)
│   ├── scripts/     # Scripts para poblar la base de datos
│   └── index.ts     # Punto de entrada del servidor
``` 
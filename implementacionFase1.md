# Guía de Implementación - Chat Inteligente SamanaInn (Fase 1)

## Introducción

Esta guía proporciona instrucciones detalladas para implementar la primera fase del sistema de chat inteligente para SamanaInn. La Fase 1 se centra en establecer la arquitectura base, la API backend y la landing page frontend.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

1. **Backend API** (Node.js/Express)
2. **Frontend** (Vue.js)

### Estructura de Directorios

```
samanainn-chatbot/
├── api/             # Backend (Node.js/Express)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   ├── agents/
│   │   ├── utils/
│   │   ├── routes/
│   │   └── app.js
│   ├── .env
│   └── package.json
└── frontend/        # Frontend (Vue.js)
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   └── App.vue
    ├── public/
    └── package.json
```

## Requisitos Previos

- Node.js (v16.0.0 o superior)
- NPM (v8.0.0 o superior)
- MySQL (v5.7 o superior)
- Cuenta en un proveedor de IA (OpenAI o Anthropic)

## Pasos de Implementación

### 1. Configuración del Entorno

#### Backend (API)

1. Crear un nuevo directorio para el proyecto:
   ```bash
   mkdir -p samanainn-chatbot/api
   cd samanainn-chatbot/api
   ```

2. Inicializar el proyecto Node.js:
   ```bash
   npm init -y
   ```

3. Instalar dependencias:
   ```bash
   npm install express cors dotenv morgan mysql2
   npm install --save-dev nodemon jest supertest
   ```

4. Crear el archivo `.env` utilizando la plantilla proporcionada en los artefactos.

5. Configurar el `package.json` según la plantilla proporcionada en los artefactos.

#### Frontend (Vue.js)

1. Crear un nuevo proyecto Vue:
   ```bash
   cd ..
   vue create frontend
   ```

2. Seleccionar las siguientes opciones:
   - Manually select features
   - Babel, Router, Vuex, CSS Pre-processors
   - Dedicar configuración en archivos separados
   - SCSS como preprocesador

3. Instalar dependencias adicionales:
   ```bash
   cd frontend
   npm install axios
   ```

### 2. Implementación del Backend

1. Crear la estructura de directorios según lo indicado anteriormente.

2. Copiar los archivos proporcionados en los artefactos a sus ubicaciones correspondientes:
   - `app.js` en `src/app.js`
   - `database.js` en `src/config/database.js`
   - `chatController.js` en `src/controllers/chatController.js`
   - Agentes en `src/agents/`
   - Servicios en `src/services/`
   - Rutas en `src/routes/`

3. Crear la base de datos y configurar acceso según el archivo `.env`.

4. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

### 3. Implementación del Frontend

1. Reemplazar `src/App.vue` con la plantilla proporcionada en los artefactos.

2. Crear el componente `ChatInterface.vue` en `src/components/` utilizando la plantilla proporcionada.

3. Configurar el enrutador Vue en `src/router/index.js` para que apunte a la página principal.

4. Crear archivos de estilo en `src/assets/css/`.

5. Iniciar el servidor de desarrollo:
   ```bash
   npm run serve
   ```

### 4. Conexión con la Base de Datos MySQL

1. Asegurarse de que el servidor MySQL esté en ejecución.

2. Importar el archivo SQL proporcionado (`smv2_36.sql`) para crear la estructura de la base de datos:
   ```bash
   mysql -u root -p < smv2_36.sql
   ```

3. Verificar la conexión a la base de datos utilizando el endpoint de verificación de salud:
   ```
   GET http://localhost:3000/health
   ```

### 5. Configuración de Proveedores de IA

1. Registrarse en OpenAI o Anthropic para obtener una clave de API.

2. Actualizar el archivo `.env` con las claves de API adecuadas.

### 6. Pruebas del Sistema

1. Probar la API utilizando Postman o cualquier cliente HTTP:
   ```
   POST http://localhost:3000/api/chat/message
   {
     "message": "¿Qué puedo hacer en Samaná?"
   }
   ```

2. Verificar que la respuesta incluya:
   - Mensaje generado
   - Acciones de UI
   - ID de conversación

3. Probar la landing page accediendo a:
   ```
   http://localhost:8080
   ```

4. Probar la interacción del chat con diferentes tipos de consultas:
   - Información general sobre Samaná
   - Consultas sobre alojamientos
   - Consultas sobre restaurantes
   - Consultas sobre excursiones

## Limitaciones de la Fase 1

- No hay persistencia de conversaciones en la base de datos
- Las respuestas son simuladas basadas en datos predefinidos
- No hay integración completa con el sistema de reservas existente
- No hay autenticación ni limitación de tasa (rate limiting)

## Próximos Pasos (Fase 2)

1. Implementar persistencia de conversaciones
2. Integrar completamente con el sistema de reservas de SamanaInn
3. Mejorar la calidad de las respuestas con análisis de lenguaje natural más avanzado
4. Implementar autenticación y seguridad
5. Añadir análisis de sentimiento para detectar la satisfacción del usuario

## Soporte

Para cualquier problema durante la implementación, contactar al equipo de desarrollo en:
- Email: dev-team@samanainn.com
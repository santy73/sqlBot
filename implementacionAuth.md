# Implementación de Autenticación API para Chat SamanaInn

## Descripción General

Se ha implementado un sistema de autenticación básico mediante API Key para proteger los endpoints del servicio de chat. Esto garantiza que solo las aplicaciones autorizadas puedan acceder a la API.

## Componentes Implementados

1. **Middleware de Autenticación**
   - Verifica la presencia y validez de la API Key en cada solicitud
   - Bloquea acceso a rutas protegidas sin autenticación válida

2. **Configuración de Rutas Protegidas**
   - Todas las rutas bajo `/api/` requieren autenticación
   - Rutas públicas (como health check) permanecen accesibles

3. **Integración con Frontend**
   - Servicio API para gestionar autenticación en peticiones
   - Configuración para incluir API Key en todas las solicitudes

## Instrucciones de Configuración

### 1. Configuración de Entorno

Añade la siguiente variable al archivo `.env`:

```
API_SECRET_KEY=tu_clave_secreta_aqui
```

**IMPORTANTE**: Genera una clave segura y única para entornos de producción. Nunca uses la clave de ejemplo.

### 2. Instalación del Middleware

El middleware de autenticación ya está instalado en `src/middleware/auth.js`.

### 3. Frontend

Asegúrate de que el frontend usa la misma API Key que está configurada en el backend.

Para desarrollo, puedes usar:

```javascript
// Configuración de desarrollo
const API_KEY = 'tu_clave_secreta_aqui';
```

Para producción, considera utilizar variables de entorno:

```javascript
// Configuración de producción
const API_KEY = process.env.VUE_APP_API_KEY;
```

## Pruebas

### 1. Verificar Acceso Protegido

Intenta acceder a un endpoint protegido sin API Key:

```bash
curl -X GET http://localhost:3000/api/chat/conversations
```

Deberías recibir un error 401 (Unauthorized).

### 2. Acceso con API Key

Prueba con la API Key correcta:

```bash
curl -X GET http://localhost:3000/api/chat/conversations \
  -H "X-API-Key: tu_clave_secreta_aqui"
```

### 3. Verificar Rutas Públicas

Las rutas públicas deben seguir funcionando sin autenticación:

```bash
curl -X GET http://localhost:3000/health
```

## Seguridad Adicional

Esta implementación proporciona un nivel básico de seguridad. Para entornos de producción, considera estas mejoras:

1. **Rotación de Claves**: Cambia periódicamente la API Key
2. **Rate Limiting**: Limita el número de solicitudes por IP/API Key
3. **HTTPS**: Asegúrate de usar HTTPS en producción
4. **JWT**: Para usuarios autenticados, implementa JWT (estructura ya preparada)

## Próximos Pasos

Esta autenticación básica protege contra accesos no autorizados generales. En futuras fases, se recomienda:

1. Implementar autenticación de usuario con JWT
2. Añadir permisos por roles
3. Configurar monitoreo de seguridad y alertas

---

Para cualquier problema durante la implementación, contactar al equipo de desarrollo:
- Email: dev-team@samanainn.com
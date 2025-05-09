# API de Chat Inteligente SamanaInn

## Descripción

Esta API proporciona los endpoints necesarios para implementar un chat inteligente en el sitio web de SamanaInn, especializado en reservas y consultas sobre Samaná, República Dominicana. El sistema utiliza una arquitectura de agentes múltiples para procesar consultas de usuarios y proporcionar respuestas relevantes.

## Versión

1.0.0

## Base URL

```
https://api.samanainn.com/api
```

## Autenticación

Para la fase inicial, la API no requiere autenticación. En fases posteriores, se implementará un sistema de autenticación basado en tokens JWT.

## Endpoints

### Chat

#### Procesar Mensaje

```
POST /chat/message
```

Procesa un mensaje del usuario y genera una respuesta utilizando el sistema de agentes.

**Parámetros de solicitud (JSON):**

| Nombre | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| message | String | Sí | Mensaje del usuario |
| conversationId | String | No | ID de la conversación (si existe) |
| context | Object | No | Contexto adicional para la conversación |

**Ejemplo de solicitud:**

```json
{
  "message": "¿Qué puedo hacer en Samaná?",
  "conversationId": "conv_123456789",
  "context": {
    "lang": "es"
  }
}
```

**Respuesta exitosa (200 OK):**

```json
{
  "success": true,
  "response": {
    "message": "Samaná ofrece muchas actividades interesantes...",
    "ui": {
      "showResults": false,
      "updateBanner": true,
      "bannerType": "activities",
      "suggestedQuestions": [
        "¿Dónde puedo ver ballenas?",
        "¿Cómo llego a Playa Rincón?",
        "¿Qué tour me recomendarías?"
      ]
    }
  },
  "conversationId": "conv_123456789"
}
```

**Respuesta de error (400 Bad Request):**

```json
{
  "success": false,
  "error": "El mensaje es requerido"
}
```

### Booking

#### Generar URL de Reserva

```
POST /booking/generate-url
```

Genera una URL para redireccionar al usuario a la página de reserva correspondiente.

**Parámetros de solicitud (JSON):**

| Nombre | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| type | String | Sí | Tipo de reserva (accommodation, restaurant, tour, car) |
| slug | String | No | Slug del elemento específico |
| checkIn | String | No | Fecha de entrada (formato YYYY-MM-DD) |
| checkOut | String | No | Fecha de salida (formato YYYY-MM-DD) |
| adults | Number | No | Número de adultos |
| children | Number | No | Número de niños |

**Ejemplo de solicitud:**

```json
{
  "type": "accommodation",
  "slug": "hotel-las-ballenas",
  "checkIn": "2025-06-15",
  "checkOut": "2025-06-20",
  "adults": 2,
  "children": 1
}
```

**Respuesta exitosa (200 OK):**

```json
{
  "success": true,
  "bookingURL": "https://samanainn.com/hotel/hotel-las-ballenas?check_in=2025-06-15&check_out=2025-06-20&adults=2&children=1"
}
```

**Respuesta de error (400 Bad Request):**

```json
{
  "success": false,
  "error": "El tipo de reserva es requerido"
}
```

### Banner

#### Obtener Información de Banner

```
GET /banner/info?type=activities
```

Obtiene información específica para mostrar en un banner dinámico.

**Parámetros de consulta:**

| Nombre | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| type | String | No | Tipo de banner (general, accommodation, gastronomy, activities, transport) |

**Respuesta exitosa (200 OK):**

```json
{
  "success": true,
  "banner": {
    "title": "Aventuras en Samaná",
    "subtitle": "Excursiones y actividades para todos",
    "imageUrl": "/assets/images/banner_activities.jpg",
    "action": {
      "text": "Ver actividades",
      "url": "/tours"
    }
  }
}
```

## Modelos de Datos

### Respuesta del Chat

La respuesta del sistema de chat puede incluir varios elementos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| message | String | Mensaje de respuesta principal |
| error | Boolean | Indica si hubo un error (opcional) |
| ui | Object | Configuración de elementos de UI |
| ui.showResults | Boolean | Indica si se deben mostrar resultados |
| ui.resultType | String | Tipo de resultados (accommodation, restaurant, tour, information) |
| ui.updateBanner | Boolean | Indica si se debe actualizar el banner |
| ui.bannerType | String | Tipo de banner a mostrar |
| ui.bannerTitle | String | Título para el banner (opcional) |
| ui.bannerImage | String | URL de imagen para el banner (opcional) |
| ui.suggestedQuestions | Array | Lista de preguntas sugeridas para el usuario |
| ui.showBookingButton | Boolean | Indica si se debe mostrar un botón de reserva |
| ui.bookingButtonText | String | Texto para el botón de reserva |
| ui.bookingButtonURL | String | URL para el botón de reserva |
| results | Array | Resultados de búsqueda (opcional) |

## Códigos de Estado

- `200 OK`: Solicitud exitosa
- `400 Bad Request`: Error en los parámetros de la solicitud
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

## Limitaciones

En la fase actual (1.0.0), la API tiene las siguientes limitaciones:

- No hay persistencia de conversaciones en la base de datos
- Las respuestas son simuladas basadas en datos predefinidos
- No hay integración completa con el sistema de reservas existente
- No hay autenticación ni limitación de tasa (rate limiting)

Estas limitaciones se abordarán en futuras versiones.

## Contacto

Para soporte o consultas sobre la API, contactar a:

- Email: api-support@samanainn.com
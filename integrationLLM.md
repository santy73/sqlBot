# Integración de Modelos de Lenguaje Avanzados

## Descripción General

Se ha implementado la integración con modelos de lenguaje avanzados (GPT-4o de OpenAI y Claude de Anthropic) para potenciar el chat inteligente de SamanaInn. Esta implementación permite una interacción más natural, contextual y precisa con los usuarios.

## Componentes Implementados

1. **Servicio de IA Actualizado**
   - Soporte para múltiples proveedores (OpenAI y Anthropic)
   - Gestión de prompts específicos según el contexto
   - Análisis de sentimiento integrado

2. **Configuración Flexible**
   - Variables de entorno para ajustar parámetros
   - Instrucciones personalizadas por tipo de consulta
   - Fácil cambio entre proveedores

3. **Capacidades Mejoradas**
   - Comprensión contextual de consultas complejas
   - Respuestas más precisas y relevantes
   - Base para análisis de satisfacción de usuario

## Configuración

### 1. Credenciales de API

Configura las credenciales en el archivo `.env`:

```
# Configuración principal
AI_PROVIDER=openai # o anthropic
AI_API_KEY=tu_api_key_principal

# Configuración OpenAI
OPENAI_API_KEY=tu_api_key_de_openai
OPENAI_MODEL=gpt-4o

# Configuración Anthropic
ANTHROPIC_API_KEY=tu_api_key_de_anthropic
ANTHROPIC_MODEL=claude-3-opus-20240229
```

### 2. Ajuste de Parámetros

Personaliza el comportamiento ajustando:

```
# Comportamiento del modelo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2048
ANTHROPIC_TEMPERATURE=0.7
ANTHROPIC_MAX_TOKENS=2048

# Análisis
ENABLE_SENTIMENT_ANALYSIS=true
```

## Uso y Funcionamiento

El sistema ahora utiliza el modelo de lenguaje seleccionado para:

1. **Procesar consultas del usuario**
   - Analiza la intención y contexto de cada mensaje
   - Genera respuestas naturales y coherentes
   - Mantiene el flujo de conversación

2. **Determinar acciones necesarias**
   - Identifica cuando buscar información en la base de datos
   - Decide qué agentes especialistas involucrar
   - Sugiere opciones relevantes al usuario

3. **Analizar sentimiento (opcional)**
   - Evalúa la satisfacción del usuario
   - Detecta frustraciones o problemas
   - Adapta respuestas según el tono detectado

## Comparativa de Modelos

| Característica     | OpenAI (GPT-4o)                  | Anthropic (Claude)                |
|--------------------|----------------------------------|-----------------------------------|
| Fortalezas         | Conocimiento general muy amplio  | Instrucciones complejas, contexto |
|                    | Integración con otros servicios  | Respuestas más estructuradas      |
|                    | Amplia comunidad de desarrollo   | Menor tendencia a alucinaciones   |
| Costos             | ~$0.01/1K tokens entrada         | ~$0.015/1K tokens entrada         |
|                    | ~$0.03/1K tokens salida          | ~$0.075/1K tokens salida          |
| Límites            | 8K-128K tokens (según modelo)    | 200K tokens                       |
| Mejor para         | Búsquedas generales, creatividad | Consultas detalladas, seguridad   |

## Ejemplos de Instrucciones Personalizadas

El sistema utiliza instrucciones específicas según el tipo de consulta:

**Para alojamiento:**
```
Eres un especialista en alojamientos en Samaná, República Dominicana...
```

**Para gastronomía:**
```
Eres un experto en gastronomía de Samaná, República Dominicana...
```

Estas instrucciones se encuentran en `src/config/ai.js` y pueden personalizarse.

## Rendimiento y Optimización

Para optimizar costos y rendimiento:

1. **Ajuste la temperatura**
   - Valores más bajos (0.3-0.5) para respuestas más predecibles
   - Valores más altos (0.7-0.9) para mayor creatividad

2. **Limite los tokens de contexto**
   - Ajuste `MAX_CONVERSATION_HISTORY` según necesidad
   - Configure `MAX_TOKENS` apropiadamente

3. **Monitoree uso y costos**
   - Implemente registro de uso para análisis de costos
   - Ajuste parámetros según patrones de uso

## Próximos Pasos

Con la integración de modelos de lenguaje avanzados, se recomienda:

1. Implementar aprendizaje continuo con feedback de usuarios
2. Desarrollar plantillas específicas para diferentes escenarios
3. Optimizar prompts según análisis de rendimiento real
4. Incorporar memoria a largo plazo para usuarios recurrentes

---

Para cualquier problema o consulta, contactar al equipo de desarrollo:
- Email: dev-team@samanainn.com
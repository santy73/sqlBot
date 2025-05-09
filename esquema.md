```
samanainn-chatbot-api/
├── src/
│   ├── config/
│   │   ├── database.js       # Configuración de conexión a MySQL
│   │   ├── ai.js             # Configuración de servicios de IA
│   │   └── index.js          # Exportaciones de configuración
│   ├── controllers/
│   │   ├── chatController.js # Controlador principal del chat
│   │   ├── bookingController.js # Controlador de reservas
│   │   └── bannerController.js  # Controlador para banners dinámicos
│   ├── models/
│   │   ├── conversation.js   # Modelo para gestionar conversaciones
│   │   ├── booking.js        # Modelo para interactuar con las tablas de reservas
│   │   └── content.js        # Modelo para contenido del blog y descripciones
│   ├── services/
│   │   ├── aiService.js      # Servicio de integración con IA
│   │   ├── agentService.js   # Servicio de gestión de agentes
│   │   └── dbService.js      # Servicio de consulta a base de datos
│   ├── agents/
│   │   ├── expertAgent.js    # Agente Experto en SamanaInn
│   │   ├── queryAgent.js     # Agente de Consulta
│   │   ├── bookingAgent.js   # Agente de Booking
│   │   ├── specificAgents/   # Agentes específicos
│   │   │   ├── gastronomyAgent.js
│   │   │   ├── activitiesAgent.js
│   │   │   └── accommodationAgent.js
│   │   └── validationAgent.js # Agente de Validación
│   ├── utils/
│   │   ├── logger.js         # Utilidad de logging
│   │   ├── responseFormatter.js # Formateador de respuestas
│   │   └── urlBuilder.js     # Constructor de URLs para redirecciones
│   ├── routes/
│   │   ├── chatRoutes.js     # Rutas para el chat
│   │   ├── bookingRoutes.js  # Rutas para consultas de reservas
│   │   └── bannerRoutes.js   # Rutas para banners dinámicos
│   └── app.js               # Punto de entrada de la aplicación
├── .env                    # Variables de entorno
├── package.json            # Dependencias y scripts
└── README.md               # Documentación
└── frontend/        # Frontend (Vue.js)
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   └── App.vue
    ├── public/
    └── package.json
```
# Sistema de Gestión de Recibos

Un sistema web para gestionar y visualizar recibos de sueldo, vacaciones y bajas sin cubrir, con autenticación de usuarios y filtros por dependencia.

## 🚀 Características

- **Autenticación segura**: Sistema de login con usuarios y contraseñas
- **Múltiples tipos de documentos**: Recibos de sueldo, vacaciones y bajas sin cubrir  
- **Filtrado por dependencia**: Acceso restringido según el usuario
- **Búsqueda por legajo**: Filtro rápido para encontrar documentos específicos
- **Descarga de PDFs**: Acceso directo a los documentos almacenados
- **Diseño responsive**: Compatible con dispositivos móviles y de escritorio

## 📁 Estructura del Proyecto

```
ReciboSueldo/
├── index.html          # Página principal (estructura base)
├── style.css          # Estilos CSS separados
├── templates.js       # Plantillas HTML separadas  
├── script.js          # Lógica JavaScript principal
└── README.md          # Documentación
```

## 🛠️ Arquitectura

### Separación de Responsabilidades

El proyecto está estructurado siguiendo el principio de separación de responsabilidades:

- **HTML (`index.html`)**: Estructura básica del documento y referencias a archivos
- **CSS (`style.css`)**: Todos los estilos visuales y responsive
- **JavaScript (`script.js`)**: Lógica de negocio y funcionalidad
- **Plantillas (`templates.js`)**: Plantillas HTML reutilizables

### Componentes Principales

#### 1. GestorRecibos (Clase Principal)
```javascript
class GestorRecibos {
    // Gestiona toda la lógica de la aplicación
    // - Autenticación de usuarios
    // - Carga de datos desde Google Sheets
    // - Filtrado y visualización de documentos
}
```

#### 2. HTMLTemplates (Plantillas)
```javascript
const HTMLTemplates = {
    // Contiene todas las plantillas HTML
    // - Login
    // - Interfaz principal  
    // - Selección de tipo de documento
    // - Tarjetas de recibos
}
```

## 🔧 Configuración

### Google Sheets API
El sistema utiliza la API de Google Sheets para obtener los datos:

```javascript
ID_HOJA = '1TlxZvRKolH7K3cGr_JskyJkND16tm0URdB0tI2G2pQo';
CLAVE_API = 'AIzaSyDMyL1stX-QSMHPvuQAp93ipegoEYdg1mI';
```

### Estructura de Datos Esperada

#### Hoja "Usuarios" (Columnas A-D):
- A: Usuario
- B: Contraseña  
- C: Dependencia
- D: Rol (admin/superadmin)

#### Hoja Principal (Columnas A-E):
- A: Nombre
- B: Legajo
- C: Monto/Información
- D: URL del PDF
- E: Dependencia

## 🎨 Estilos CSS

### Clases Principales

- `.login-container`: Contenedor del formulario de login
- `.container`: Contenedor principal de la aplicación
- `.user-info`: Información del usuario logueado
- `.controls`: Controles de filtrado
- `.recibo-card`: Tarjetas individuales de documentos
- `.tipo-documento-btn`: Botones de selección de tipo

### Responsive Design
- Diseño móvil-first
- Breakpoint principal: `768px`
- Grid flexible para botones y controles

## 🔐 Autenticación

### Tipos de Usuario
- **Admin**: Acceso limitado a su dependencia
- **Superadmin**: Acceso a todas las dependencias

### Flujo de Autenticación
1. Ingreso de credenciales
2. Validación contra la hoja "Usuarios"
3. Configuración de permisos según rol
4. Redirección a interfaz principal

## 📋 Tipos de Documentos

### 1. Recibos de Sueldo (💰)
- Documentos de pago mensual
- Filtrado por legajo
- Descarga directa de PDF

### 2. Vacaciones (🏖️)
- Registros de períodos vacacionales  
- Información de fechas y días

### 3. Bajas sin Cubrir (📋)
- Registros de ausencias laborales
- Control de cobertura de puestos

## 🔍 Funcionalidades de Filtrado

### Por Dependencia
- Selección automática para usuarios admin
- Selector múltiple para superadmin

### Por Legajo
- Campo de búsqueda en tiempo real
- Filtrado case-insensitive
- Limpieza rápida de filtros

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, tablet, móvil
- **Resoluciones**: Desde 320px hasta 1200px+

## 🚦 Estado del Proyecto

✅ **Completado**:
- Separación de HTML, CSS y JavaScript
- Sistema de autenticación
- Gestión de múltiples tipos de documentos
- Diseño responsive
- Filtrado por dependencia y legajo

## 🔄 Mantenimiento

Para agregar nuevos tipos de documentos:

1. Actualizar `HTMLTemplates.getTipoTexto()` en `templates.js`
2. Agregar nueva hoja en Google Sheets
3. Modificar `cargarDocumentos()` en `script.js`

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contacte al equipo de desarrollo.

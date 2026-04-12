# TIKETS-empresarial

# 🛠️ Sistema de Tickets de Soporte Técnico (Help Desk)

## 📌 Descripción

Este proyecto consiste en un sistema de gestión de tickets de soporte técnico diseñado para entornos empresariales internos. Permite a los usuarios reportar problemas desde sus equipos y a los técnicos gestionar, resolver y comunicarse en tiempo real mediante un sistema de chat integrado.

El sistema está pensado como una base escalable, comenzando con una implementación local (localStorage) y preparado para evolucionar hacia un backend real con base de datos y autenticación.

---

## 🎯 Objetivos

* Permitir a usuarios reportar problemas de manera simple
* Facilitar la gestión de tickets por parte del equipo técnico
* Mantener trazabilidad de cada incidente
* Simular un entorno empresarial real
* Construir una base modular para futuras mejoras

---

## ⚙️ Tecnologías Utilizadas

### Frontend

* React + TypeScript
* Vite
* TailwindCSS
* Radix UI
* Lucide Icons
* Sonner (notificaciones)

### Almacenamiento (Temporal)

* LocalStorage (simulación de base de datos)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/DoSafills/TIKETS-empresarial.git
cd TIKETS-empresarial
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Dependencias importantes

Si algo falla, instalar manualmente:

```bash
npm install react-router-dom
npm install lucide-react
npm install sonner
npm install clsx tailwind-merge
npm install @radix-ui/react-tabs @radix-ui/react-slot
npm install class-variance-authority
npm install next-themes
```

### 4. TailwindCSS (si no está configurado)

```bash
npm install -D tailwindcss@3.4.1 postcss autoprefixer
npx tailwindcss init -p
```

Configurar `tailwind.config.js`:

```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
```

Agregar en `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### 5. Ejecutar el proyecto

```bash
npm run dev
```

Abrir en navegador:

```
http://localhost:5173
```

---

## 🧩 Funcionalidades

### 👤 Usuario

* Crear tickets con:

  * ID del equipo
  * Tipo de problema
  * Prioridad
  * Descripción
* Visualizar tickets activos
* Ver estado en tiempo real:

  * Pendiente
  * En proceso
* Chat en vivo con técnico

---

### 🧑‍🔧 Técnico

Acceso:

```
http://localhost:5173/tecnico
```

* Ver tickets:

  * Pendientes
  * En proceso
  * Resueltos
* Filtrar por:

  * ID de equipo
  * Prioridad
  * Técnico
* Cambiar estado:

  * "En camino"
  * "Resolver"
* Registrar:

  * Técnico responsable
  * Hora de inicio
  * Hora de resolución
  * Descripción de solución
* Chat con usuario
* Dashboard con contadores

---

## 🔐 Seguridad (actual)

* Acceso técnico con contraseña básica
* Datos almacenados localmente (no seguro para producción)

---

## 🏗️ Arquitectura Actual

```
src/
│
├── components/
│   ├── UserTicket.tsx
│   ├── TechPanel.tsx
│   ├── TicketChat.tsx
│   └── ui/
│
├── App.tsx
├── routes.tsx
├── main.tsx
└── index.css
```

---

## ⚠️ Limitaciones Actuales

* Uso de localStorage (no persistente en red)
* Sin backend real
* Sin autenticación real
* No multiusuario real
* No conexión entre dispositivos

---

## 🔮 Futuras Mejoras

### Backend

* Node.js + Express
* Base de datos (MongoDB / PostgreSQL)

### Seguridad

* Login real (JWT)
* Control de acceso por roles
* Restricción por red interna

### Sistema

* Tickets persistentes
* Historial completo
* Notificaciones en tiempo real (WebSockets)

### UI/UX

* Integración completa con Figma
* Modo oscuro funcional
* Dashboard avanzado (gráficos)

### Infraestructura

* Despliegue 
* Acceso en red local de empresa

---

## 🧠 Concepto del Proyecto

Este sistema simula un entorno real de mesa de ayuda (Help Desk), donde múltiples usuarios reportan incidencias y un equipo técnico las gestiona de forma organizada.



# PROYECTO DE PRUEBAS DE SOFTWARE - GESTIÓN DE CLIENTES DE UN GYM

## Descripción

Este es un proyecto de backend desarrollado con **Node.js**, **Express**, **ESLint** y **Jest + Supertest**.  
Sirve como ejemplo de servidor REST básico con todas sus operaciones de CRUD, destinado para  realizar verificación y validación 
del código de un proyecto básico que maneje una API REST para gestión de clientes de un GYM. Verficando  el comportamiento correcto de los endpoints de la API, lo que 
contribuye a mantener un código limpio, legible y menos propenso a errores. 
Este es un proyecto de backend desarrollado con **Node.js**, **Express**, **ESLint** y **Jest + Supertest**.  
Sirve como ejemplo de servidor REST básico con todas sus operaciones de CRUD, destinado para  realizar verificación y validación 
del código de un proyecto básico que maneje una API REST para gestión de clientes de un GYM. Verficando  el comportamiento correcto de los endpoints de la API, lo que 
contribuye a mantener un código limpio, legible y menos propenso a errores. 
Este es un proyecto de backend desarrollado con **Node.js**, **Express**, **ESLint** y **Jest + Supertest**.  
Sirve como ejemplo de servidor REST básico con todas sus operaciones de CRUD, destinado para  realizar verificación y validación 
del código de un proyecto básico que maneje una API REST para gestión de clientes de un GYM. Verficando  el comportamiento correcto de los endpoints de la API, lo que 
contribuye a mantener un código limpio, legible y menos propenso a errores. 


## Tecnologías

- Express 
- Node.js
- ESLint
- Jest + Supertest



## Instalación de paquetes

Ingresa el siguiente comando en la terminal para instalar todas las dependencias del proyecto:

```bash
npm install
```

## Comandos para pruebas 


Ingresa el siguiente comando en la terminal para la prueba de test:

```bash
npm test
```


Ingresa el siguiente comando en la terminal para la prueba de lint:

```bash
npm run lint
```

Ingresa el siguiente comando en la terminal para ver la covertura del porcentaje de pruebas y demas opciones:

```bash
npm test -- --coverage
```
## POSTGRES

En el proyecto se uso una base de datos relacional la cual es **Postgres**.

### Pasos

- Crear una base de datos con el nombre **gym** o otro nombre de su elección
- Copiar el archivo **gym.sql** en un script de el gestor de base de datos que utilice

> **Nota:** Recuerda duplicar el archivo `.env.dev` y colocarle el nombre `.env` para posteriormente configurar con tus credenciales antes de ejecutar la aplicación.

## Probar conexión de POSTGRES

Ingresa el siguiente comando en la terminal desde la raiz de proyecto para ver verificar la cenexión:

```bash
node src/testConn.js
```



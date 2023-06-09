# CumailNEXT web client

CumailNEXT web client is a web-based client application built using React, Vite, TypeScript, and Tailwind CSS. It serves as the front-end interface for the chat app, providing a user-friendly and interactive experience for users. The web client consists of two main components: Components and Contexts.

<img title="Main interface" src="screenshots/main_interface.png">

For the full breakdown of this (and the API server), please refer to [this documentation](https://docs.google.com/document/d/17DEX3SNfcOHoudm06Z7rVTxYYuEazj-0la5GNgK5hoY/edit?usp=sharing) written in Vietnamese.

## Sumary

CumailNEXT web client is the default web client for CumailNEXT API server, repository of which can be found [here](https://github.com/UwUOwOUmUOmO/cumail_next). It leverages React as the JavaScript library for building user interfaces, Vite as the fast build tooling framework, TypeScript for enhanced type safety, and Tailwind CSS for efficient styling and design.

## Features

- Built-in clickjacking protection: The web client is built with clickjacking protection measures in place. Clickjacking is a type of attack where malicious websites trick users into clicking on hidden or disguised elements. By implementing protection mechanisms, the web client ensures a secure browsing experience.
- Seamless authentication: By leveraging the API endpoints provided by CumailNEXT API server, the application allows users to login/register/logout and automatically store auth token in cookies. Despite not supporting CSRF token, the application does have other defense mechanism against it (given that connection to API server is secured, for more details please refer to [the documentation mentioned above](https://docs.google.com/document/d/17DEX3SNfcOHoudm06Z7rVTxYYuEazj-0la5GNgK5hoY/edit?usp=sharing))
- Chat room functionalities: CumailNEXT web client allows users to utilize almost every endpoints provided by the API server. Basic functionalities contains chatting (open WebSocket connection), receiving messages (through said connection), optimistic update, hyperlinks (thanks to regex), image/gif/youtube videos support, join other chat rooms. Other than that, there are also administrative features such as: chat room creation, editing room's name, creating invitations, kicking room's members.

<img title="Login interface" alt="Login windows" src="screenshots/login_interface.png">

<p style="text-align: center;">Login windows</p>

<img title="Admin interface" alt="Administrative interface" src="screenshots/management_interface.png">

<p style="text-align: center;">Administrative interface</p>

<img title="Admin interface" alt="Clickjacking warning" src="screenshots/clickjacking_warning.png">

<p style="text-align: center;">The application will show this interface if it detected any kind of clickjacking attack taking place</p>

## Technologies Used

CumailNEXT web client incorporates the following technologies:

- React: A popular JavaScript library for building user interfaces.
- Vite: A fast build tooling framework for modern web applications.
- TypeScript: A statically typed superset of JavaScript that enhances code reliability and maintainability.
- Tailwind CSS: A utility-first CSS framework for efficient styling and design.

## Installation and Setup

To setup CumailNEXT web client locally, follow these steps:

- Clone [this repository](https://github.com/UwUOwOUmUOmO/cumail_next_client.git)
- Run `npm install` to install all necessary dependencies
- Run `npm run dev` to start a local debug server
- An endpoint should appear on the console, follow it to use the application


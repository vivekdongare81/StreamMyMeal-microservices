# Spring Boot Microservices Project

A scalable food delivery system designed using Spring Boot microservices architecture, enabling seamless integration and performance.

## 🏗️ Architecture Overview
This project adopts a microservices-based architecture, ensuring modularity, fault isolation, and scalability.

![Architecture Diagram](./screenshot/architecture.png)

## 🚀 Key Components
### Backend Services
- **API Gateway** (Port: 8080) : Single entry point for requests, handling routing and load balancing.
- **Eureka Service Discovery** (Port: 8761) : Registers and discovers microservices for load balancing and monitoring.
- **User Service** (Port: 8081) : Manages user authentication, profiles, and JWT security.
- **Restaurant Service** (Port: 8082) : Handles restaurant data, menus, and image uploads.
- **Order Service** (Port: 8083) : Processes orders, integrates with users/restaurants, and tracks order statuses.
- **Notification Service** (Port: 8085) : Sends event-driven email notifications using Kafka.

### Frontend
- Modern UI built with Angular 17.
- Features intuitive design and JWT-based authentication.

## 🛠️ Technologies Used
**Backend**
  - Java 21, Spring Boot 3.3.4, Spring Cloud 2023.0.3
  - Spring Security (JWT), MySQL, Kafka, OpenAPI (Swagger)

**Frontend**
  - Angular 17, TypeScript, RxJS, TailwindCSS
    
**DevOps & Tools**
  - Docker, Maven, Git

## 📋 Prerequisites
Before running the project, ensure the following are installed:
- Java 21, Node.js 18+, MySQL 8+, Kafka, Docker, Maven

## 🚀 Running Services Independently
Each microservice in this project can be run as a standalone Spring Boot application. Follow the steps below to run individual services.

**1. Steps to Run an Individual Service:**
1. **Prerequisites:**
   
    ```bash
    https://github.com/Vanhuyne/food-order-microservice.git
    cd food-order-microservice
    ```
3. **Navigate to the Service Directory:**
   
   Each service has its own directory. For example:
    ```bash
    cd user-service
    ```
5. **Configure Application Properties**
   
    - Open src/main/resources/application.properties or application.yml
    - Update database and service-specific configurations. Example for MySQL:
      
    ```bash
    spring.datasource.url=jdbc:mysql://localhost:3306/user_service_db
    spring.datasource.username=username
    spring.datasource.password=password
    ```
6. **Build the Service**
   
     Run the following command to package the service:
     ```bash
     mvn clean install
     ```
7. **Set up the frontend**
   
     ```bash
     cd frontend
     npm install
     npm start
     ```
     
**2. Running with Docker:**
    Build docker to use Kafka
    
    docker-compose up -d
  

## WebRTC Live Streaming Service

A new backend service (`live-stream-signaling-service`) is added for handling WebRTC signaling between broadcasters (restaurants) and viewers. This enables real-time live streaming for up to 2-3 restaurants at a time.

### How it works
- Restaurant owners use a special Broadcaster page to start a live stream.
- Users can watch the live stream on a Viewer page.
- The signaling server uses WebSockets (Socket.io) to exchange WebRTC offers/answers/candidates.

### How to run
1. Go to `live-stream-signaling-service/` and run `npm install && node server.js`.
2. Start the frontend as usual.
3. Use the Broadcaster and Viewer pages to test live streaming.

See the code in `live-stream-signaling-service/server.js` and the new pages in `frontend-app/src/pages/Broadcaster.tsx` and `frontend-app/src/pages/Viewer.tsx`.
  




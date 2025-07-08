FROM openjdk:18-alpine
#COPY target/*.jar app.jar
ADD target/orders-1.0-SNAPSHOT.jar orders.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "/orders.jar"]
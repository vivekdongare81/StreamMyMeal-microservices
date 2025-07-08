FROM openjdk:18-alpine
#COPY target/*.jar app.jar
ADD target/delivery-1.0-SNAPSHOT.jar delivery.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/delivery.jar"]
FROM openjdk:18-alpine
#COPY target/*.jar app.jar
ADD target/users-1.0-SNAPSHOT.jar users.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "/users.jar"]
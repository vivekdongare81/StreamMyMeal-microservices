FROM openjdk:18-alpine
#COPY target/*.jar app.jar
ADD target/discovery-1.0-SNAPSHOT.jar discovery.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "/discovery.jar"]
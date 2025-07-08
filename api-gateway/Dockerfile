FROM openjdk:18-alpine
#COPY target/*.jar app.jar
ADD target/gateway-1.0-SNAPSHOT.jar gateway.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "/gateway.jar"]
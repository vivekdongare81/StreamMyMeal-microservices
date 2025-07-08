FROM openjdk:18-alpine
#COPY target/*.jar app.jar
ADD target/restaurants-1.0-SNAPSHOT.jar restaurants.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "/restaurants.jar"]
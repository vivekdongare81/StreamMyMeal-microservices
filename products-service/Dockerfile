FROM openjdk:18-alpine
#COPY target/*.jar app.jar
ADD target/products-1.0-SNAPSHOT.jar products.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "/products.jar"]
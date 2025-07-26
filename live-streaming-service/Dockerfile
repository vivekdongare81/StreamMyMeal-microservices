# Build stage
FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:17-jdk-slim
WORKDIR /app
# Install FFmpeg for live streaming
RUN apt-get update && apt-get install -y ffmpeg
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8085 1935 8000
ENTRYPOINT ["java", "-jar", "app.jar"]

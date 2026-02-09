# Use Maven image to build the application
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
# Correct path to nested project structure
COPY video-sharing-app/video-sharing-app/pom.xml .
COPY video-sharing-app/video-sharing-app/src ./src
RUN mvn clean package -DskipTests

# Use OpenJDK image to run the application
FROM openjdk:17.0.1-jdk-slim
WORKDIR /app
COPY --from=build /app/target/video-sharing-app-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

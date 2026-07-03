FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/trip-service-1.0.0.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]

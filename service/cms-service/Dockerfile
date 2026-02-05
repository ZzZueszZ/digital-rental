#FROM gradle:8.1.1-jdk17 as builder
#
#WORKDIR /app
#COPY build.gradle .
#COPY gradle.properties .
#COPY settings.gradle .
#COPY gradlew .
#COPY src ./src
#
#RUN gradle build -x test

########################
FROM openjdk:17-alpine
RUN apk add --no-cache tzdata
ENV TZ="UTC"

WORKDIR /app
COPY build/libs/*-SNAPSHOT.jar application.jar

#COPY --from=builder /app/build/libs/*-SNAPSHOT.jar application.jar

ENV SPRING_OUTPUT_ANSI_ENABLED=ALWAYS \
    JHIPSTER_SLEEP=0 \
    JAVA_OPTS=""

EXPOSE 8082

CMD java -Djava.security.egd=file:/dev/./urandom -Xms1024m -Xmx1024m -XX:MaxMetaspaceSize=256m -jar /app/application.jar
# --spring.profiles.active=prod
# Java / Spring Boot Setup

## What Gets Installed

When you use `npx everything-copilot init` with Java/Spring Boot, you get:

### Agents

- **Java Reviewer** — Spring patterns, JPA, security review
- **TDD** — JUnit 5 + Mockito RED→GREEN→REFACTOR
- **Security Reviewer** — Spring Security, OWASP checks
- **Build Fixer** — Maven/Gradle build error resolution
- **Architect** — System design, microservices patterns

### Skills

- `java-spring-boot` — Spring Boot patterns, JPA, security, testing
- `coding-standards/java.md` — Java 17+ coding standards
- `backend-patterns` — API design, databases, caching, events
- `security-review` — OWASP Top 10, dependency scanning
- `test-driven-development` — TDD workflow, coverage targets

### Instructions

- `java.instructions.md` — Auto-loads for all `*.java` files

## Recommended Project Structure

```
src/
├── main/
│   ├── java/com/example/app/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── exception/
│   │   └── mapper/
│   └── resources/
│       ├── application.yml
│       ├── application-dev.yml
│       └── db/migration/
│           └── V1__init.sql
├── test/
│   ├── java/com/example/app/
│   │   ├── controller/
│   │   ├── service/
│   │   └── repository/
│   └── resources/
│       └── application-test.yml
└── pom.xml (or build.gradle.kts)
```

## Essential Dependencies (Maven)

```xml
<dependencies>
    <!-- Core -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>

    <!-- Dev -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## AGENTS.md Snippet for Java Team

```markdown
## Java Reviewer

You are a Java and Spring Boot expert. Review code for Spring patterns,
JPA best practices, and security.

### Instructions
- Check for constructor injection (no field injection)
- Verify DTOs are used in controllers (never expose entities)
- Check @Transactional placement (service layer only)
- Verify N+1 query prevention (EntityGraph, JOIN FETCH)
- Ensure proper exception handling (@ControllerAdvice)

### Model
sonnet
```

## Workflow

```
1. Create entity + Flyway migration
2. Create repository interface
3. Create service with business logic
4. Create DTOs (records)
5. Create controller with validation
6. Write tests: unit → controller → integration
7. /code-review for quality check
8. /security-reviewer for security check
```

## Common Gotchas

| Issue | Solution |
|-------|----------|
| `LazyInitializationException` | Set `open-in-view=false`, use EntityGraph/JOIN FETCH |
| N+1 queries | `default_batch_fetch_size: 16` + EntityGraph |
| Circular dependencies | Restructure, use `@Lazy` as last resort |
| `@Transactional` not working | Must be on public methods, called from outside the class |
| Tests slow with `@SpringBootTest` | Use `@WebMvcTest` or `@DataJpaTest` for sliced tests |

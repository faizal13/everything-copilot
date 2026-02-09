# Spring Boot Patterns

## Application Architecture

### Layered Architecture

```
Controller (REST API)     ← Handles HTTP, validation, response mapping
    ↓
Service (Business Logic)  ← Business rules, transactions, orchestration
    ↓
Repository (Data Access)  ← JPA queries, database operations
    ↓
Entity (Domain Model)     ← Database table mapping
```

### Package Structure

```
com.example.myapp/
├── config/                  # @Configuration classes
│   ├── SecurityConfig.java
│   ├── CacheConfig.java
│   └── SwaggerConfig.java
├── controller/              # @RestController classes
│   ├── UserController.java
│   └── OrderController.java
├── service/                 # @Service classes
│   ├── UserService.java
│   └── OrderService.java
├── repository/              # @Repository interfaces
│   ├── UserRepository.java
│   └── OrderRepository.java
├── entity/                  # @Entity classes
│   ├── User.java
│   └── Order.java
├── dto/                     # Request/Response DTOs
│   ├── CreateUserRequest.java
│   ├── UserResponse.java
│   └── PagedResponse.java
├── exception/               # Custom exceptions + handler
│   ├── ResourceNotFoundException.java
│   ├── BusinessException.java
│   └── GlobalExceptionHandler.java
├── mapper/                  # Entity ↔ DTO mappers
│   └── UserMapper.java
└── MyAppApplication.java    # @SpringBootApplication
```

## Dependency Injection

### Constructor Injection (Preferred)

```java
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // Spring auto-injects via constructor (no @Autowired needed with single constructor)
    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }
}
```

### Never Do This

```java
// ❌ Field injection — hard to test, hides dependencies
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

## REST Controller Pattern

```java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponse>> listUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse created = userService.create(request);
        URI location = URI.create("/api/v1/users/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,
                                                    @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

## DTOs with Java Records

```java
// Request DTO
public record CreateUserRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 64) String password
) {}

// Response DTO
public record UserResponse(
    Long id,
    String name,
    String email,
    LocalDateTime createdAt
) {
    public static UserResponse from(User entity) {
        return new UserResponse(
            entity.getId(),
            entity.getName(),
            entity.getEmail(),
            entity.getCreatedAt()
        );
    }
}
```

## Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}

public record ErrorResponse(String code, String message) {}
```

## Configuration

### application.yml

```yaml
spring:
  application:
    name: my-app
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
  jpa:
    hibernate:
      ddl-auto: validate  # NEVER 'update' or 'create' in production
    open-in-view: false    # Disable OSIV — avoid lazy loading in views
    properties:
      hibernate:
        default_batch_fetch_size: 16

server:
  port: 8080
  error:
    include-stacktrace: never  # Never expose stack traces
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Field injection | Hard to test, hidden dependencies | Constructor injection |
| Exposing entities in API | Couples DB schema to API | Use DTOs |
| `ddl-auto=update` in prod | Schema drift, data loss risk | Use Flyway/Liquibase |
| `open-in-view=true` | Lazy loading in controller, performance | Set to false |
| Business logic in controllers | Fat controllers, hard to test | Move to service layer |
| Catching generic `Exception` | Hides bugs | Catch specific exceptions |
| Mutable DTOs with setters | Thread safety issues | Use records or immutable |

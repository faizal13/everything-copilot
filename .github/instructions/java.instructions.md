---
applyTo: "**/*.java,**/pom.xml,**/build.gradle,**/build.gradle.kts,**/*.properties,**/*.yml"
---

# Java / Spring Boot Instructions

## Language Style

- Use Java 17+ features: records, sealed classes, pattern matching, text blocks
- Prefer `var` for local variables when type is obvious from context
- Use `Optional` for return types that may be absent — never for fields or parameters
- Prefer immutable objects — use `final` fields, records for DTOs
- Use `Stream` API for collection transformations — but keep it readable
- Enum over constants for fixed sets of values

## Naming Conventions

- Classes: `PascalCase` (e.g., `UserService`, `OrderRepository`)
- Methods/variables: `camelCase` (e.g., `findByEmail`, `isActive`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- Packages: `lowercase.dotted` (e.g., `com.example.user.service`)
- DTOs: suffix with `Request`, `Response`, `Dto` (e.g., `CreateUserRequest`)

## Spring Boot Patterns

- Use constructor injection — never field injection (`@Autowired` on fields)
- Layer: Controller → Service → Repository
- Use `@RestController` for REST APIs, `@Controller` for MVC
- Use `@Transactional` on service methods, not repository methods
- Use Spring profiles (`@Profile`) for environment-specific beans
- Configure with `application.yml` over `application.properties`
- Use `@ConfigurationProperties` for type-safe config binding

## API Design

- Follow REST conventions: proper HTTP methods, status codes, resource URIs
- Use `ResponseEntity<>` for explicit status code control
- Validate with Jakarta Bean Validation: `@Valid`, `@NotNull`, `@Size`, `@Email`
- Return DTOs from controllers — never expose entities directly
- Use `@ControllerAdvice` + `@ExceptionHandler` for global error handling
- Pagination: use Spring Data `Pageable` and return `Page<T>`

## JPA / Hibernate

- Use `@Entity` with `@Id` and `@GeneratedValue`
- Prefer `FetchType.LAZY` — never EAGER for collections
- Use `@EntityGraph` or `JOIN FETCH` to solve N+1 queries
- Define repositories extending `JpaRepository<Entity, IdType>`
- Use `@Query` for complex queries, Spring Data method names for simple ones
- Always set `@Column(nullable = false)` for required fields
- Use database migrations: Flyway or Liquibase — never `ddl-auto=update` in production

## Testing

- Unit tests: JUnit 5 + Mockito, `@ExtendWith(MockitoExtension.class)`
- Integration tests: `@SpringBootTest` with `@Testcontainers` for DB
- Web layer: `@WebMvcTest` + `MockMvc` for controller tests
- Repository: `@DataJpaTest` with embedded H2 or Testcontainers
- Use `@MockBean` sparingly — prefer constructor injection with mocks
- Test naming: `shouldReturnUser_whenEmailExists()`

## Security

- Use Spring Security for auth: `SecurityFilterChain` bean configuration
- Hash passwords with BCrypt (`BCryptPasswordEncoder`)
- Use `@PreAuthorize` for method-level security
- Validate all inputs at controller level with `@Valid`
- Never expose stack traces to clients
- Use CSRF protection for browser-facing APIs
- Configure CORS explicitly

# Spring Boot Testing Patterns

## Test Annotations Decision Tree

```
What are you testing?
├── Unit test (no Spring context)      → @ExtendWith(MockitoExtension.class)
├── Controller (web layer only)        → @WebMvcTest(MyController.class)
├── Repository (JPA layer only)        → @DataJpaTest
├── Full integration test              → @SpringBootTest
└── Full with real database            → @SpringBootTest + @Testcontainers
```

## Unit Tests with Mockito

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldCreateUser_whenEmailNotTaken() {
        // Arrange
        var request = new CreateUserRequest("John", "john@example.com", "password123");
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        // Act
        UserResponse response = userService.create(request);

        // Assert
        assertThat(response.name()).isEqualTo("John");
        assertThat(response.email()).isEqualTo("john@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrow_whenEmailAlreadyTaken() {
        var request = new CreateUserRequest("John", "john@example.com", "password123");
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.create(request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("already registered");

        verify(userRepository, never()).save(any());
    }
}
```

## Controller Tests with MockMvc

```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturn200_whenGetUsers() throws Exception {
        when(userService.findAll(any(Pageable.class)))
            .thenReturn(Page.empty());

        mockMvc.perform(get("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void shouldReturn201_whenCreateUser() throws Exception {
        var request = new CreateUserRequest("John", "john@example.com", "password123");
        var response = new UserResponse(1L, "John", "john@example.com", LocalDateTime.now());
        when(userService.create(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("John"))
            .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    void shouldReturn400_whenInvalidEmail() throws Exception {
        var request = new CreateUserRequest("John", "not-an-email", "password123");

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }
}
```

## Repository Tests with @DataJpaTest

```java
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void shouldFindByEmail() {
        // Arrange
        User user = new User();
        user.setName("John");
        user.setEmail("john@example.com");
        user.setPasswordHash("hashed");
        entityManager.persistAndFlush(user);

        // Act
        Optional<User> found = userRepository.findByEmail("john@example.com");

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("John");
    }
}
```

## Integration Tests with Testcontainers

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class UserIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldCreateAndRetrieveUser() {
        // Create
        var request = new CreateUserRequest("John", "john@example.com", "password123");
        var createResponse = restTemplate.postForEntity("/api/v1/users", request, UserResponse.class);
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // Retrieve
        Long userId = createResponse.getBody().id();
        var getResponse = restTemplate.getForEntity("/api/v1/users/" + userId, UserResponse.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().email()).isEqualTo("john@example.com");
    }
}
```

## Test Configuration

```yaml
# src/test/resources/application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
    database-platform: org.hibernate.dialect.H2Dialect
```

## Test Dependencies (Maven)

```xml
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
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
```

## Testing Checklist

- [ ] Unit tests for all service methods
- [ ] Controller tests for all endpoints (happy + error paths)
- [ ] Repository tests for custom queries
- [ ] Integration tests for critical flows
- [ ] Validation tests for DTOs
- [ ] Security tests (unauthorized access returns 401/403)
- [ ] Test naming follows `should_X_when_Y` pattern

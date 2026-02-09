# JPA & Hibernate Patterns

## Entity Design

```java
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters, setters, equals/hashCode (by id)
}
```

### Entity Rules

- Always use `@Id` with `@GeneratedValue`
- Set `@Column(nullable = false)` for required fields
- Use `FetchType.LAZY` for all relationships (it's the default for `@OneToMany`)
- Override `equals()` and `hashCode()` using the ID field only
- Use `@PrePersist` / `@PreUpdate` for audit timestamps
- Prefer `List<>` over `Set<>` for collections (unless uniqueness required)

## Repository Pattern

```java
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data derives query from method name
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Custom JPQL query
    @Query("SELECT u FROM User u WHERE u.createdAt > :since")
    List<User> findRecentUsers(@Param("since") LocalDateTime since);

    // Native query for complex cases
    @Query(value = "SELECT * FROM users WHERE email LIKE %:domain", nativeQuery = true)
    List<User> findByEmailDomain(@Param("domain") String domain);

    // Pagination
    Page<User> findByNameContaining(String name, Pageable pageable);
}
```

## Solving N+1 Queries

### The Problem

```java
// ❌ N+1: This fires 1 query for users + N queries for orders
List<User> users = userRepository.findAll();
users.forEach(u -> u.getOrders().size());  // Each .getOrders() fires a query
```

### Solution 1: @EntityGraph

```java
@EntityGraph(attributePaths = {"orders"})
@Query("SELECT u FROM User u")
List<User> findAllWithOrders();
```

### Solution 2: JOIN FETCH

```java
@Query("SELECT u FROM User u JOIN FETCH u.orders WHERE u.id = :id")
Optional<User> findByIdWithOrders(@Param("id") Long id);
```

### Solution 3: Batch Fetch Size

```yaml
# application.yml — fetches related entities in batches
spring.jpa.properties.hibernate.default_batch_fetch_size: 16
```

## Transaction Management

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    @Transactional  // Wraps entire method in a transaction
    public Order createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setUserId(request.userId());
        order.setTotal(request.total());
        order.setStatus(OrderStatus.PENDING);

        order = orderRepository.save(order);

        // If payment fails, the entire transaction rolls back
        paymentService.charge(order);
        order.setStatus(OrderStatus.CONFIRMED);

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)  // Optimizes for read-only queries
    public Page<Order> findByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable);
    }
}
```

### Transaction Rules

- `@Transactional` on service methods, NOT repositories
- Use `readOnly = true` for read-only operations (performance optimization)
- Let unchecked exceptions trigger rollback (default behavior)
- For checked exceptions: `@Transactional(rollbackFor = BusinessException.class)`
- Avoid long-running transactions — keep them short

## Database Migrations with Flyway

```
src/main/resources/db/migration/
├── V1__create_users_table.sql
├── V2__create_orders_table.sql
├── V3__add_email_index.sql
└── V4__add_user_avatar.sql
```

```sql
-- V1__create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

## Projections (Avoid SELECT *)

```java
// Interface projection — only loads selected columns
public interface UserSummary {
    Long getId();
    String getName();
    String getEmail();
}

public interface UserRepository extends JpaRepository<User, Long> {
    List<UserSummary> findAllProjectedBy();
}
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| `FetchType.EAGER` on collections | Loads everything always | Use LAZY + EntityGraph |
| No batch fetch size | N+1 on every lazy load | Set `default_batch_fetch_size` |
| `ddl-auto=update` | Uncontrolled schema changes | Use Flyway/Liquibase |
| Business logic in entity | Fat entity, hard to test | Move to service |
| `open-in-view=true` | Lazy loading in view layer | Set to false |
| Missing indexes | Slow queries | Add indexes for WHERE/JOIN columns |

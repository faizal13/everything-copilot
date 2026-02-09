# Java Coding Standards

## Language Version

- Target Java 17+ (LTS)
- Use records, sealed classes, pattern matching, text blocks
- Enable preview features only in development

## Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Class | PascalCase | `UserService`, `OrderRepository` |
| Method | camelCase | `findByEmail`, `calculateTotal` |
| Variable | camelCase | `userName`, `orderCount` |
| Constant | UPPER_SNAKE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Package | lowercase | `com.example.service` |
| Interface | PascalCase (no prefix) | `PaymentProcessor` (not `IPaymentProcessor`) |
| Enum | PascalCase, values UPPER_SNAKE | `OrderStatus.PENDING` |

## Modern Java Features

```java
// Records for immutable data
public record Point(int x, int y) {}

// Sealed classes for restricted hierarchies
public sealed interface Shape permits Circle, Rectangle {}
public record Circle(double radius) implements Shape {}
public record Rectangle(double width, double height) implements Shape {}

// Pattern matching
if (shape instanceof Circle c) {
    return Math.PI * c.radius() * c.radius();
}

// Switch expressions
String label = switch (status) {
    case PENDING -> "Pending";
    case ACTIVE -> "Active";
    case CLOSED -> "Closed";
};

// Text blocks
String json = """
    {
        "name": "%s",
        "email": "%s"
    }
    """.formatted(name, email);
```

## Error Handling

```java
// ✅ Specific exceptions with context
throw new ResourceNotFoundException("User not found: id=" + userId);

// ✅ Try-with-resources for AutoCloseable
try (var stream = Files.lines(path)) {
    return stream.filter(line -> !line.isBlank()).toList();
}

// ❌ Never catch generic Exception (unless top-level handler)
// ❌ Never swallow exceptions silently
// ❌ Never use exceptions for flow control
```

## Collections

```java
// Prefer immutable collections
List<String> names = List.of("Alice", "Bob");
Map<String, Integer> scores = Map.of("Alice", 95, "Bob", 87);

// Use streams for transformations
List<String> emails = users.stream()
    .filter(User::isActive)
    .map(User::getEmail)
    .toList();  // Java 16+

// Use Optional for nullable returns
public Optional<User> findByEmail(String email) { ... }

// ❌ Never: Optional as field, parameter, or in collections
```

## Formatting

- Use 4 spaces for indentation
- Braces on same line: `if (condition) {`
- Max line length: 120 characters
- Blank line between methods
- Group imports: java.*, javax.*, org.*, com.*, static imports last

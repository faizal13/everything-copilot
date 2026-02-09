# TypeScript Coding Standards

## Strict Mode Configuration

### Required tsconfig.json Settings
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

## Type Safety Rules

### Never Use `any`
```typescript
// BAD: defeats the purpose of TypeScript
function parse(data: any): any { ... }

// GOOD: use unknown and narrow
function parse(data: unknown): ParsedResult {
  if (typeof data !== 'object' || data === null) {
    throw new TypeError('Expected object');
  }
  // narrow further...
}

// ACCEPTABLE: explicit escape hatch with justification
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- third-party API returns untyped
const legacyResult = externalLib.call() as any;
```

### Prefer Interfaces for Object Shapes
```typescript
// GOOD: interfaces are extensible and produce clearer error messages
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// USE type for unions, intersections, mapped types, primitives
type UserRole = 'admin' | 'editor' | 'viewer';
type Nullable<T> = T | null;
type UserWithPosts = User & { posts: Post[] };
```

## Generics

### Constrained Generics
```typescript
// Constrain generic types to what you actually need
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Generic with default type
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message: string;
}

// Generic repository pattern
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### Avoid Over-Generalization
```typescript
// BAD: generic adds no value here
function greet<T extends string>(name: T): string {
  return `Hello, ${name}`;
}

// GOOD: use concrete types when generics add no benefit
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

## Type Guards

### User-Defined Type Guards
```typescript
interface Dog { kind: 'dog'; bark(): void; }
interface Cat { kind: 'cat'; purr(): void; }
type Pet = Dog | Cat;

// Discriminated union (preferred)
function handlePet(pet: Pet) {
  switch (pet.kind) {
    case 'dog': pet.bark(); break;
    case 'cat': pet.purr(); break;
    default: {
      const _exhaustive: never = pet;
      throw new Error(`Unhandled pet: ${_exhaustive}`);
    }
  }
}

// Custom type guard function
function isNonNull<T>(value: T | null | undefined): value is T {
  return value != null;
}

const results: (User | null)[] = await Promise.all(fetches);
const users: User[] = results.filter(isNonNull);
```

### Assertion Functions
```typescript
function assertDefined<T>(
  value: T | null | undefined,
  name: string,
): asserts value is T {
  if (value == null) {
    throw new Error(`Expected ${name} to be defined`);
  }
}

// Usage narrows the type after the call
const config = getConfig();
assertDefined(config, 'config');
// config is now typed as non-null below this line
```

## Utility Types

### Essential Built-in Types
```typescript
// Partial - all properties optional (useful for updates)
function updateUser(id: string, changes: Partial<User>): Promise<User> { ... }

// Pick / Omit - select subset of properties
type UserSummary = Pick<User, 'id' | 'name'>;
type CreateUserInput = Omit<User, 'id' | 'createdAt'>;

// Record - typed key-value maps
type RolePermissions = Record<UserRole, Permission[]>;

// Required - make all properties required
type CompleteConfig = Required<Partial<Config>>;

// Readonly - immutable types
type FrozenUser = Readonly<User>;
```

### Custom Utility Types
```typescript
// Make specific keys required
type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
type UserWithEmail = RequireKeys<Partial<User>, 'email'>;

// Deep readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// Extract string literal types
type EventName = `on${Capitalize<string>}`;
```

## Enums: Prefer Const Objects
```typescript
// AVOID: TypeScript enums have runtime footprint and quirks
enum Direction { Up, Down, Left, Right }

// PREFER: const object with as const
const Direction = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
} as const;

type Direction = (typeof Direction)[keyof typeof Direction];
// type Direction = 'up' | 'down' | 'left' | 'right'
```

## Zod for Runtime Validation
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
});

// Derive TypeScript type from Zod schema
type User = z.infer<typeof UserSchema>;

// Validate at runtime (API boundaries)
function createUser(input: unknown): User {
  return UserSchema.parse(input);
}
```

## Checklist
- [ ] `strict: true` in tsconfig.json
- [ ] No `any` types without explicit eslint-disable comment and justification
- [ ] All function return types are explicit (not inferred) for public APIs
- [ ] Discriminated unions used for variant types
- [ ] Exhaustiveness checking with `never` in switch/if chains
- [ ] Zod or similar for runtime validation at API boundaries
- [ ] No type assertions (`as`) without a safety comment
- [ ] Utility types preferred over manual type manipulation
- [ ] No `@ts-ignore`; use `@ts-expect-error` with explanation if necessary
- [ ] Generics are constrained and add real value

# Caching Strategies

## Cache Hierarchy

### L1: In-Memory (Application-Level)
- Fastest access (nanoseconds)
- Per-process, not shared across instances
- Use for: hot configuration, compiled templates, small lookup tables
- Libraries: `node-cache`, `cachetools` (Python), `sync.Map` (Go)

### L2: Distributed Cache (Redis/Memcached)
- Fast access (sub-millisecond over network)
- Shared across all application instances
- Use for: session data, API responses, rate limiting, feature flags
- Redis preferred for: data structures, pub/sub, persistence

### L3: CDN Edge Cache
- Geographically distributed
- Use for: static assets, public API responses, pre-rendered pages
- Configure with `Cache-Control` headers

## Cache Patterns

### Cache-Aside (Lazy Loading)
```python
async def get_user(user_id: str) -> User:
    # 1. Check cache
    cached = await redis.get(f"user:{user_id}")
    if cached:
        return User.model_validate_json(cached)

    # 2. Cache miss: load from database
    user = await db.users.find_one(user_id)
    if user is None:
        raise NotFoundError("user", user_id)

    # 3. Populate cache with TTL
    await redis.set(f"user:{user_id}", user.model_dump_json(), ex=300)
    return user
```

### Write-Through
```python
async def update_user(user_id: str, changes: UserUpdate) -> User:
    # 1. Write to database
    user = await db.users.update(user_id, changes)

    # 2. Write to cache (synchronous with the write)
    await redis.set(f"user:{user_id}", user.model_dump_json(), ex=300)
    return user
```

### Write-Behind (Write-Back)
```python
async def record_page_view(page_id: str):
    # 1. Write to cache immediately (fast response)
    await redis.incr(f"views:{page_id}")

    # 2. Periodically flush to database (background job)
    # This runs every 60 seconds in a worker process
    async def flush_views():
        keys = await redis.keys("views:*")
        for key in keys:
            page_id = key.split(":")[1]
            count = await redis.getdel(key)
            if count:
                await db.execute(
                    "UPDATE pages SET view_count = view_count + $1 WHERE id = $2",
                    int(count), page_id
                )
```

## Cache Invalidation

### Time-Based (TTL)
```python
# Short TTL for frequently changing data
await redis.set("trending:posts", data, ex=60)       # 60 seconds

# Medium TTL for user profiles, settings
await redis.set(f"user:{user_id}", data, ex=300)     # 5 minutes

# Long TTL for rarely changing reference data
await redis.set("countries:list", data, ex=86400)     # 24 hours
```

### Event-Based Invalidation
```python
# When data changes, actively invalidate
async def update_user(user_id: str, changes: UserUpdate) -> User:
    user = await db.users.update(user_id, changes)

    # Invalidate all caches that include this user's data
    await redis.delete(f"user:{user_id}")
    await redis.delete(f"user:{user_id}:orders")
    await redis.delete(f"team:{user.team_id}:members")

    # Publish invalidation event for other services
    await redis.publish("cache:invalidate", json.dumps({
        "entity": "user",
        "id": user_id,
        "action": "update",
    }))

    return user
```

### Tag-Based Invalidation
```python
# Tag cache entries for group invalidation
async def cache_with_tags(key: str, value: str, tags: list[str], ttl: int):
    pipe = redis.pipeline()
    pipe.set(key, value, ex=ttl)
    for tag in tags:
        pipe.sadd(f"tag:{tag}", key)
        pipe.expire(f"tag:{tag}", ttl)
    await pipe.execute()

async def invalidate_tag(tag: str):
    keys = await redis.smembers(f"tag:{tag}")
    if keys:
        pipe = redis.pipeline()
        for key in keys:
            pipe.delete(key)
        pipe.delete(f"tag:{tag}")
        await pipe.execute()

# Usage
await cache_with_tags(f"user:{user_id}", data, ["user", f"team:{team_id}"], 300)
await invalidate_tag(f"team:{team_id}")  # clears all team-member caches
```

## Cache Stampede Prevention

### Locking (Mutex)
```python
async def get_with_lock(key: str, loader, ttl: int = 300):
    cached = await redis.get(key)
    if cached:
        return json.loads(cached)

    lock_key = f"lock:{key}"
    acquired = await redis.set(lock_key, "1", nx=True, ex=10)

    if acquired:
        try:
            data = await loader()
            await redis.set(key, json.dumps(data), ex=ttl)
            return data
        finally:
            await redis.delete(lock_key)
    else:
        # Wait and retry (another process is loading)
        await asyncio.sleep(0.1)
        return await get_with_lock(key, loader, ttl)
```

### Stale-While-Revalidate
```python
async def get_with_swr(key: str, loader, ttl: int = 300, stale_ttl: int = 600):
    raw = await redis.get(key)
    if raw:
        entry = json.loads(raw)
        if entry["expires_at"] > time.time():
            return entry["data"]  # fresh
        # Stale but usable; refresh in background
        asyncio.create_task(refresh_cache(key, loader, ttl, stale_ttl))
        return entry["data"]

    return await refresh_cache(key, loader, ttl, stale_ttl)

async def refresh_cache(key, loader, ttl, stale_ttl):
    data = await loader()
    entry = {"data": data, "expires_at": time.time() + ttl}
    await redis.set(key, json.dumps(entry), ex=stale_ttl)
    return data
```

## HTTP Cache Headers
```
# Immutable assets (hashed filenames)
Cache-Control: public, max-age=31536000, immutable

# API responses that can be cached briefly
Cache-Control: public, max-age=60, stale-while-revalidate=300

# Private user data (only browser can cache)
Cache-Control: private, max-age=0, must-revalidate
ETag: "abc123"

# Never cache
Cache-Control: no-store
```

## Redis Best Practices
- Use key prefixes and colons as separators: `user:123:profile`
- Set TTL on every key to prevent unbounded memory growth
- Use Redis pipelines for batch operations
- Monitor memory usage with `INFO memory` and set `maxmemory-policy`
- Use `allkeys-lru` eviction policy for cache workloads
- Avoid large values (>1MB); split into smaller keys

## Checklist
- [ ] Every cache key has a TTL set
- [ ] Cache invalidation strategy is documented for each cached entity
- [ ] Cache stampede protection is in place for high-traffic keys
- [ ] Cache hit/miss rates are monitored
- [ ] Redis memory limits and eviction policy are configured
- [ ] Cached data is serializable and versioned (handle schema changes)
- [ ] Fallback behavior is defined when cache is unavailable
- [ ] No sensitive data cached without encryption consideration

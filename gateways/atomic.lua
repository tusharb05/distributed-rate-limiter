-- atomic.lua
-- KEYS[1] = bucket key
-- ARGV[1] = capacity
-- ARGV[2] = refill rate (tokens/sec)
-- ARGV[3] = now (ms)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- fetch bucket
local bucket_json = redis.call("JSON.GET", key)
local tokens, last_refill

if bucket_json then
    local bucket = cjson.decode(bucket_json)
    tokens = bucket.tokens
    last_refill = bucket.lastRefill
else
    tokens = capacity
    last_refill = now
end

-- refill tokens
local elapsed = (now - last_refill) / 1000.0
tokens = math.min(capacity, tokens + (elapsed * refill_rate))

-- consume token
local allowed = 0
if tokens >= 1 then
    tokens = tokens - 1
    allowed = 1
end

-- save bucket
local new_bucket = cjson.encode({
    tokens = tokens,
    lastRefill = now
})
redis.call("JSON.SET", key, "$", new_bucket)

-- bucket lifetime ~= 2x full refill time
local ttl = math.ceil((capacity / refill_rate) * 2)
redis.call("EXPIRE", key, ttl)

return allowed

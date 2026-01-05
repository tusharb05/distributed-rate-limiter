import { readFileSync } from "fs";
import { createClient } from "redis";

const redis = await createClient({
	url: process.env.REDIS_URL,
})
	.on("error", (err) => {
		console.error("Redis client error:", err);
	})
	.connect();

// Load Lua script
const luaScript = readFileSync("./atomic.lua", "utf8");

// Register script
const sha = await redis.scriptLoad(luaScript);

async function checkRateLimit(key, capacity, refillRate) {
	try {
		const now = Date.now();

		const allowed = await redis.evalSha(sha, {
			keys: [key],
			arguments: [String(capacity), String(refillRate), String(now)],
		});

		return allowed === 1;
	} catch (err) {
		// fail-open
		console.error("Rate limiter failed, allowing request:", {
			key,
			error: err?.message,
		});

		return true;
	}
}

export async function rateLimiter(req, res, next) {
	const userId = req.body?.user_id;

	let key, capacity, refillRate;

	if (userId) {
		key = `user:id:${userId}`;
		capacity = Number(process.env.USER_CAPACITY);
		refillRate = Number(process.env.USER_REFILL_RATE);
	} else {
		const ip = req.ip;
		key = `user:ip:${ip}`;
		capacity = Number(process.env.IP_CAPACITY);
		refillRate = Number(process.env.IP_REFILL_RATE);
	}

	const allowed = await checkRateLimit(key, capacity, refillRate);

	if (!allowed) {
		return res.status(429).send("Too Many Requests");
	}

	next();
}

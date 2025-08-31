import { readFileSync } from "fs";
import { createClient } from "redis";

const redis = await createClient({
	url: process.env.REDIS_URL,
})
	.on("error", (err) => console.log("redis client error occured"))
	.connect();

// Load Lua script
const luaScript = readFileSync("./atomic.lua", "utf8");

// Register it in Redis
const sha = await redis.scriptLoad(luaScript);

async function checkRateLimit(key, capacity, refillRate) {
	const now = Date.now();

	const allowed = await redis.evalSha(sha, {
		keys: [key],
		arguments: [String(capacity), String(refillRate), String(now)],
	});

	if (allowed === 1) {
		console.log("NOT RATE LIMITED");
		return true;
	}
	console.log("RATE LIMITED");
	return false;
}

export async function rateLimiter(req, res, next) {
	const userId = req.body?.user_id;

	let key, capacity, refillRate;

	if (userId) {
		key = `user:id:${userId}`;
		capacity = Number(process.env.USER_CAPACITY);
		refillRate = Number(process.env.USER_REFILL_RATE);
		console.log("user");
	} else {
		console.log("ip throttle");
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

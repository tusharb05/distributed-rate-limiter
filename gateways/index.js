import express from "express";
import dotenv from "dotenv";
import { rateLimiter } from "./rateLimiter.js";

dotenv.config();

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(rateLimiter);

app.get("/health", (req, res) => {
	res.json({
		message: "healthy",
	});
});

app.get("/test", (req, res) => {
	res.json({
		message: "your request was not rate-limited",
	});
});

app.listen(process.env.PORT, () =>
	console.log(`server running on port ${process.env.PORT}`)
);

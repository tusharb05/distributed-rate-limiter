from locust import HttpUser, task, between
import random

class MultiIPUser(HttpUser):
    host = "http://localhost:8080"
    wait_time = between(0, 0)

    def random_ip(self):
        return ".".join(str(random.randint(1, 254)) for _ in range(4))

    @task
    def multi_ip_requests(self):
        self.client.get(
            "/test",
            headers={"X-Forwarded-For": self.random_ip()},
            name="multi_ip"
        )

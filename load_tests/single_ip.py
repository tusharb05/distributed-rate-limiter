from locust import HttpUser, task, between

class SingleIPUser(HttpUser):
    host = "http://localhost:8080"
    wait_time = between(0.01, 0.02)

    fixed_ip = "10.10.10.10"

    @task
    def single_ip_steady(self):
        self.client.get(
            "/test",
            headers={"X-Forwarded-For": self.fixed_ip},
            name="single_ip"
        )

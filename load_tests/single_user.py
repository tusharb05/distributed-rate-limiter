from locust import HttpUser, task, between

class SingleUser(HttpUser):
    host = "http://localhost:8080"
    wait_time = between(0.01, 0.02)

    user_id = "user-123"

    @task
    def single_user_steady(self):
        self.client.get(
            "/test",
            json={"user_id": self.user_id},
            headers={"Content-Type": "application/json"},
            name="single_user"
        )

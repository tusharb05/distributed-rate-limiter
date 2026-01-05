from locust import HttpUser, task, between
import uuid

class MultiUser(HttpUser):
    host = "http://localhost:8080"
    wait_time = between(0, 0)

    @task
    def multi_user_requests(self):
        user_id = f"user-{uuid.uuid4()}"
        self.client.get(
            "/test",
            json={"user_id": user_id},
            headers={"Content-Type": "application/json"},
            name="multi_user"
        )

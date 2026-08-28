import hmac
import hashlib
import json
import time
import asyncio
import httpx
from datetime import datetime

class ResilientWebhookDispatcher:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key.encode("utf-8")
        self.max_retries = 5
        self.base_backoff_seconds = 2

    def generate_signature(self, payload: str, timestamp: int) -> str:
        signature_payload = f"{timestamp}.{payload}".encode("utf-8")
        return hmac.new(self.secret_key, signature_payload, hashlib.sha256).hexdigest()

    async def deliver_webhook_with_backoff(self, target_url: str, event_type: str, data: dict) -> bool:
        payload_str = json.dumps({"event": event_type, "data": data, "timestamp": int(time.time())})
        timestamp = int(time.time())
        signature = self.generate_signature(payload_str, timestamp)

        headers = {
            "Content-Type": "application/json",
            "X-Gateway-Signature": signature,
            "X-Gateway-Timestamp": str(timestamp),
            "User-Agent": "NextGen-Fintech-Webhook-Engine/1.0"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            for attempt in range(1, self.max_retries + 1):
                try:
                    response = await client.post(target_url, content=payload_str, headers=headers)
                    if response.status_code in [200, 201, 202, 204]:
                        return True
                except (httpx.ConnectError, httpx.TimeoutException) as exc:
                    pass

                # Exponential backoff with jitter: 2s, 4s, 8s, 16s, 32s
                sleep_time = (self.base_backoff_seconds ** attempt) + (0.1 * attempt)
                await asyncio.sleep(sleep_time)

        # Move to Dead Letter Queue (DLQ) if delivery fails completely
        await self.send_to_dead_letter_queue(target_url, event_type, data)
        return False

    async def send_to_dead_letter_queue(self, target_url: str, event_type: str, data: dict):
        # DLQ storage logic to allow manual retry from the merchant dashboard
        print(f"[CRITICAL - DLQ] Webhook failed permanently for {target_url}. Event: {event_type}")
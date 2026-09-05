import asyncio
import httpx

# Local FastAPI backend URL
URL = "http://localhost:8000/api/simulate-transaction"  # Update endpoint if needed

async def send_simulated_transaction(client, index):
    payload = {
        "transaction_id": f"TXN_LOAD_TEST_{index}",
        "amount": 1500.00,
        "currency": "INR",
        "status": "success" if index % 5 != 0 else "failed" # Simulate occasional drops
    }
    try:
        response = await client.post(URL, json=payload)
        print(f"Transaction {index}: Status {response.status_code}")
    except Exception as e:
        print(f"Transaction {index} failed: {e}")

async def main():
    print("🚀 Starting Webhook & Transaction Load Test...")
    async with httpx.AsyncClient() as client:
        # Simulate 50 concurrent transactions to test backend elasticity
        tasks = [send_simulated_transaction(client, i) for i in range(1, 51)]
        await asyncio.gather(*tasks)
    print("✅ Load test complete! Check your frontend dashboard for real-time updates.")

if __name__ == "__main__":
    asyncio.run(main())import asyncio
import httpx

# Local FastAPI backend URL
URL = "http://localhost:8000/api/simulate-transaction"  # Update endpoint if needed

async def send_simulated_transaction(client, index):
    payload = {
        "transaction_id": f"TXN_LOAD_TEST_{index}",
        "amount": 1500.00,
        "currency": "INR",
        "status": "success" if index % 5 != 0 else "failed" # Simulate occasional drops
    }
    try:
        response = await client.post(URL, json=payload)
        print(f"Transaction {index}: Status {response.status_code}")
    except Exception as e:
        print(f"Transaction {index} failed: {e}")

async def main():
    print("🚀 Starting Webhook & Transaction Load Test...")
    async with httpx.AsyncClient() as client:
        # Simulate 50 concurrent transactions to test backend elasticity
        tasks = [send_simulated_transaction(client, i) for i in range(1, 51)]
        await asyncio.gather(*tasks)
    print("✅ Load test complete! Check your frontend dashboard for real-time updates.")

if __name__ == "__main__":
    asyncio.run(main())
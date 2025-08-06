import requests

data = { "text": "John Doe submitted an invoice for Acme Corp dated July 2023." }
response = requests.post("http://127.0.0.1:8000/auto-tag", json=data)

print("Status code:", response.status_code)
print("Raw response text:", response.text)

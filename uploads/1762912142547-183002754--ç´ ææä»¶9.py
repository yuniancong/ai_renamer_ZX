from litellm import completion

# 替换为你的Ollama服务器地址
api_base = "http://localhost:11434"

response = completion(
    model="ollama/llama2", 
    messages=[{"content": "respond in 20 words. who are you?", "role": "user"}], 
    api_base=api_base
)
print(response)

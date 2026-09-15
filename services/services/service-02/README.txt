ATELIER NORTH — SERVICE 03 / NORTH AI V2

This version uses a real OpenAI Responses API connection instead of hard-coded answers.

SETUP
1. Install Node.js.
2. Open this folder in VS Code.
3. Open the terminal in this folder.
4. Run: npm install
5. Copy .env.example to .env
6. Put your API key in .env:
   OPENAI_API_KEY=your_key
7. Run: npm start
8. Open: http://localhost:3000

SECURITY
Keep the API key in .env on the server. Do NOT put it into public/index.html.
Do not upload .env to GitHub or deploy it as a client-side key.

The frontend sends the recent conversation to /api/chat.
The server calls the OpenAI Responses API and returns the generated answer.

The default model is gpt-5.6-luna; you can change OPENAI_MODEL in .env.

# 🤖 RAG Chatbot with LangChain & Ollama

A powerful **Retrieval-Augmented Generation (RAG)** chatbot built with LangChain, Ollama, and Express.js. Upload PDFs and ask questions about them, or use it as a general-purpose AI assistant!

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white)

## ✨ Features

- 📄 **PDF Upload & Processing** - Upload any PDF and ask questions about its content
- 🧠 **Hybrid Intelligence** - Answers from PDF context when relevant, general knowledge otherwise
- ⚡ **Real-time Streaming** - Get responses as they're generated
- 🎨 **Modern UI** - Clean, dark-themed chat interface
- 🔄 **Dynamic PDF Switching** - Upload multiple PDFs and switch between them
- 📊 **Vector Search** - Uses HNSWLib for fast similarity search
- 🌐 **Local LLM** - Powered by Ollama (runs completely offline)

## 🏗️ Architecture

```
User Question
    ↓
PDF Uploaded? 
    ↓                    ↓
   YES                  NO
    ↓                    ↓
Vector Search      General Knowledge
    ↓                    ↓
Retrieve Context        |
    ↓                    ↓
    LLM (Mistral via Ollama)
            ↓
    Streaming Response
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Ollama** installed and running locally
- **Git**

### Install Ollama

```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS
brew install ollama

# Windows
# Download from https://ollama.com/download
```

### Pull Required Models

```bash
# Pull the Mistral model for chat
ollama pull mistral

# Pull the embedding model
ollama pull nomic-embed-text

# Start Ollama server (if not already running)
ollama serve
```

### Installation

1. **Clone the repository**

```bash
git clone git@github.com:rohnraj/Creating_chatbot_usig_Langchain.git
cd Creating_chatbot_usig_Langchain
```

2. **Install dependencies**

```bash
npm install
```

3. **Create `.env` file**

```bash
touch .env
```

Add your environment variables (optional for OpenAI, if you want to use it):

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Start the server**

```bash
npm start
```

5. **Open your browser**

Navigate to: `http://localhost:5000`

## 📖 Usage

### Upload a PDF

1. Click the **📎 paperclip icon** at the bottom left
2. Select a PDF file (max 10MB)
3. Wait for the upload and processing (you'll see a loading animation)
4. Start asking questions!

### Ask Questions

**With PDF loaded:**
```
You: "What is this document about?"
AI: [Answers based on PDF content]

You: "What is the capital of France?"
AI: "Paris" [Uses general knowledge]
```

**Without PDF:**
```
You: "Explain quantum computing"
AI: [Answers from general knowledge]
```

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **LangChain** - LLM orchestration framework
- **Ollama** - Local LLM runtime
- **HNSWLib** - Vector database for similarity search
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction

### Frontend
- **Vanilla JavaScript** - No framework needed
- **Fetch API** - Streaming responses
- **Modern CSS** - Dark theme UI

### AI/ML
- **Mistral** - Language model (via Ollama)
- **nomic-embed-text** - Embedding model
- **RAG Pattern** - Retrieval-Augmented Generation

## 📁 Project Structure

```
├── server.js              # Main Express server
├── public/
│   └── index.html        # Frontend UI
├── uploads/              # Uploaded PDFs (gitignored)
├── package.json          # Dependencies
├── .env                  # Environment variables (gitignored)
└── README.md            # This file
```

## 🔧 Configuration

### Change LLM Model

Edit `server.js`:

```javascript
const model = new ChatOllama({
    model: "mistral",  // Change to: llama2, codellama, etc.
    baseUrl: "http://localhost:11434"
});
```

### Adjust Chunk Size

```javascript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,      // Increase for larger context
  chunkOverlap: 64,    // Overlap between chunks
});
```

### Change Port

```javascript
const PORT = 5000;  // Change to your preferred port
```

## 🎯 How RAG Works

1. **Document Loading** - PDF is loaded and text is extracted
2. **Text Splitting** - Document is split into manageable chunks (512 chars)
3. **Embedding Creation** - Each chunk is converted to a vector embedding
4. **Vector Storage** - Embeddings stored in HNSWLib for fast retrieval
5. **Query Processing** - User question is converted to embedding
6. **Similarity Search** - Top 3 most relevant chunks are retrieved
7. **Context Injection** - Relevant chunks are added to the prompt
8. **LLM Generation** - Model generates answer using context + knowledge
9. **Streaming Response** - Answer is streamed back to the user

## 🚨 Troubleshooting

### Ollama not running
```bash
# Check if Ollama is running
curl http://localhost:11434

# Start Ollama
ollama serve
```

### Model not found
```bash
# List installed models
ollama list

# Pull missing model
ollama pull mistral
ollama pull nomic-embed-text
```

### Port already in use
```bash
# Change PORT in server.js or kill the process
lsof -ti:5000 | xargs kill -9
```

### PDF upload fails
- Check file size (max 10MB)
- Ensure `uploads/` directory exists
- Check file permissions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [LangChain](https://www.langchain.com/) - LLM framework
- [Ollama](https://ollama.com/) - Local LLM runtime
- [Mistral AI](https://mistral.ai/) - Language model
- [HNSWLib](https://github.com/nmslib/hnswlib) - Vector search library

## 📧 Contact

**Rohan Raj** - [@rohnraj](https://github.com/rohnraj)

Project Link: [https://github.com/rohnraj/Creating_chatbot_usig_Langchain](https://github.com/rohnraj/Creating_chatbot_usig_Langchain)

---

⭐ Star this repo if you find it helpful!

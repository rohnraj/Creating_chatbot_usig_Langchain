import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
dotenv.config();
const app = express();
const PORT = 5000;

app.use(express.json());

app.use(express.static("public"));

// Configure multer for file uploads
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import * as parse from "pdf-parse";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama";
// import { MemoryVectorStore } from "@langchain/community/vectorstores/memory";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";



// initialize embeddings
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text", // or nomic-embed-text (recommended)
  baseUrl: "http://localhost:11434",
});
// import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
// import ignore from "ignore";

// const loader = new GithubRepoLoader(
//   "https://github.com/rohnraj/doctor-appointment-system#",
//   { recursive: false, ignorePaths: ["*.md", "yarn.lock"] }
// );

// Initialize with no PDF by default
let currentPdfPath = null;
let currentPdfName = null;

// chunks 
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 64,
});

let splitDocs = [];

console.log('No PDF loaded. Waiting for user upload...');

// create vector store once at startup (not on every request)
let vectorStore = null;
let retriever = null;

async function initVectorStore() {
  if (splitDocs.length === 0) {
    console.log("No documents to create vector store from.");
    vectorStore = null;
    retriever = null;
    return;
  }
  
  vectorStore = await HNSWLib.fromDocuments(
    splitDocs,
    embeddings
  );
  retriever = vectorStore.asRetriever({ k: 3 }); // get top 3 relevant chunks
  console.log("Vector store initialized!");
}

// Don't initialize vector store at startup (no PDF loaded yet)
// await initVectorStore();

// embeddings vector store
async function init( userMessage, res ) {
  let context = "";
  let promptTemplate;

  // Check if PDF is loaded and retriever is available
  if (retriever && currentPdfName) {
    // retriever prompt ka embeddings bna deta hai aur uske similar chunks ko laake deta hai
    const retrievedDocs = await retriever.invoke(userMessage);

    console.log("Retriever response:", retrievedDocs);

    // format the retrieved context
    context = retrievedDocs.map(doc => doc.pageContent).join("\n\n");
    
    console.log("Context from PDF:", context.substring(0, 200) + "...");

    // create a smart prompt that decides whether to use PDF context or general knowledge
    promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", `You are a helpful assistant. You have access to context from a PDF document: "${currentPdfName}".
      
If the user's question is related to the PDF content, use the provided context to answer.
If the user's question is unrelated to the PDF (like general knowledge questions), answer from your general knowledge.

PDF Context:
{context}

Response should not be offensive.`],
      ["human", "{question}"],
    ]);
  } else {
    // No PDF loaded - use general knowledge only
    console.log("No PDF loaded. Answering from general knowledge.");
    
    promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", `You are a helpful assistant. No PDF document is currently loaded, so answer questions using your general knowledge.

Response should not be offensive.`],
      ["human", "{question}"],
    ]);
  }

  // create chain with the appropriate prompt
  const ragChain = promptTemplate.pipe(model).pipe(outputParser);

  // get stream with context (if available) and question
  const stream = retriever && currentPdfName 
    ? await ragChain.stream({ context: context, question: userMessage })
    : await ragChain.stream({ question: userMessage });

  // ensure streaming headers are flushed to client immediately
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // iterate the async iterable directly and write normalized text
  for await (const chunk of stream) {
    const text = typeof chunk === 'string'
      ? chunk
      : (chunk?.content ?? JSON.stringify(chunk));
    res.write(text);
  }

  res.end();
}


const outputParser = new StringOutputParser();
// const model = new ChatOpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   model: "gpt-4o-mini",
//   temperature: 0,
//   maxTokens: 100
// });

// our ollama chat model
const model = new ChatOllama({
    model: "mistral",
    baseUrl: "http://localhost:11434"
});

// const prompt = ChatPromptTemplate.fromTemplate("Tell me a joke about {topic}.");

// Template
const prompt = ChatPromptTemplate.fromMessages([
    ["system", "response should not be offensive."],
    ["human", "{topic}."],
]);

// create chain
//   const chain = prompt.pipe(model);
const chain = prompt.pipe(model).pipe(outputParser);

// serve index on GET (fix: was POST)
app.get('/', (req, res) => {
    res.sendFile(path.resolve("public/index.html"));
});

// PDF upload endpoint
app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const uploadedFile = req.file;
        const originalName = req.file.originalname;

        console.log(`Processing uploaded PDF: ${originalName}`);

        // Load and process the new PDF
        const newLoader = new PDFLoader(uploadedFile.path);
        const docs = await newLoader.load();

        // Split into chunks
        splitDocs = await splitter.splitDocuments(docs);

        // Reinitialize vector store with new PDF
        await initVectorStore();

        // Update current PDF info
        currentPdfPath = uploadedFile.path;
        currentPdfName = originalName;

        console.log(`Successfully loaded new PDF: ${originalName} (${splitDocs.length} chunks)`);

        res.json({ 
            success: true, 
            message: 'PDF uploaded and processed successfully',
            filename: originalName,
            chunks: splitDocs.length
        });
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ error: error?.message ?? 'Failed to process PDF' });
    }
});

// chat endpoint
app.post('/chat', async (req, res) => {
    const userMessage = req.body?.message ?? '';
    try {

        // res.setHeader("Content-Type", "text/plain");
        res.setHeader("Transfer-Encoding", "chunked");

        // get async iterable stream from chain
        // const stream = await chain.stream({ topic: userMessage });

        // // ensure streaming headers are flushed to client immediately
        // res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        // res.setHeader('Cache-Control', 'no-cache');
        // res.setHeader('Connection', 'keep-alive');
        // // try { res.flushHeaders?.(); } catch {}

        // // iterate the async iterable directly and write normalized text
        // for await (const chunk of stream) {
        //     const text = typeof chunk === 'string'
        //         ? chunk
        //         : (chunk?.content ?? JSON.stringify(chunk));
        //     res.write(text);
        // }

        // res.end();
        init(userMessage, res);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
    }
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
import { fastifyCors } from "@fastify/cors";
import { fastify } from "fastify";
import { createTranscriptionRoute } from "./routes/create-transcription";
import { generateAICompletionRoute } from "./routes/generate-ai-completion";
import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload.video";

const app = fastify();

app.register(fastifyCors, {
  origin: "*", //URL do Front-End
});

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(createTranscriptionRoute);
app.register(generateAICompletionRoute);

app
  .listen({
    port: 3000,
  })
  .then(() => {
    console.log("Server listening on port 3000");
  });

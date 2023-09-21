import { ThemeToggle } from "./components/theme-toggle";
import { Button } from "./components/ui/button";
import { Separator } from "./components/ui/separator";

import { useCompletion } from "ai/react";
import { Github, Loader2Icon, Wand2 } from "lucide-react";
import { useState } from "react";
import { PromptSelect } from "./components/prompt-select";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Slider } from "./components/ui/slider";
import { Textarea } from "./components/ui/textarea";
import { VideoInputForm } from "./components/video-input-form";

export function App() {
  const [temperature, setTemperature] = useState(0.5);
  const [videoId, setVideoId] = useState<string | null>(null);

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
  } = useCompletion({
    api: "http://localhost:3000/ai/complete",
    body: {
      videoId,
      temperature,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between border-b px-6 py-3">
        <h1 className="text-xl font-bold">upload.ai</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline">
            <Github className="h-4 w-4 mr-2" />
            Github
          </Button>
        </div>
      </div>

      <main className="flex-1 p-6 flex gap-6">
        <div className="flex flex-col flex-1 gap-4">
          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea
              className="resize-none p-4 leading-relaxed"
              placeholder="Include de IA's prompt..."
              value={input}
              onChange={handleInputChange}
            />
            <Textarea
              className="resize-none p-4 leading-relaxed"
              placeholder="Result generated by IA..."
              readOnly
              value={completion}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Remember: you can use the variable{" "}
            <code className="text-violet-400">{"{transcription}"}</code> in your
            prompt to add the content of the selected video.
          </p>
        </div>

        <aside className="w-80 space-y-6">
          <VideoInputForm onVideoUploaded={setVideoId} />

          <Separator />

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label>Prompt</Label>
              <PromptSelect onPromptSelected={setInput} />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select disabled defaultValue="gpt3.5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt3.5">GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>
              <span className="block text-sx text-muted-foreground italic">
                You can customize this option soon
              </span>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Temperatura</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
              />
              <span className="block text-sx text-muted-foreground italic leading-relaxed">
                High values will generate more creative results, with possible
                errors.
              </span>
            </div>

            <Separator />

            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading ? (
                <>
                  Executing...
                  <Loader2Icon className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Execute
                  <Wand2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </aside>
      </main>
    </div>
  );
}

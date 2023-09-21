import { api } from "@/lib/axios";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { CheckCircle2, FileVideo, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

type Status = "waiting" | "converting" | "uploading" | "generating" | "success";

const statusMessages = {
  converting: "Converting video to audio...",
  generating: "Generating transcription...",
  uploading: "Uploading audio...",
  success: "Video uploaded successfully!",
};

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("waiting");

  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  async function convertVideoToAudio(video: File) {
    console.log("Convert started");

    const ffmpeg = await getFFmpeg();

    await ffmpeg.writeFile("input.mp4", await fetchFile(video));

    ffmpeg.on("progress", (progress) => {
      console.log(
        "Conversion progress: " + Math.round(progress.progress * 100)
      );
    });

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3",
    ]);

    const data = await ffmpeg.readFile("output.mp3");

    const audioFileBlob = new Blob([data], { type: "audio/mpeg-3" });
    const audioFile = new File([audioFileBlob], "audio.mp3", {
      type: "audio/mpeg",
    });

    console.log("Convert finished");

    return audioFile;
  }

  async function handleUploadVideo(event: React.FormEvent<HTMLFormElement>) {
    //para não recarregar a página, pois é um form
    event.preventDefault();

    const prompt = promptInputRef.current?.value;

    if (!videoFile) {
      return;
    }

    setStatus("converting");

    const audioFile = await convertVideoToAudio(videoFile);

    const data = new FormData();

    data.append("file", audioFile);

    setStatus("uploading");

    const response = await api.post("/videos", data);

    const videoId = response.data.video.id;

    setStatus("generating");

    await api.post(`/videos/${videoId}/transcription`, {
      prompt,
    });

    setStatus("success");
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;

    if (!files) {
      return;
    }

    const selectedFile = files[0];

    setVideoFile(selectedFile);
  }

  //useMemo faz com que a previewURL seja recriada, renderizada de novo apenas quando o videoFile mudar
  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null;
    }

    //Cria uma URL de pré visualização do video
    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        htmlFor="video"
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
      >
        {previewURL ? (
          <video
            src={previewURL}
            controls={false}
            className="pointer-events-none absolute inset-0"
          />
        ) : (
          <>
            <FileVideo className="w-4 h-4" />
            Select a video
          </>
        )}
      </label>
      <input
        type="file"
        id="video"
        className="sr-only"
        accept="video/mp4"
        onChange={handleFileSelect}
      />

      <Separator />

      <div className="space-y-5">
        <div className="flex flex-col gap-3">
          <Label htmlFor="transcription_prompt">Transcription prompt</Label>
          <Textarea
            ref={promptInputRef}
            disabled={status !== "waiting"}
            id="transcription_prompt"
            className="h-20 resize-none leading-relaxed"
            placeholder="Include keywords mentioned in the video separated by a comma (,)"
          />
        </div>
        <Button
          disabled={status !== "waiting"}
          type="submit"
          data-success={status === "success"}
          className="w-full data-[success=true]:bg-emerald-400"
        >
          {status === "waiting" ? (
            <>
              Upload video
              <Upload className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              {statusMessages[status]}
              {
                status === "success" && <CheckCircle2 className="w-5 h-5 ml-2" />
              }
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

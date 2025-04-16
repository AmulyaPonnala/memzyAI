"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useChat } from "ai/react";
import NeonIsometricMaze from "@/components/neon-isometric-maze";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, ImageIcon, Send, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Helper function to convert file to base64
const convertToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]); // Just base64, no metadata
      } else {
        reject(new Error("Failed to read file as string"));
      }
    };
    reader.onerror = reject;
  });

export default function ChatPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [captions, setCaptions] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Basic validation for image types Gemini supports
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Please upload a JPEG or PNG image.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Check file size (limit to 10MB - Gemini has limits too)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      alert("File is too large! Please upload a file smaller than 10MB.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploadedFile(file);

    // Generate preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCaptions(null); // Clear captions when new image is uploaded
  };

  const clearUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    setCaptions(null); // Clear captions
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateCaption = async () => {
    if (!uploadedFile) {
      alert("Please upload an image first.");
      return;
    }

    try {
      setIsGenerating(true);
      setCaptions(null); // Clear previous captions

      const imageBase64 = await convertToBase64(uploadedFile);
      const mimeType = uploadedFile.type;

      const response = await fetch("/api/generate-caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64, mimeType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
        throw new Error(errorData.error || "Failed to generate caption");
      }

      const data = await response.json();
      // Ensure captions is an array
      if (Array.isArray(data.captions)) {
        setCaptions(data.captions);
      } else {
        console.error("API did not return an array of captions:", data);
        setCaptions([]); // Set to empty array if format is wrong
      }
    } catch (error) {
      console.error("Error generating caption:", error);
      alert(
        `Failed to generate caption: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <NeonIsometricMaze />

      <div className="absolute inset-0 flex flex-col p-4 md:p-8 z-10">
        <div className="flex items-center mb-4">
          <Link
            href="/"
            className="flex items-center text-white hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            <span className="font-bold">Back</span>
          </Link>
          <h1 className="text-3xl font-extrabold mx-auto text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400">
            memezy.ai
          </h1>
        </div>

        <Card className="flex-1 overflow-hidden backdrop-blur-md bg-black/40 border-purple-500/50 text-white">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!previewUrl && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-5xl mb-4">🖼️</div>
                  <h2 className="text-2xl font-bold mb-2 text-gradient-pink">
                    Upload an Image for Meme Captions!
                  </h2>
                  <p className="text-gray-300 max-w-md">
                    Upload a JPEG or PNG image, and I'll use Gemini Vision to
                    generate a list of funny captions.
                  </p>
                </div>
              )}

              {previewUrl && (
                <div className="relative h-64 w-full mb-4">
                  {/* Only show image preview now */}
                  <Image
                    src={previewUrl}
                    alt="Uploaded meme preview"
                    fill
                    className="object-contain rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full w-7 h-7"
                    onClick={clearUpload}
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}

              {captions && captions.length > 0 && (
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-xl">
                  <ul className="list-disc list-inside space-y-1">
                    {captions.map((caption, index) => (
                      <li key={index}>{caption}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isGenerating && (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-purple-500/30">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="bg-transparent border-purple-500/50 hover:bg-purple-500/20 text-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {/* Remove text input for prompt, as it comes from the image now */}
                <Button
                  type="button" // Changed from submit
                  variant="default"
                  size="default" // Make button wider
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isGenerating || !uploadedFile}
                  onClick={generateCaption} // Call generateCaption directly
                >
                  {isGenerating ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Send className="h-5 w-5 mr-2" />
                  )}
                  Generate Captions
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

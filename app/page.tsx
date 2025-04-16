import Link from "next/link";
import { Button } from "@/components/ui/button";
import NeonIsometricMaze from "@/components/neon-isometric-maze";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <NeonIsometricMaze />

      {/* Student Info Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-black/50 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white">
            <h2 className="text-xl font-bold">Amulya Ponnala</h2>
            <p className="text-sm text-gray-300">Reg. No: 12402587</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 z-10">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400">
            memezy.ai
          </h1>
          <p className="text-xl md:text-2xl font-bold text-white max-w-2xl mx-auto">
            Create hilarious meme captions with the power of AI. Upload your
            meme and let our AI generate the perfect caption!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full">
                Start Creating
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

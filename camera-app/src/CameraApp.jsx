import { useRef, useState } from "react";
import { FaCamera, FaVideo, FaRedo } from "react-icons/fa";

export default function CameraApp() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
  };

  const toggleVideoMode = () => {
    setIsVideoMode(!isVideoMode);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const recorder = new MediaRecorder(streamRef.current);
    setMediaRecorder(recorder);
    setRecordedChunks([]);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const downloadVideo = () => {
    const blob = new Blob(recordedChunks, { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded-video.mp4";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
      <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-lg shadow-md" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-4 mt-4">
        <button
          onClick={startCamera}
          className="p-3 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600"
        >
          <FaRedo size={20} />
        </button>
        {isVideoMode ? (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full shadow-lg ${isRecording ? "bg-red-500" : "bg-green-500"} hover:opacity-80`}
          >
            <FaVideo size={20} />
          </button>
        ) : (
          <button
            onClick={capturePhoto}
            className="p-3 bg-yellow-500 rounded-full shadow-lg hover:bg-yellow-600"
          >
            <FaCamera size={20} />
          </button>
        )}
        <button
          onClick={toggleVideoMode}
          className="p-3 bg-purple-500 rounded-full shadow-lg hover:bg-purple-600"
        >
          {isVideoMode ? "Switch to Photo" : "Switch to Video"}
        </button>
      </div>
      {recordedChunks.length > 0 && (
        <button
          onClick={downloadVideo}
          className="mt-4 p-3 bg-green-600 rounded-lg shadow-lg hover:bg-green-700"
        >
          Download Video
        </button>
      )}
    </div>
  );
}

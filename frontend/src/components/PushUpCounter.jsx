import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";

const PushUpCounter = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [pushUpCount, setPushUpCount] = useState(0);
  const [direction, setDirection] = useState(0); // 0 = up, 1 = down
  const [feedback, setFeedback] = useState("Fix Form");
  const [form, setForm] = useState(0); // 0 = not ready, 1 = ready
  const [videoFile, setVideoFile] = useState(null); // To store the uploaded video

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    pose.onResults(onResults);

    const video = videoRef.current;
    if (videoFile) {
      video.src = URL.createObjectURL(videoFile); // Set video source to uploaded file
      video.play();
    }

    // Video load event to ensure it's ready
    video.onloadeddata = () => {
      video.play();
      processVideoFrame();
    };

    // Ensure that the video and canvas are resized
    const handleResize = () => {
      if (videoRef.current) {
        const { videoWidth, videoHeight } = videoRef.current;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial resize

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [videoFile]);

  const processVideoFrame = async () => {
    const video = videoRef.current;

    // Check if the video is playing, then process the frame
    if (!video.paused && !video.ended) {
      await pose.send({ image: videoRef.current });
      requestAnimationFrame(processVideoFrame);
    }
  };

  const calculateAngle = (A, B, C) => {
    const AB = { x: B.x - A.x, y: B.y - A.y };
    const BC = { x: C.x - B.x, y: C.y - B.y };
    const dotProduct = AB.x * BC.x + AB.y * BC.y;
    const magnitudeAB = Math.sqrt(AB.x ** 2 + AB.y ** 2);
    const magnitudeBC = Math.sqrt(BC.x ** 2 + BC.y ** 2);
    return Math.acos(dotProduct / (magnitudeAB * magnitudeBC)) * (180 / Math.PI);
  };

  const onResults = (results) => {
    const landmarks = results.poseLandmarks;
    if (!landmarks) return;

    // Find relevant joints
    const elbow = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
    const shoulder = calculateAngle(landmarks[13], landmarks[11], landmarks[23]);
    const hip = calculateAngle(landmarks[11], landmarks[23], landmarks[25]);

    const per = (elbow - 90) * (100 / (160 - 90));
    const barPosition = (elbow - 90) * (380 / (160 - 90)) + 50;

    // Check form before starting
    if (elbow > 160 && shoulder > 40 && hip > 160) {
      setForm(1);
    }

    if (form === 1) {
      if (per === 0) {
        if (elbow <= 90 && hip > 160) {
          setFeedback("Up");
          if (direction === 0) {
            setPushUpCount((prev) => prev + 0.5);
            setDirection(1);
          }
        } else {
          setFeedback("Fix Form");
        }
      }

      if (per === 100) {
        if (elbow > 160 && shoulder > 40 && hip > 160) {
          setFeedback("Down");
          if (direction === 1) {
            setPushUpCount((prev) => prev + 0.5);
            setDirection(0);
          }
        } else {
          setFeedback("Fix Form");
        }
      }
    }

    drawCanvas(results, barPosition, per);
  };

  const drawCanvas = (results, barPosition, per) => {
    const canvasCtx = canvasRef.current.getContext("2d");
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

    // Clear the canvas before drawing
    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
    canvasCtx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    // Draw the push-up progress bar
    if (form === 1) {
      canvasCtx.beginPath();
      canvasCtx.rect(580, 50, 20, 330);
      canvasCtx.strokeStyle = "green";
      canvasCtx.lineWidth = 3;
      canvasCtx.stroke();
      canvasCtx.beginPath();
      canvasCtx.rect(580, barPosition, 20, 330);
      canvasCtx.fillStyle = "green";
      canvasCtx.fill();
      canvasCtx.font = "20px Arial";
      canvasCtx.fillText(`${Math.round(per)}%`, 565, 430);
    }

    // Draw the push-up count
    canvasCtx.fillStyle = "green";
    canvasCtx.font = "40px Arial";
    canvasCtx.fillText(`${Math.round(pushUpCount)}`, 25, 455);

    // Draw feedback
    canvasCtx.fillStyle = "white";
    canvasCtx.fillRect(500, 0, 140, 40);
    canvasCtx.fillStyle = "green";
    canvasCtx.font = "20px Arial";
    canvasCtx.fillText(feedback, 510, 30);
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file); // Set the uploaded video file
    }
  };

  return (
    <div>
      <h1>Push-up Counter: {Math.round(pushUpCount)}</h1>
      <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={handleVideoUpload} />
      <video
        ref={videoRef}
        style={{ display: "none" }}
        controls
        loop
        onCanPlay={() => {
          // Ensure canvas size matches the video size
          const video = videoRef.current;
          if (video) {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
          }
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ width: "320px", height: "240px", border: "1px solid black" }}
      />
    </div>
  );
};

export default PushUpCounter;

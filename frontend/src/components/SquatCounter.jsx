import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";

const SquatCounter = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [squatCount, setSquatCount] = useState(0);
  const [state, setState] = useState("up");
  const [feedback, setFeedback] = useState(""); // Real-time feedback
  let camera = null;
  let lastFrameTime = Date.now();
  const frameInterval = 200;

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

    if (videoRef.current) {
      camera = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 320,
        height: 240,
      });
      camera.start();
    }
  }, []);

  const onResults = (results) => {
    const currentTime = Date.now();
    if (currentTime - lastFrameTime < frameInterval) return;
    lastFrameTime = currentTime;
  
    if (!results.poseLandmarks) return;
  
    const landmarks = results.poseLandmarks;
    const hip = landmarks[24];
    const knee = landmarks[26];
    const ankle = landmarks[28];
  
    const kneeAngle = calculateAngle(hip, knee, ankle);
  
    const downThreshold = 90; // Keep this for squat "down"
    const upThreshold = 160; // Lower the threshold slightly to allow more detection range for "up"
    
    // in the onResults function
    if (kneeAngle < downThreshold) {
      if (state === "up") {
        setState("down");
        setFeedback("Good depth! Hold for a moment.");
      }
    } else if (kneeAngle >= downThreshold && kneeAngle <= upThreshold) {
      setFeedback("Maintain control while moving up/down.");
    }
    
    if (kneeAngle >= upThreshold && state === "down") {
      setState("up");
      setSquatCount((prev) => prev + 1);
      setFeedback("Squat counted! Keep going!");
    }
    
  
    drawCanvas(results, kneeAngle);
  };
  

  const calculateAngle = (A, B, C) => {
    const AB = { x: B.x - A.x, y: B.y - A.y };
    const BC = { x: C.x - B.x, y: C.y - B.y };
    const dotProduct = AB.x * BC.x + AB.y * BC.y;
    const magnitudeAB = Math.sqrt(AB.x ** 2 + AB.y ** 2);
    const magnitudeBC = Math.sqrt(BC.x ** 2 + BC.y ** 2);
    return Math.acos(dotProduct / (magnitudeAB * magnitudeBC)) * (180 / Math.PI);
  };

  const drawCanvas = (results, kneeAngle) => {
    const canvasCtx = canvasRef.current.getContext("2d");
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
    canvasCtx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    if (!results.poseLandmarks) return;

    results.poseLandmarks.forEach((landmark) => {
      canvasCtx.beginPath();
      canvasCtx.arc(landmark.x * videoWidth, landmark.y * videoHeight, 5, 0, 2 * Math.PI);
      canvasCtx.fillStyle = "red";
      canvasCtx.fill();
    });

    const color = kneeAngle < 90 ? "green" : kneeAngle > 170 ? "blue" : "yellow";
    canvasCtx.fillStyle = color;
    canvasCtx.font = "20px Arial";
    canvasCtx.fillText(`Knee Angle: ${Math.round(kneeAngle)}°`, 10, 30);
  };

  return (
    <div>
      <h1>Squat Counter: {squatCount}</h1>
      <p style={{ color: "blue" }}>{feedback}</p>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ width: "320px", height: "240px", border: "1px solid black" }} />
    </div>
  );
};

export default SquatCounter;

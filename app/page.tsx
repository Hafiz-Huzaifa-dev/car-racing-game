"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const spawnIntervalRef = useRef<NodeJS.Timer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startGame = () => {
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
  };

  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const roadWidth = 400;
    const laneCount = 3;
    const laneWidth = roadWidth / laneCount;

    const carWidth = 50;
    const carHeight = 80;
    let carLane = 1;
    let carX = carLane * laneWidth + (laneWidth - carWidth) / 2;
    const carY = 500;

    let obstacles: { x: number; y: number; w: number; h: number; color: string }[] = [];
    let localScore = 0;
    let speed = 4;
    let localGameOver = false;

    // Keyboard controls
    const keyHandler = (e: KeyboardEvent) => {
      if (localGameOver) return;
      if (e.key === "ArrowLeft" && carLane > 0) carLane--;
      if (e.key === "ArrowRight" && carLane < laneCount - 1) carLane++;
      carX = carLane * laneWidth + (laneWidth - carWidth) / 2;
      e.preventDefault();
    };
    window.addEventListener("keydown", keyHandler);

    // Mobile swipe
    let touchStartX: number | null = null;
    const touchStart = (e: TouchEvent) => (touchStartX = e.touches[0].clientX);
    const touchMove = (e: TouchEvent) => e.preventDefault();
    const touchEnd = (e: TouchEvent) => {
      if (localGameOver || touchStartX === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (deltaX > 30 && carLane < laneCount - 1) carLane++;
      if (deltaX < -30 && carLane > 0) carLane--;
      carX = carLane * laneWidth + (laneWidth - carWidth) / 2;
    };
    canvas.addEventListener("touchstart", touchStart);
    canvas.addEventListener("touchmove", touchMove, { passive: false });
    canvas.addEventListener("touchend", touchEnd);

    // Spawn obstacles
    function spawnObstacle() {
      const lane = Math.floor(Math.random() * laneCount);
      const colors = ["yellow", "orange", "purple"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      obstacles.push({
        x: lane * laneWidth + (laneWidth - carWidth) / 2,
        y: -60,
        w: carWidth,
        h: 60,
        color,
      });
    }

    // Draw functions
    const drawRoad = () => {
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      for (let i = 1; i < laneCount; i++) {
        ctx.setLineDash([20, 15]);
        ctx.beginPath();
        ctx.moveTo(i * laneWidth, 0);
        ctx.lineTo(i * laneWidth, canvas.height);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    const drawCar = () => {
      ctx.fillStyle = `hsl(${(Date.now() / 5) % 360}, 100%, 50%)`;
      ctx.fillRect(carX, carY, carWidth, carHeight);
    };

    const drawObstacles = () => {
      obstacles.forEach((o) => {
        o.y += speed;
        ctx.fillStyle = o.color;
        ctx.fillRect(o.x, o.y, o.w, o.h);
        if (carX < o.x + o.w && carX + carWidth > o.x && carY < o.y + o.h && carY + carHeight > o.y) {
          localGameOver = true;
          setGameOver(true);
        }
      });
      obstacles = obstacles.filter((o) => o.y < canvas.height);
    };

    const drawScore = () => {
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(`Score: ${localScore}`, 10, 25);
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawRoad();
      drawCar();
      drawObstacles();
      drawScore();

      if (localGameOver) return;

      localScore++;
      setScore(localScore);
      if (localScore % 500 === 0) speed += 0.5;
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    spawnIntervalRef.current = setInterval(spawnObstacle, 1200);
    gameLoop();

    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("keydown", keyHandler);
      canvas.removeEventListener("touchstart", touchStart);
      canvas.removeEventListener("touchmove", touchMove);
      canvas.removeEventListener("touchend", touchEnd);
    };
  }, [gameStarted]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {!gameStarted && !gameOver && (
        <button
          onClick={startGame}
          style={{
            padding: "20px 40px",
            fontSize: "24px",
            backgroundColor: "red",
            color: "white",
            borderRadius: "10px",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          Play
        </button>
      )}
      <canvas ref={canvasRef} width={400} height={600} style={{ border: "2px solid white" }} />

      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "24px",
          }}
        >
          <p>CRASH! Your Score: {score}</p>
          <button
            onClick={() => {
              setGameStarted(false);
              setTimeout(() => startGame(), 50); // reset game state
            }}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "20px",
              backgroundColor: "red",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

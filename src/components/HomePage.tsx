import { FilesetResolver, Landmark, PoseLandmarker } from '@mediapipe/tasks-vision';
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import LineChart from './LineChart';

export default function HomePage() {
   const webcamRef = useRef<Webcam>(null);
  const [items, setItems] = useState<{
    //imageSrc: string;
    result: Landmark[] | null;
    headDistFromPlane: number | null;
  }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      capturePhoto();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const capturePhoto = async  () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) return;
    const vision = await FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    )
    const poseLandmarker = await PoseLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: "/models/pose_landmarker_full.task"
          },
          runningMode: 'IMAGE'
        });
  
     // Create an HTML Image element from the base64 string
  const img = new Image();
  img.src = imageSrc;
  img.onload = () => {
    const result = poseLandmarker.detect(img);
    const worldLandmarks = result.worldLandmarks[0];
    const newItem = {
      //imageSrc,
      result: worldLandmarks ?? null,
      headDistFromPlane: worldLandmarks ? getHeadPosition(worldLandmarks) : null,
    }

    setItems(prevPhotos => [newItem, ...prevPhotos.length >= 200 ? prevPhotos.slice(0, 200) : prevPhotos]);
  };
  };

  const getAverageOfTwoPoints = (point1: Landmark, point2: Landmark): Landmark => {
    return {
      ...point1,
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2,
      z: (point1.z + point2.z) / 2,
    }
  }

  const getHeadPosition = (landmarks: Landmark[]): number | null => {
    if (landmarks.length < 30) return null // shouldn't ever happen
    const torsoPoint = getAverageOfTwoPoints(landmarks[24]!, landmarks[23]!);
    const plane = definePlaneFromPoints(landmarks[11]!, landmarks[12]!, torsoPoint);

    let totalDist = 0;
    for (let i = 0; i <= 10; i++) {
      const landmark = landmarks[i]!;
      totalDist += distancePointToPlane(plane, landmark);
    }
    const averageDist = totalDist / 11;
    return averageDist;
  }

  function distancePointToPlane(plane: {a: number, b: number, c: number, d: number}, point: Landmark) {
    const { a, b, c, d } = plane;
    const {x, y, z} = point;
    
    // Calculate the distance using the plane equation
    const numerator = Math.abs(a * x + b * y + c * z - d);
    const denominator = Math.sqrt(a * a + b * b + c * c);
    
    const distance = numerator / denominator;
    return distance;
}

  function definePlaneFromPoints(p1: Landmark, p2: Landmark, p3: Landmark) {
    // Create vectors from the points
    const v1 = [
        p2.x - p1.x,
        p2.y - p1.y,
        p2.z - p1.z
    ];
    const v2 = [
      p3.x - p1.x,
      p3.y - p1.y,
      p3.z - p1.z
  ];
    
    // Calculate the normal vector to the plane (cross product of v1 and v2)
    const normalVector = [
        v1[1]! * v2[2]! - v1[2]! * v2[1]!,
        v1[2]! * v2[0]! - v1[0]! * v2[2]!,
        v1[0]! * v2[1]! - v1[1]! * v2[0]!
    ];
    
    // Plane equation is ax + by + cz = d
    // where (a, b, c) is the normal vector and d can be found using point p1
    const a = normalVector[0]!;
    const b = normalVector[1]!;
    const c = normalVector[2]!;
    const d = a * p1.x + b * p1.y + c * p1.z;
    
    return { a, b, c, d };
}
  

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
        height={240}
      />
      <LineChart data={items.map(item => item.headDistFromPlane ?? 0)} />
    </div>
  )
}

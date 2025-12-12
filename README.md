# Emotion Aware UI

This project uses **face-api.js** to detect facial emotions in real time through your webcam.
Based on your expression (happy, sad, angry, surprised, neutral), the interface changes its colors, text, and behavior.
Built using **React** and **Vite**.

## How to Run the Project

1. Clone the repository
   
```bash
git clone https://github.com/Shadow69200569/Emotion_Aware_UI.git
cd Emotion_Aware_UI
```

2. Install dependencies:

```bash
npm install
```

3. Make sure the face-api model files are placed inside:

```
public/models/
```

4. Start the development server:

```bash
npm run dev
```

5. Open the link shown in the terminal (usually):

```
http://localhost:5173
```

6. Allow camera access when the browser asks.

## Tech Used

- React – UI framework
- Vite – development and build tool
- face-api.js – emotion detection models
- HTML5 Video API – webcam streaming
- JavaScript (ESNext)

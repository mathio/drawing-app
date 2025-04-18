import { DrawingCanvas } from "./DrawingCanvas";

function App() {
  return (
    <>
      <div className="w-full h-full">
        <DrawingCanvas />
        <img
          src="/mascot.png"
          alt="goose"
          style={{ width: "300px", position: "absolute", bottom: 0, right: 0 }}
        />
      </div>
    </>
  );
}

export default App;

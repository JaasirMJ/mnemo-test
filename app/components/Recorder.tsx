"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Session {
  id: number;
  transcript: string;
  createdAt: string;
}

export default function Recorder() {
  const [recording, setRecording] = useState(false);

  const [transcript, setTranscript] = useState("");

  const [sessions, setSessions] = useState<Session[]>([]);

  const [searchQuery, setSearchQuery ] = useState("");

  const recognitionRef = useRef<any>(null);

  const filteredSessions = sessions.filter(
  (session) =>
    session.transcript
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
);

  useEffect(() => {
    const savedSessions =
      localStorage.getItem("study_sessions");

    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";

      for (
        let i = 0;
        i < event.results.length;
        i++
      ) {
        finalTranscript +=
          event.results[i][0].transcript + " ";
      }

      setTranscript(finalTranscript);
    };

    recognitionRef.current = recognition;
  }, []);

  function startRecording() {
    setTranscript("");

    recognitionRef.current.start();

    setRecording(true);
  }

  function stopRecording() {
    recognitionRef.current.stop();

    setRecording(false);
  }

  function saveSession() {
    if (!transcript.trim()) return;

    const newSession = {
      id: Date.now(),
      transcript,
      createdAt: new Date().toLocaleString(),
    };

    const updatedSessions = [
      newSession,
      ...sessions,
    ];

    setSessions(updatedSessions);

    localStorage.setItem(
      "study_sessions",
      JSON.stringify(updatedSessions)
    );

    setTranscript("");
  }

  return (
    <div className="p-10 flex flex-col gap-6">
      <h1 className="text-4xl font-bold">
        AI Study Memory
      </h1>

      {!recording ? (
        <button
          onClick={startRecording}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Stop Recording
        </button>
      )}

      <div className="border p-4 rounded">
        <h2 className="font-bold mb-2">
          Live Transcript
        </h2>

        <p>{transcript}</p>
      </div>

      <button
        onClick={saveSession}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save Session
      </button>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">
          Previous Sessions
        </h2>

        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="border p-4 rounded"
          >
            <p className="text-sm text-gray-500 mb-2">
              {session.createdAt}
            </p>

            <p>{session.transcript}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
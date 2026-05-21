"use client";
import {Search} from "lucide-react";


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
  subject: string; 
}

export default function Recorder() {
  const [recording, setRecording] = useState(false);

  const [transcript, setTranscript] = useState("");

  const [sessions, setSessions] = useState<Session[]>([]);

  const [searchQuery, setSearchQuery ] = useState("");

  const [activeSession, setActiveSession] =
  useState<Session | null>(null);

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
  function detectSubject(text: string) {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("force") ||
    lowerText.includes("motion") ||
    lowerText.includes("velocity") ||
    lowerText.includes("newton")
  ) {
    return "Physics";
  }

  if (
    lowerText.includes("cell") ||
    lowerText.includes("photosynthesis") ||
    lowerText.includes("biology")
  ) {
    return "Biology";
  }

  if (
    lowerText.includes("equation") ||
    lowerText.includes("calculus") ||
    lowerText.includes("algebra")
  ) {
    return "Mathematics";
  }

  return "General";
}

  function saveSession() {
    if (!transcript.trim()) return;

    const newSession = {
      id: Date.now(),
      transcript,
      createdAt: new Date().toLocaleString(),
      subject: detectSubject(transcript),
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
  <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">

    {/* SIDEBAR */}

    <div className="w-80 bg-[#111118] border-r border-white/5 p-5 flex flex-col">

      <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 text-transparent bg-clip-text">
        Mnemo.AI
      </h1>

      {/* SEARCH */}

      <div className="flex items-center gap-2 bg-[#1a1a24] border border-white/5 rounded-2xl px-4 py-3 mb-5">

        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          className="bg-transparent outline-none w-full text-sm placeholder:text-gray-500"
        />

      </div>

      {/* MEMORY LIST */}

      <div className="flex flex-col gap-4 overflow-y-auto pr-2">

        {filteredSessions.map((session) => (

          <div
            key={session.id}
            onClick={() => setActiveSession(session)}
            className="bg-[#181820] border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-violet-500/40 hover:bg-[#20202b] transition-all duration-300"
          >

            <div className="flex justify-between items-start mb-3">

              <h2 className="text-violet-300 font-semibold">
                {session.subject}
              </h2>

              <p className="text-xs text-gray-500">
                {session.createdAt}
              </p>

            </div>

            <p className="text-sm text-gray-300 line-clamp-4 leading-6">
              {session.transcript}
            </p>

          </div>

        ))}

      </div>

    </div>

    {/* CENTER */}

    <div className="flex-1 flex flex-col p-10 gap-6 overflow-hidden">

      {/* TOP HEADER */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-5xl font-black tracking-tight">
            Your Second Brain
          </h1>

          <p className="text-gray-400 mt-2">
            Record. Remember. Retrieve.
          </p>

        </div>

        <div className="bg-[#15151d] border border-white/5 rounded-2xl px-5 py-3">

          <p className="text-sm text-gray-400">
            Sessions Stored
          </p>

          <h2 className="text-2xl font-bold">
            {sessions.length}
          </h2>

        </div>

      </div>

      {/* RECORDING CONTROLS */}

      <div className="flex items-center gap-4">

        {!recording ? (

          <button
            onClick={startRecording}
            className="bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition-all shadow-[0_0_40px_rgba(139,92,246,0.4)]"
          >
            Start Recording
          </button>

        ) : (

          <button
            onClick={stopRecording}
            className="bg-gradient-to-r from-red-500 to-pink-500 px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition-all shadow-[0_0_40px_rgba(239,68,68,0.4)]"
          >
            Stop Recording
          </button>

        )}

        <button
          onClick={saveSession}
          className="bg-[#1b1b24] border border-white/10 px-6 py-4 rounded-2xl hover:bg-[#242430] transition-all"
        >
          Save Session
        </button>

      </div>

      {/* LIVE TRANSCRIPT */}

      <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">

        {/* MAIN PANEL */}

        <div className="col-span-2 bg-[#111118] border border-white/5 rounded-3xl p-6 overflow-y-auto">

          {activeSession ? (

            <div className="flex flex-col gap-5">

              <div className="flex justify-between items-center">

                <div>

                  <h2 className="text-3xl font-bold">
                    {activeSession.subject}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {activeSession.createdAt}
                  </p>

                </div>

              </div>

              <div className="bg-[#1a1a24] border border-white/5 rounded-2xl p-5">

                <p className="text-gray-300 leading-8 whitespace-pre-wrap">
                  {activeSession.transcript}
                </p>

              </div>

            </div>

          ) : (

            <div className="h-full flex items-center justify-center text-gray-500 text-lg">

              No memory selected

            </div>

          )}

        </div>

        {/* RIGHT AI PANEL */}

        <div className="bg-[#111118] border border-white/5 rounded-3xl p-5 flex flex-col gap-5 overflow-y-auto">

          <h2 className="text-xl font-bold">
            AI Insights
          </h2>

          <div className="bg-[#1a1a24] rounded-2xl p-4 border border-white/5">

            <p className="text-sm text-gray-400 mb-2">
              Live Transcript
            </p>

            <p className="text-gray-300 leading-7">
              {transcript || "Start recording to see live transcript..."}
            </p>

          </div>

          <div className="bg-[#1a1a24] rounded-2xl p-4 border border-white/5">

            <p className="text-sm text-gray-400 mb-2">
              AI Subject Detection
            </p>

            <h3 className="text-xl font-semibold text-violet-300">
              {detectSubject(transcript)}
            </h3>

          </div>

          <div className="bg-[#1a1a24] rounded-2xl p-4 border border-white/5">

            <p className="text-sm text-gray-400 mb-2">
              Quick Stats
            </p>

            <div className="flex flex-col gap-2">

              <p className="text-gray-300">
                Total Sessions: {sessions.length}
              </p>

              <p className="text-gray-300">
                Recording: {recording ? "Active" : "Inactive"}
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
);
}
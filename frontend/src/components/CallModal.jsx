import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "../api/socket";
import api from "../api/axios";
import {
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff,
  Monitor, MonitorOff, Maximize2, Minimize2, Volume2, VolumeX,
  RefreshCw
} from "lucide-react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function CallModal({
  callState,
  setCallState,
  otherUser,
  currentUserId,
  conversationId
}) {
  const modalRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const iceQueueRef = useRef([]);
  const makingOfferRef = useRef(false);
  const isEndingRef = useRef(false);

  const socket = getSocket();

  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const attachRemoteStream = useCallback((stream) => {
    if (!stream) return;

    remoteStreamRef.current = stream;
    setHasRemoteVideo(stream.getVideoTracks().some(t => t.readyState === "live"));

    if (remoteVideoRef.current) {
      if (remoteVideoRef.current.srcObject !== stream) {
        remoteVideoRef.current.srcObject = stream;
      }
      remoteVideoRef.current.play().catch(() => {});
    }

    if (remoteAudioRef.current) {
      if (remoteAudioRef.current.srcObject !== stream) {
        remoteAudioRef.current.srcObject = stream;
      }
      remoteAudioRef.current.play().catch(() => {});
    }
  }, []);

  const flushIceQueue = useCallback(async () => {
    if (!peerRef.current || !peerRef.current.remoteDescription) return;

    const queue = [...iceQueueRef.current];
    iceQueueRef.current = [];

    for (const candidate of queue) {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Flush ICE error:", err);
      }
    }
  }, []);

  const cleanup = useCallback(async () => {
    console.log("🧹 Cleaning up call resources...");

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => {
        t.enabled = false;
        t.stop();
      });
      localStreamRef.current = null;
    }

    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.oniceconnectionstatechange = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
    }

    remoteStreamRef.current = null;
    pendingOfferRef.current = null;
    iceQueueRef.current = [];
    makingOfferRef.current = false;
    setHasRemoteVideo(false);

    console.log("✅ Cleanup complete");
  }, []);

  const enterFullscreen = async (el) => {
    if (!el) return;

    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
    if (el.msRequestFullscreen) return el.msRequestFullscreen();
  };

  const exitFullscreen = async () => {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    if (document.msExitFullscreen) return document.msExitFullscreen();
  };

  const toggleFullscreen = useCallback(async () => {
    try {
      const isFs =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

      if (!isFs) {
        await enterFullscreen(modalRef.current);
      } else {
        await exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      setError("Fullscreen failed");
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (callState.status === "connected") {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState.status]);

  const initPeer = useCallback(async () => {
    if (peerRef.current) return peerRef.current;

    console.log("🔌 Creating peer connection...");
    const peer = new RTCPeerConnection(ICE_SERVERS);
    peerRef.current = peer;

    // local tracks add
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    // remote stream
    peer.ontrack = (event) => {
      console.log("📺 Remote track:", event.track.kind, event.track.readyState);

      let remoteStream = event.streams?.[0];

      // fallback if streams array empty
      if (!remoteStream) {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        remoteStreamRef.current.addTrack(event.track);
        remoteStream = remoteStreamRef.current;
      }

      attachRemoteStream(remoteStream);

      event.track.onunmute = () => {
        attachRemoteStream(remoteStream);
      };

      event.track.onended = () => {
        const stillHasVideo = remoteStream
          .getVideoTracks()
          .some(t => t.readyState === "live");
        setHasRemoteVideo(stillHasVideo);
      };
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && otherUser?._id) {
        socket.emit("ice-candidate", {
          to: otherUser._id,
          candidate: event.candidate,
        });
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("📡 connectionState:", peer.connectionState);

      if (peer.connectionState === "connected") {
        setCallState(prev => ({ ...prev, status: "connected" }));
        setIsReconnecting(false);
      }

      if (peer.connectionState === "disconnected") {
        setIsReconnecting(true);
      }

      if (peer.connectionState === "failed") {
        setError("Connection failed");
        setIsReconnecting(true);
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log("🧊 iceConnectionState:", peer.iceConnectionState);
    };

    // pending offer process
    if (pendingOfferRef.current) {
      const { from, offer } = pendingOfferRef.current;
      pendingOfferRef.current = null;

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        await flushIceQueue();

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("answer", { to: from, answer });
        setCallState(prev => ({ ...prev, status: "connected" }));
      } catch (err) {
        console.error("Pending offer error:", err);
        setError("Failed to process offer");
      }
    }

    return peer;
  }, [attachRemoteStream, flushIceQueue, otherUser?._id, setCallState, socket]);

  const initCall = useCallback(async () => {
    try {
      setError(null);
      isEndingRef.current = false;

      const isVideo = callState.type === "video";

      console.log("🎥 Getting user media...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: isVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            }
          : false,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current && isVideo) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        await localVideoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error("Media error:", err);

      if (err.name === "NotReadableError") {
        setError("Camera/Mic already in use by another app.");
      } else if (err.name === "NotAllowedError") {
        setError("Permission denied. Allow camera/mic access.");
      } else {
        setError("Failed to access camera/microphone");
      }

      setTimeout(() => {
        setCallState({ status: "idle", type: null, callId: null });
      }, 2500);
    }
  }, [callState.type, setCallState]);

  useEffect(() => {
    if (callState.status === "idle") {
      cleanup();
      return;
    }

    if (callState.status === "calling" || callState.status === "ringing") {
      initCall();
    }
  }, [callState.status, cleanup, initCall]);

  const endCall = useCallback(async () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;

    if (otherUser?._id) {
      socket.emit("call-ended", { to: otherUser._id });
    }

    if (conversationId && callDuration > 0) {
      try {
        await api.post("/chat/call-log", {
          conversationId,
          receiverId: otherUser?._id,
          type: callState.type,
          status: "ended",
          duration: callDuration,
        });
      } catch (err) {
        console.error("Call log error:", err);
      }
    }

    await cleanup();

    try {
      const isFs =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
      if (isFs) await exitFullscreen();
    } catch {}

    setCallState({ status: "idle", type: null, callId: null });
    setCallDuration(0);
    setScreenSharing(false);
    setMuted(false);
    setVideoOff(false);
    setSpeakerOff(false);
    setIsReconnecting(false);
    setHasRemoteVideo(false);
  }, [
    otherUser?._id,
    conversationId,
    callDuration,
    callState.type,
    cleanup,
    socket,
    setCallState
  ]);

  useEffect(() => {
    if (!socket || !otherUser?._id) return;

    const handleCallAccepted = async ({ by }) => {
      if (by !== otherUser._id || callState.status !== "calling") return;

      try {
        console.log("📞 Call accepted, creating offer...");
        const peer = await initPeer();

        makingOfferRef.current = true;
        const offer = await peer.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: callState.type === "video",
        });
        await peer.setLocalDescription(offer);
        makingOfferRef.current = false;

        socket.emit("offer", { to: otherUser._id, offer });
      } catch (err) {
        makingOfferRef.current = false;
        console.error("Offer error:", err);
        setError("Failed to create offer");
      }
    };

    const handleOffer = async ({ from, offer }) => {
      if (from !== otherUser._id) return;

      try {
        console.log("📨 Offer received");

        if (!peerRef.current) {
          pendingOfferRef.current = { from, offer };
          await initPeer();
          return;
        }

        const peer = peerRef.current;

        // ignore if we are already making offer and state is unstable
        if (makingOfferRef.current || peer.signalingState !== "stable") {
          console.warn("Offer ignored due to state:", peer.signalingState);
          return;
        }

        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        await flushIceQueue();

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("answer", { to: from, answer });
        setCallState(prev => ({ ...prev, status: "connected" }));
      } catch (err) {
        console.error("Offer handling error:", err);
        setError("Connection failed");
      }
    };

    const handleAnswer = async ({ from, answer }) => {
      if (from !== otherUser._id || !peerRef.current) return;

      try {
        console.log("📨 Answer received");
        if (peerRef.current.signalingState === "have-local-offer") {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          await flushIceQueue();
          setCallState(prev => ({ ...prev, status: "connected" }));
        }
      } catch (err) {
        console.error("Answer error:", err);
        setError("Failed to complete connection");
      }
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      if (from !== otherUser._id || !candidate) return;

      try {
        if (!peerRef.current || !peerRef.current.remoteDescription) {
          iceQueueRef.current.push(candidate);
          return;
        }

        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("ICE error:", err);
      }
    };

    const handleCallEnded = () => {
      endCall();
    };

    socket.on("call-accepted", handleCallAccepted);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("call-accepted", handleCallAccepted);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
    };
  }, [
    socket,
    otherUser?._id,
    callState.status,
    callState.type,
    initPeer,
    flushIceQueue,
    endCall,
    setCallState
  ]);

  const acceptCall = async () => {
    try {
      console.log("✅ Accepting call...");
      await initPeer();
      socket.emit("call-accepted", { to: otherUser._id });
    } catch (err) {
      console.error("Accept error:", err);
      setError("Failed to accept call");
    }
  };

  const rejectCall = async () => {
    socket.emit("call-rejected", { to: otherUser._id });
    await cleanup();
    setCallState({ status: "idle", type: null, callId: null });
  };

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks?.()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks?.()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setVideoOff(!track.enabled);
  };

  const toggleSpeaker = () => {
    if (!remoteAudioRef.current) return;
    remoteAudioRef.current.muted = !speakerOff;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !speakerOff;
    }
    setSpeakerOff(prev => !prev);
  };

  const toggleScreenShare = async () => {
    if (!peerRef.current || callState.type !== "video") return;

    if (screenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }

      const camTrack = localStreamRef.current?.getVideoTracks?.()[0] || null;
      const sender = peerRef.current.getSenders().find(s => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(camTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setScreenSharing(false);
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerRef.current.getSenders().find(s => s.track?.kind === "video");

      if (sender) await sender.replaceTrack(screenTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

      screenTrack.onended = async () => {
        const camTrack = localStreamRef.current?.getVideoTracks?.()[0] || null;
        const videoSender = peerRef.current?.getSenders?.().find(s => s.track?.kind === "video");
        if (videoSender) await videoSender.replaceTrack(camTrack);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }

        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(t => t.stop());
          screenStreamRef.current = null;
        }

        setScreenSharing(false);
      };

      setScreenSharing(true);
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        setError("Screen share failed");
      }
    }
  };

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (callState.status === "idle") return null;

  const isVideo = callState.type === "video";
  const isIncoming = callState.status === "ringing";
  const showRemoteVideo = isVideo && callState.status === "connected" && hasRemoteVideo;

  return (
    <div ref={modalRef} className="fixed inset-0 z-[200] bg-slate-900 flex flex-col">
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2">✕</button>
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Remote video always mounted so ref never null */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover bg-black ${
          showRemoteVideo ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="relative z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md rounded-2xl px-4 py-2">
          <div
            className={`w-2 h-2 rounded-full ${
              callState.status === "connected"
                ? "bg-emerald-400 animate-pulse"
                : "bg-amber-400 animate-pulse"
            }`}
          />
          <span className="text-white font-bold text-sm">
            {callState.status === "calling" && "Calling..."}
            {callState.status === "ringing" && "Incoming..."}
            {callState.status === "connected" && formatDuration(callDuration)}
          </span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 bg-black/30 backdrop-blur-md rounded-xl text-white hover:bg-black/50 transition-all"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {!showRemoteVideo && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          <div className="relative">
            {otherUser?.avatar ? (
              <img
                src={otherUser.avatar}
                alt=""
                className={`rounded-full object-cover ring-4 ring-white/20 shadow-2xl ${
                  isIncoming ? "w-36 h-36 animate-pulse" : "w-32 h-32"
                }`}
              />
            ) : (
              <div
                className={`bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-black ring-4 ring-white/20 shadow-2xl ${
                  isIncoming ? "w-36 h-36 text-6xl animate-pulse" : "w-32 h-32 text-5xl"
                }`}
              >
                {otherUser?.name?.[0]?.toUpperCase()}
              </div>
            )}
            {isIncoming && (
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
            )}
          </div>

          <h2 className="text-3xl font-black text-white mt-6">{otherUser?.name}</h2>
          <p className="text-white/70 mt-2">{isVideo ? "Video Call" : "Voice Call"}</p>

          {callState.status === "connected" && !hasRemoteVideo && (
            <p className="text-amber-300 mt-3 text-sm">
              Connected, waiting for remote video...
            </p>
          )}

          {isReconnecting && (
            <div className="mt-4 flex items-center gap-2 text-amber-400">
              <RefreshCw className="animate-spin" size={20} />
              <span>Reconnecting...</span>
            </div>
          )}
        </div>
      )}

      {isVideo && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-16 right-4 w-40 h-52 rounded-2xl object-cover border-2 border-white/30 z-20 bg-black"
          style={{ transform: "scaleX(-1)" }}
        />
      )}

      <div className="relative z-10 p-6 flex justify-center gap-4">
        {isIncoming ? (
          <>
            <button
              onClick={rejectCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/50 transition-all hover:scale-110"
            >
              <PhoneOff size={24} />
            </button>
            <button
              onClick={acceptCall}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/50 transition-all hover:scale-110 animate-pulse"
            >
              {isVideo ? <Video size={24} /> : <Phone size={24} />}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                muted ? "bg-red-500" : "bg-white/10 border border-white/20"
              } text-white`}
            >
              {muted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {isVideo && (
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                  videoOff ? "bg-red-500" : "bg-white/10 border border-white/20"
                } text-white`}
              >
                {videoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            )}

            <button
              onClick={toggleScreenShare}
              disabled={!isVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                screenSharing ? "bg-blue-500" : "bg-white/10 border border-white/20"
              } text-white ${!isVideo ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {screenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
            </button>

            <button
              onClick={toggleSpeaker}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                speakerOff ? "bg-red-500" : "bg-white/10 border border-white/20"
              } text-white`}
            >
              {speakerOff ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/50 transition-all hover:scale-110"
            >
              <PhoneOff size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
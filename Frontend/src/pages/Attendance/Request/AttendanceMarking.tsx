import { useState, useRef, useCallback, useEffect } from 'react';
import { message, Progress } from 'antd';
import {
  CameraOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  SoundOutlined,
  AudioMutedOutlined
} from '@ant-design/icons';
import Webcam from 'react-webcam';
import attendanceServiceInstance from 'service/Attendance/Service.attendance';



const AttendanceMarking = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<'check-in' | 'check-out'>('check-in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'idle' | 'counting' | 'capturing' | 'success' | 'error'>('idle');
  const [maxAttempts] = useState(3);
  const [isVoiceEnabled] = useState(true);
  const webcamRef = useRef<Webcam>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: 'user',
    aspectRatio: 1
  };

  // Initialize speech synthesis
  useEffect(() => {
    speechSynthRef.current = window.speechSynthesis;

    // Cleanup: cancel any ongoing speech when component unmounts
    return () => {
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  // Voice feedback function
  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled || !speechSynthRef.current) return;

    // Cancel any ongoing speech
    speechSynthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Get available voices and prefer female voices for better user experience
    const voices = speechSynthRef.current.getVoices();
    const femaleVoice = voices.find(voice =>
      voice.name.includes('Female') ||
      voice.name.includes('Karen') ||
      voice.name.includes('Samantha')
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    speechSynthRef.current.speak(utterance);
  }, [isVoiceEnabled]);

  // Toggle voice feature


  // Auto start when modal opens
  useEffect(() => {
    if (isModalOpen && status === 'idle') {
      startAutoCapture();
    }
  }, [isModalOpen, status]);

  // Countdown effect with voice feedback
  useEffect(() => {
    if (countdown > 0) {
      // Voice countdown for last 3 seconds
      if (countdown <= 3 && status === 'counting') {
        speak(countdown.toString());
      }

      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && status === 'counting') {
      handleAutoCapture();
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [countdown, status, speak]);

  // Start auto capture process with voice
  const startAutoCapture = useCallback(() => {
    if (attempts >= maxAttempts) {
      setStatus('error');
      return;
    }

    setStatus('counting');
    setCountdown(5);

    // Voice guidance
    if (attempts === 0) {
      speak(`Please position your face in the frame. Capturing in 5 seconds`);
    } else {
      speak(`Attempt ${attempts + 1}. Please position your face. Capturing in 5 seconds`);
    }
  }, [attempts, maxAttempts, speak]);

  // Handle auto capture
  const handleAutoCapture = useCallback(async () => {
    if (attempts >= maxAttempts) {
      setStatus('error');
      return;
    }

    setStatus('capturing');
    speak('Capturing image now');

    const imageSrc = webcamRef.current?.getScreenshot();

    if (!imageSrc) {
      handleCaptureError();
      return;
    }

    await handleAutoSubmit(imageSrc);
  }, [action, attempts, maxAttempts, speak]);

  // Auto submit attendance with attempt tracking
  const handleAutoSubmit = useCallback(async (imageSrc: string) => {
    try {
      setIsSubmitting(true);
      speak('Processing face recognition');

      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      formData.append('action', action);
      formData.append('file', blob, 'face.jpg');

      const success = await attendanceServiceInstance.markAttendance(formData);

      if (success) {
        setStatus('success');
        setAttempts(0);

        // Success voice message
        const successMessage = action === 'check-in'
          ? 'Check in successful! Welcome to work'
          : 'Check out successful! Have a great day';
        speak(successMessage);

        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } else {
        throw new Error('Attendance marking failed');
      }
    } catch (error: any) {
      console.error('Attendance error:', error);
      handleCaptureError();
    } finally {
      setIsSubmitting(false);
    }
  }, [action, speak]);

  // Enhanced error handling with voice feedback
  const handleCaptureError = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= maxAttempts) {
      setStatus('error');
      const errorMessage = `Maximum attempts reached. Please contact HR`;
      speak(errorMessage);
      message.error(errorMessage);
    } else {
      setStatus('counting');
      setCountdown(5);
      const warningMessage = `Attempt ${newAttempts} failed. ${maxAttempts - newAttempts} attempts remaining`;
      speak(warningMessage);
      message.warning(warningMessage);
    }
  }, [attempts, maxAttempts, speak]);

  const handleActionClick = useCallback((selectedAction: 'check-in' | 'check-out') => {
    setAction(selectedAction);
    setAttempts(0);
    setIsModalOpen(true);

    // Voice confirmation
    const actionMessage = selectedAction === 'check-in'
      ? 'Starting check in process'
      : 'Starting check out process';
    speak(actionMessage);
  }, [speak]);

  // Close modal and reset everything
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    setCountdown(0);
    setAttempts(0);
    setStatus('idle');

    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
      countdownRef.current = null;
    }

    // Cancel any ongoing speech
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
  }, []);

  // Manual retry for error state
  const handleRetry = useCallback(() => {
    setAttempts(0);
    speak('Restarting face recognition');
    startAutoCapture();
  }, [startAutoCapture, speak]);

  // Responsive video constraints
  const getVideoConstraints = () => {
    if (window.innerWidth < 768) {
      return {
        width: 480,
        height: 480,
        facingMode: 'user',
        aspectRatio: 1
      };
    } else if (window.innerWidth < 1024) {
      return {
        width: 600,
        height: 600,
        facingMode: 'user',
        aspectRatio: 1
      };
    } else {
      return videoConstraints;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-3 sm:px-4 lg:px-6">
      {/* Voice Control Button - REMOVED FROM HEADER */}

      {/* Enhanced Responsive Header */}
      <div className="max-w-6xl mx-auto mb-4 sm:mb-6 lg:mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div
                className="rounded-xl flex items-center justify-center shadow-sm"
                style={{
                  width: 120,
                  height: 120,
                  background: 'linear-gradient(135deg, #30383fff 0%, #97c8f1ff 100%)',
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                }}
              >
                <img
                  src="/bayanatlogo.png"
                  alt="Company Logo"
                  style={{ width: 120, height: 120, objectFit: 'contain', padding: 6 }}
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Attendance System
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                  Automated face recognition with voice guidance
                </p>
              </div>
            </div>

            {/* Date and Time Cards - Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 sm:p-3 rounded-xl shadow-lg flex-1 sm:flex-none sm:min-w-[140px]">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                  <CalendarOutlined className="text-blue-200 text-xs sm:text-sm" />
                  <span className="text-blue-200 text-xs font-medium">Today</span>
                </div>
                <p className="text-sm font-semibold truncate">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 sm:p-3 rounded-xl shadow-lg flex-1 sm:flex-none sm:min-w-[140px]">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                  <ClockCircleOutlined className="text-green-200 text-xs sm:text-sm" />
                  <span className="text-green-200 text-xs font-medium">Time</span>
                </div>
                <p className="text-sm font-semibold">
                  {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Actions Section */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Action Buttons - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
              {/* Check In Button */}
              <button
                onClick={() => handleActionClick('check-in')}
                className="group relative bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 sm:p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-green-400 active:scale-95"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-2 sm:mb-3 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <ArrowRightOutlined className="text-white text-lg sm:text-xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 text-center">Check In</h3>
                  <p className="text-green-600 font-medium text-xs sm:text-sm text-center">Start your work day</p>
                  {isVoiceEnabled && (
                    <div className="flex items-center justify-center mt-2">
                      <SoundOutlined className="text-green-400 text-xs mr-1" />
                      <span className="text-green-500 text-xs">Voice Guide</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Check Out Button */}
              <button
                onClick={() => handleActionClick('check-out')}
                className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-blue-400 active:scale-95"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-2 sm:mb-3 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <ArrowLeftOutlined className="text-white text-lg sm:text-xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 text-center">Check Out</h3>
                  <p className="text-blue-600 font-medium text-xs sm:text-sm text-center">End your work day</p>
                  {isVoiceEnabled && (
                    <div className="flex items-center justify-center mt-2">
                      <SoundOutlined className="text-blue-400 text-xs mr-1" />
                      <span className="text-blue-500 text-xs">Voice Guide</span>
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* Enhanced Features Grid with Voice Indicator */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 sm:p-3 text-center border border-purple-100">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <CameraOutlined className="text-white text-xs" />
                </div>
                <h4 className="font-semibold text-gray-800 text-xs mb-1">Auto Capture</h4>
                <p className="text-gray-600 text-xs">5s countdown</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-2 sm:p-3 text-center border border-orange-100">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <UserOutlined className="text-white text-xs" />
                </div>
                <h4 className="font-semibold text-gray-800 text-xs mb-1">Smart Retry</h4>
                <p className="text-gray-600 text-xs">{maxAttempts} attempts</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-2 sm:p-3 text-center border border-cyan-100">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <span className="text-white font-bold text-xs">⚡</span>
                </div>
                <h4 className="font-semibold text-gray-800 text-xs mb-1">Fast Process</h4>
                <p className="text-gray-600 text-xs">Quick verification</p>
              </div>

              <div className={`rounded-lg p-2 sm:p-3 text-center border ${isVoiceEnabled
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
                : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-100'
                }`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 ${isVoiceEnabled
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                  {isVoiceEnabled ? (
                    <SoundOutlined className="text-white text-xs" />
                  ) : (
                    <AudioMutedOutlined className="text-white text-xs" />
                  )}
                </div>
                <h4 className="font-semibold text-gray-800 text-xs mb-1">Voice Guide</h4>
                <p className={`text-xs ${isVoiceEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {isVoiceEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>

            {/* Quick Tips - Responsive */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200">
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-1 sm:gap-2 text-center">
                <div className="text-xs text-amber-700 flex items-center justify-center">
                  <span className="w-1 h-1 bg-amber-500 rounded-full mr-2"></span>
                  Good lighting
                </div>
                <div className="text-xs text-amber-700 flex items-center justify-center">
                  <span className="w-1 h-1 bg-amber-500 rounded-full mr-2"></span>
                  Face camera
                </div>
                <div className="text-xs text-amber-700 flex items-center justify-center">
                  <span className="w-1 h-1 bg-amber-500 rounded-full mr-2"></span>
                  No accessories
                </div>
                <div className="text-xs text-amber-700 flex items-center justify-center">
                  <span className="w-1 h-1 bg-amber-500 rounded-full mr-2"></span>
                  Stay in frame
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal with Voice Status */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl mx-2 sm:mx-4 overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
            {/* Header with Voice Indicator */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-3 sm:py-4 px-4 sm:px-6 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                  <CameraOutlined className="mr-2 text-lg sm:text-xl" />
                  {action === 'check-in' ? 'Check In' : 'Check Out'} - Face Recognition
                </h3>
                {attempts > 0 && (
                  <span className="px-2 py-1 bg-blue-500/30 rounded-full text-blue-200 text-xs">
                    Attempt {attempts}/{maxAttempts}
                  </span>
                )}
                {isVoiceEnabled && (
                  <span className="px-2 py-1 bg-green-500/30 rounded-full text-green-200 text-xs flex items-center">
                    <SoundOutlined className="mr-1 text-xs" />
                    Voice On
                  </span>
                )}
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-white/10 flex-shrink-0"
                disabled={isSubmitting}
              >
                <CloseOutlined className="text-base sm:text-lg" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {status === 'error' ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <ExclamationCircleOutlined className="text-red-500 text-2xl sm:text-3xl" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Verification Failed</h4>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                    Unable to verify after {maxAttempts} attempts.
                  </p>
                  <p className="text-gray-500 mb-4 sm:mb-6 text-xs sm:text-sm">
                    Please ensure good lighting and clear face visibility, or contact HR.
                  </p>
                  <button
                    onClick={handleRetry}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-6 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Try Again
                  </button>
                </div>
              ) : status === 'success' ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <CheckCircleOutlined className="text-green-500 text-2xl sm:text-3xl" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                    {action === 'check-in' ? 'Checked In!' : 'Checked Out!'}
                  </h4>
                  <p className="text-gray-600 mb-2 text-sm sm:text-base">
                    Your attendance has been recorded successfully.
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                  <div className="mt-4 sm:mt-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {/* Camera Container - Responsive */}
                  <div className="relative rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200"
                    style={{
                      height: window.innerWidth < 640 ? '300px' :
                        window.innerWidth < 1024 ? '400px' : '380px'
                    }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={getVideoConstraints()}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover'
                      }}
                      screenshotQuality={0.92}
                      mirrored
                    />

                    {/* Face Guide - Responsive */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-40 h-52 sm:w-48 sm:h-60 lg:w-56 lg:h-72 border-4 border-white/80 rounded-2xl flex items-center justify-center">
                        <div className="w-32 sm:w-40 lg:w-48 h-12 sm:h-14 lg:h-16 border-t-2 border-dashed border-white/60"></div>
                      </div>
                    </div>

                    {/* Countdown Overlay */}
                    {status === 'counting' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/95 rounded-full flex items-center justify-center mb-2 sm:mb-3 mx-auto shadow-lg">
                            <span className="text-2xl sm:text-3xl font-bold text-gray-800">{countdown}</span>
                          </div>
                          <p className="text-white font-medium text-sm sm:text-base">
                            Auto capture in {countdown}s
                          </p>
                          {isVoiceEnabled && countdown <= 3 && (
                            <p className="text-white/80 text-xs mt-1">Voice countdown active</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {status === 'counting' && (
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                        <Progress
                          percent={((5 - countdown) / 5) * 100}
                          showInfo={false}
                          strokeColor={{
                            '0%': '#10b981',
                            '50%': '#3b82f6',
                            '100%': '#8b5cf6',
                          }}
                          trailColor="rgba(255,255,255,0.3)"
                          strokeWidth={3}
                        />
                      </div>
                    )}

                    {/* Processing Overlay */}
                    {status === 'capturing' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                          <p className="text-white font-medium text-sm sm:text-base">Processing face recognition...</p>
                          <p className="text-white/80 text-xs sm:text-sm mt-1">Attempt {attempts + 1}/{maxAttempts}</p>
                          {isVoiceEnabled && (
                            <p className="text-white/60 text-xs mt-2">Voice guidance active</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Instructions with Voice Status */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center shadow mt-0.5">
                        <span className="text-white font-bold text-xs">i</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-blue-800 font-medium text-xs">Automated Face Recognition</p>
                          {isVoiceEnabled && (
                            <div className="flex items-center text-green-600">
                              <SoundOutlined className="text-xs mr-1" />
                              <span className="text-xs font-medium">Voice On</span>
                            </div>
                          )}
                        </div>
                        <p className="text-blue-700 text-xs leading-relaxed">
                          {status === 'counting'
                            ? `Auto capture in ${countdown} seconds. Keep your face centered and maintain position.`
                            : 'Position your face within the frame and wait for automatic capture.'
                          }
                        </p>
                        {attempts > 0 && (
                          <p className="text-blue-600 text-xs mt-1 font-medium">
                            Remaining attempts: {maxAttempts - attempts}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceMarking;
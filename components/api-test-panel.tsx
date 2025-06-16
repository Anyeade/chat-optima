import React, { useState } from 'react';

export const APITestPanel: React.FC = () => {
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [testResults, setTestResults] = useState<{
    voiceRSS?: { success: boolean; url?: string; error?: string };
    jamendo?: { success: boolean; url?: string; error?: string };
  }>({});

  const testVoiceRSSAPI = async () => {
    try {
      setLoadingStatus("Testing VoiceRSS API...");
      const testScript = "This is a test of the VoiceRSS API. If you can hear this, the API is working correctly.";
      
      const response = await fetch('/api/video-generator/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          script: testScript,
          voiceSettings: {
            language: 'en-us',
            voice: 'Linda',
            speed: 0
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`VoiceRSS API test failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("VoiceRSS API test successful:", data);
      
      setTestResults(prev => ({
        ...prev,
        voiceRSS: { success: true, url: data.voiceUrl }
      }));
      
      setLoadingStatus("VoiceRSS API test completed");
      return data.voiceUrl;
    } catch (error) {
      console.error("VoiceRSS API test failed:", error);
      setTestResults(prev => ({
        ...prev,
        voiceRSS: { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }));
      setLoadingStatus("VoiceRSS API test failed");
      throw error;
    }
  };

  const testJamendoAPI = async () => {
    try {
      setLoadingStatus("Testing Jamendo API...");
      const response = await fetch('/api/video-generator/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mood: 'uplifting',
          duration: 30,
          volume: 40
        })
      });
      
      if (!response.ok) {
        throw new Error(`Jamendo API test failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Jamendo API test successful:", data);
      
      setTestResults(prev => ({
        ...prev,
        jamendo: { success: true, url: data.musicUrl }
      }));
      
      setLoadingStatus("Jamendo API test completed");
      return data.musicUrl;
    } catch (error) {
      console.error("Jamendo API test failed:", error);
      setTestResults(prev => ({
        ...prev,
        jamendo: { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }));
      setLoadingStatus("Jamendo API test failed");
      throw error;
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">API Test Panel</h2>
      
      <div className="space-y-4">
        {/* VoiceRSS Test */}
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">VoiceRSS API Test</h3>
          <button
            onClick={testVoiceRSSAPI}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test VoiceRSS
          </button>
          {testResults.voiceRSS && (
            <div className="mt-2">
              {testResults.voiceRSS.success ? (
                <div className="text-green-600">
                  <p>✓ Test successful</p>
                  {testResults.voiceRSS.url && (
                    <audio controls className="mt-2">
                      <source src={testResults.voiceRSS.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <p>✗ Test failed: {testResults.voiceRSS.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Jamendo Test */}
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Jamendo API Test</h3>
          <button
            onClick={testJamendoAPI}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Jamendo
          </button>
          {testResults.jamendo && (
            <div className="mt-2">
              {testResults.jamendo.success ? (
                <div className="text-green-600">
                  <p>✓ Test successful</p>
                  {testResults.jamendo.url && (
                    <audio controls className="mt-2">
                      <source src={testResults.jamendo.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <p>✗ Test failed: {testResults.jamendo.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {loadingStatus && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p className="text-gray-700">{loadingStatus}</p>
        </div>
      )}
    </div>
  );
}; 
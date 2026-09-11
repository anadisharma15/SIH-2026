// =============================================
// Vaani AI — Backend API Service
// =============================================
// 
// TODO: Update BASE_URL once your backend is deployed.
// All API calls go through this file.
// =============================================


const BASE_URL = "http://127.0.0.1:8000/api";


// ---- AUDIO UPLOAD & DETECTION ----

/**
 * Upload an audio file for AI vs Human classification.
 *
 * @param {File} audioFile - The audio file (MP3, WAV, FLAC)
 * @returns {Promise<Object>} - Detection result with confidence scores
 */
export async function analyzeAudio(audioFile) {

    const formData = new FormData();
    formData.append("file", audioFile);

    const response = await fetch(
        `${BASE_URL}/analyze`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Audio analysis failed");
    }

    return response.json();
}


// ---- LIVE DETECTION (WebSocket) ----

/**
 * Open a WebSocket connection for live voice detection.
 *
 * @param {Function} onMessage - Callback for each prediction frame
 * @param {Function} onError   - Callback for errors
 * @returns {{ socket: WebSocket, close: Function }}
 */
export function connectLiveDetection(onMessage, onError) {

    const wsUrl = BASE_URL
        .replace("http", "ws")
        .replace("/api", "/ws/live-detect");

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
    };

    socket.onerror = (error) => {
        if (onError) onError(error);
    };

    return {
        socket,
        close: () => socket.close(),
    };
}


// ---- RECENT ANALYSES ----

/**
 * Fetch the list of recent analyses for the current user.
 *
 * @returns {Promise<Array>} - Array of analysis history items
 */
export async function getRecentAnalyses() {

    const response = await fetch(
        `${BASE_URL}/analyses`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch analyses");
    }

    return response.json();
}


// ---- REPORT DOWNLOAD ----

/**
 * Download the PDF report for a completed analysis.
 *
 * @param  {string} analysisId - The analysis ID
 * @returns {Promise<Blob>}    - PDF blob
 */
export async function downloadReport(analysisId) {

    const response = await fetch(
        `${BASE_URL}/report/${analysisId}`
    );

    if (!response.ok) {
        throw new Error("Report download failed");
    }

    return response.blob();
}

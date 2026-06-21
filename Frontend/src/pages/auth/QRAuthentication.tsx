import React, { useEffect, useState } from "react";
import QRService from "../../service/service.qr";

interface QRValidationResult {
    isValid: boolean;
    message: string;
    type?: string;
    timestamp?: string;
    invoiceAmount?: string;
}

const QRAuthentication: React.FC = () => {
    const [encryptedKey, setEncryptedKey] = useState<string>("");
    const [result, setResult] = useState<QRValidationResult | null>(null);
    const [error, setError] = useState<string>("");
    const [serviceStatus, setServiceStatus] = useState<boolean>(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const allParams = Array.from(params.keys());

        if (allParams.length > 0) {
            const firstParam = allParams[0];
            const paramValue = params.get(firstParam);
            if (paramValue === "" || paramValue === "true" || paramValue === null) {
                setEncryptedKey(firstParam);
            } else {
                setEncryptedKey(paramValue || firstParam);
            }
        }

        // Check service status
        QRService.checkStatus().then((status: { success: boolean; message: string } | null) => {
            setServiceStatus(!!(status && status.success));
        });
    }, []);

    const handleValidateQR = async () => {
        if (!encryptedKey.trim()) {
            setError("Please enter or provide an encrypted QR key");
            return;
        }

        setError("");
        setResult(null);

        try {
            const validationResult = await QRService.validateWithKey(encryptedKey);
            if (!validationResult) {
                setError('Failed to validate QR code');
                return;
            }
            setResult(validationResult as QRValidationResult);

            if (!validationResult.isValid) {
                setError(validationResult.message);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to validate QR code"
            );
        }
    };

    useEffect(() => {
        if (encryptedKey && !result) {
            handleValidateQR();
        }
    }, [encryptedKey]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6 font-sans">
            <div className="bg-slate-50 rounded-lg shadow-md max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="text-white bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold mb-1">QR Code Verification</h1>
                    <p className="text-sm opacity-90">Invoice & Payment Verification System</p>
                </div>

                {/* Service Status */}
                {!serviceStatus && !result && (
                    <div className="bg-yellow-100 text-yellow-900 border-l-4 border-yellow-300 p-3 rounded m-4">
                        ⚠️ Service connection is loading. Please wait...
                    </div>
                )}

                {/* Hidden input area — page auto-validates from URL */}
                <div aria-hidden />

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 text-red-900 border-l-4 border-red-300 p-3 rounded m-4">
                        <div className="font-semibold">Validation Failed</div>
                        <div className="mt-1 text-sm">{error}</div>
                    </div>
                )}

                {/* Success Result - show generic message and invoice amount only */}
                {result && result.isValid && (
                    <div className="p-4 bg-gray-50">
                        <div className="bg-slate-50 text-slate-800 border-l-4 border-emerald-400 p-3 rounded">
                            <div className="font-semibold">✅ QR is VALID</div>
                            <div className="mt-1 text-sm">This QR code has been verified successfully.</div>
                        </div>

                        <div className="bg-slate-50 rounded-md p-4 mt-3 border">
                            <h3 className="text-xs font-bold uppercase text-gray-600 mb-2">Invoice Summary</h3>

                            {result.invoiceAmount ? (
                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded mb-2">
                                    <div className="text-xs font-semibold text-gray-600 uppercase">Invoice Amount</div>
                                    <div className="text-base font-extrabold text-emerald-800">{result.invoiceAmount} OMR</div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center p-2 mb-2">
                                    <div className="text-xs font-semibold text-gray-600 uppercase">Invoice Amount</div>
                                    <div className="text-sm text-gray-500">Not available</div>
                                </div>
                            )}

                            {result.type && (
                                <div className="flex justify-between items-center p-2">
                                    <div className="text-xs font-semibold text-gray-600 uppercase">Type</div>
                                    <div className="text-sm text-gray-700">{result.type}</div>
                                </div>
                            )}

                            {result.timestamp && (
                                <div className="flex justify-between items-center p-2">
                                    <div className="text-xs font-semibold text-gray-600 uppercase">Verified At</div>
                                    <div className="text-sm text-gray-700">{new Date(result.timestamp).toLocaleString()}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="bg-gray-50 p-3 text-center text-xs text-gray-500">
                    © 2025 Bayanat Technology. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default QRAuthentication;

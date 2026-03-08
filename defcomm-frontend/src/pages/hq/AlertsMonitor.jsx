import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { getFlaggedMessages, resolveThreat } from "../../services/api";
import { decryptMessage } from "../../utils/encrypt";
import { analyzeThreat } from "../../utils/ai";

const FILTERS = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Resolved", value: "resolved" },
];

const AlertsMonitor = () => {
    const [messages, setMessages] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resolvingId, setResolvingId] = useState(null);

    const [analyzingIds, setAnalyzingIds] = useState(new Set());

    useEffect(() => {
        loadMessages();
    }, [filter]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await getFlaggedMessages(filter);

            // Step 1: Decrypt synchronously and show messages immediately
            const decrypted = data.map((msg) => ({
                ...msg,
                decrypted: decryptMessage(msg.encryptedText),
                isThreat: msg.securityStatus === "resolved", // treat resolved as already confirmed
                analyzing: msg.securityStatus !== "resolved",
            }));

            // Show messages right away — no waiting for AI
            setMessages(decrypted);
            setLoading(false);
            setError(null);

            // Step 2: Run AI analysis per-message in the background
            const threatKeywords = /attack|perimeter|breach|security|urgent|critical|hostile|engage|destroy|intercept/i;
            const pendingIds = new Set(decrypted.filter(m => m.analyzing).map(m => m.id));
            setAnalyzingIds(pendingIds);

            await Promise.all(
                decrypted
                    .filter((msg) => msg.analyzing)
                    .map(async (msg) => {
                        let isThreat = false;
                        if (threatKeywords.test(msg.decrypted)) {
                            isThreat = await analyzeThreat(msg.decrypted);
                        }
                        // Update this single message in state
                        setMessages((prev) =>
                            prev
                                .map((m) => m.id === msg.id ? { ...m, isThreat, analyzing: false } : m)
                                .filter((m) => m.isThreat || m.securityStatus === "resolved" || m.analyzing)
                        );
                        setAnalyzingIds((prev) => {
                            const next = new Set(prev);
                            next.delete(msg.id);
                            return next;
                        });
                    })
            );
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load flagged messages");
            setLoading(false);
        }
    };

    const handleResolve = async (messageId) => {
        try {
            setResolvingId(messageId);
            await resolveThreat(messageId);
            await loadMessages();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to resolve threat");
        } finally {
            setResolvingId(null);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return !isNaN(date.getTime())
            ? date.toLocaleString()
            : "--/--/----, --:--:--";
    };

    const activeCount = messages.filter(
        (m) => m.isThreat && m.securityStatus !== "resolved"
    ).length;
    const resolvedCount = messages.filter(
        (m) => m.securityStatus === "resolved"
    ).length;

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-black tracking-tight">
                            Alerts Monitor
                        </h1>
                        <p className="text-gray-500 mt-1">
                            AI-Verified Threat Detection & Resolution
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {activeCount}
                            </div>
                            <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                                Active
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {resolvedCount}
                            </div>
                            <div className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
                                Resolved
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-fit">
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${filter === f.value
                                ? "bg-[#014BAA] text-white shadow-md"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-sm">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-[#014BAA] font-semibold">
                            Analyzing messages...
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                        <div className="text-gray-400 text-lg font-medium">
                            No messages found for this filter.
                        </div>
                        <p className="text-gray-300 text-sm mt-2">
                            Try changing the filter or check back later.
                        </p>
                    </div>
                ) : (
                    /* Message List */
                    <div className="space-y-3">
                        {messages.map((msg) => {
                            const isResolved = msg.securityStatus === "resolved";
                            const isAnalyzing = msg.analyzing;
                            const isActive = msg.isThreat && !isResolved && !isAnalyzing;

                            return (
                                <div
                                    key={msg.id}
                                    className={`bg-white rounded-lg border shadow-sm p-5 transition-all hover:shadow-md ${isAnalyzing
                                            ? "border-gray-200 opacity-70"
                                            : isActive
                                                ? "border-red-300 border-l-4 border-l-red-500"
                                                : isResolved
                                                    ? "border-green-200 border-l-4 border-l-green-500"
                                                    : "border-gray-200"
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        {/* Left: Message Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {/* Avatar */}
                                                <div
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isActive
                                                        ? "bg-red-100 text-red-700"
                                                        : isResolved
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-600"
                                                        }`}
                                                >
                                                    {msg.senderName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-sm text-gray-900">
                                                        {msg.senderName}
                                                    </span>
                                                    <span className="text-gray-400 mx-2">•</span>
                                                    <span className="text-sm text-[#014BAA] font-medium">
                                                        {msg.groupName}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Message Content */}
                                            <div className="bg-gray-50 rounded-md px-4 py-3 mb-3 border border-gray-100">
                                                <p className="text-sm text-gray-800 leading-relaxed break-words">
                                                    {msg.decrypted}
                                                </p>
                                            </div>

                                            {/* Metadata Row */}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-xs text-gray-400 font-mono">
                                                    {formatTimestamp(msg.timestamp)}
                                                </span>
                                                <span className="text-xs text-gray-300">|</span>
                                                <span className="text-xs text-gray-400">
                                                    Message #{msg.id}
                                                </span>

                                                {isAnalyzing && (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-full">
                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></span>
                                                        Analyzing...
                                                    </span>
                                                )}

                                                {isActive && (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full">
                                                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                                                        AI Verified Threat
                                                    </span>
                                                )}

                                                {isResolved && (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full">
                                                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                                        Resolved
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Resolve Button */}
                                        {isActive && (
                                            <button
                                                onClick={() => handleResolve(msg.id)}
                                                disabled={resolvingId === msg.id}
                                                className="shrink-0 px-4 py-2 bg-[#014BAA] text-white text-xs font-bold uppercase rounded-md hover:bg-[#013B8A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                            >
                                                {resolvingId === msg.id ? "Resolving..." : "Resolve →"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AlertsMonitor;

"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể tải file");
      }

      // Kiểm tra content-type từ response
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      // Lấy tên file từ Content-Disposition header nếu có
      const contentDisposition = response.headers.get("Content-Disposition");
      console.log("contentDisposition>>>", contentDisposition);
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
      console.log("filenameMatch>>>", filenameMatch);
      let fileName = "";
      if (filenameMatch) {
        fileName = decodeURIComponent(filenameMatch[1]); // Giải mã URL-encoded characters
        console.log("Tên file:", fileName);
      } else {
        fileName = "audio.mp3";
        console.log("Không tìm thấy tên file trong header");
      }

      a.download = fileName.replace(/\.webm$/, ".mp3");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setUrl(""); // Reset input sau khi tải thành công
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>YouTube MP3 Downloader By TP</h1>
        <h1>Nextjs+Expressjs</h1>
        <form onSubmit={handleDownload}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Nhập URL YouTube (ví dụ: https://www.youtube.com/watch?v=...)"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Đang tải..." : "Tải MP3"}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </main>
  );
}

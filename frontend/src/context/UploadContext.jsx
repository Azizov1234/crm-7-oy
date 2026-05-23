import React, { createContext, useContext, useState } from 'react';
import { uploadApi } from '../api/axios';

const UploadContext = createContext();

export function UploadProvider({ children }) {
  const [uploads, setUploads] = useState(() => {
    try {
      const saved = localStorage.getItem('active_uploads');
      if (!saved) return [];
      const parsed = JSON.parse(saved);

      return parsed.map((u) =>
        u.status === 'uploading'
          ? { ...u, status: 'error', error: "Yuklash to'xtatildi (sahifa yangilandi)" }
          : u,
      );
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('active_uploads', JSON.stringify(uploads));
  }, [uploads]);

  const startUpload = async (
    url,
    formData,
    metadata,
    method = 'post',
    onComplete = null,
  ) => {
    const uploadId = Date.now() + Math.random().toString(36).slice(2, 11);

    setUploads((prev) => [
      ...prev,
      {
        id: uploadId,
        progress: 0,
        buffer: 10,
        metadata,
        status: 'uploading',
      },
    ]);

    try {
      const axiosConfig = {
        _isUpload: true,
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? {
                    ...u,
                    progress: percentCompleted,
                    buffer: Math.min(percentCompleted + 10, 100),
                  }
                : u,
            ),
          );
        },
      };

      const response =
        method.toLowerCase() === 'put'
          ? await uploadApi.put(url, formData, axiosConfig)
          : await uploadApi.post(url, formData, axiosConfig);

      setUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId ? { ...u, status: 'completed', progress: 100 } : u,
        ),
      );

      if (onComplete) {
        onComplete(response.data);
      }

      setTimeout(() => {
        setUploads((prev) => prev.filter((u) => u.id !== uploadId));
      }, 10_000);

      return response.data;
    } catch (error) {
      console.error('Upload failed:', error);
      setUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId
            ? {
                ...u,
                status: 'error',
                error: error.response?.data?.message || error.message,
              }
            : u,
        ),
      );
      return { error };
    }
  };

  return (
    <UploadContext.Provider value={{ uploads, setUploads, startUpload }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUploads() {
  return useContext(UploadContext);
}

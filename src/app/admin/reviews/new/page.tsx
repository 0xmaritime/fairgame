'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import ReviewForm from '@/components/ReviewForm';

export default function NewReviewPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem('adminAuthenticated');
    if (storedAuth === 'true') {
      setAuthenticated(true);
    }
    setLoadingAuth(false);
  }, []);

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!authenticated) {
    router.push('/admin'); // Redirect to login if not authenticated
    return null;
  }

  return (
    <AdminLayout>
      <ReviewForm />
    </AdminLayout>
  );
}

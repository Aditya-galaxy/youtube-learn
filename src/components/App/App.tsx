"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Hero from '@/components/Hero';
import VideoModal from '@/components/VideoModal';
import { ThemeProvider } from '../ThemeProvider';

export default function App() {

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Sidebar />
      <Hero/>
      <VideoModal/>
    </div>
  );
}
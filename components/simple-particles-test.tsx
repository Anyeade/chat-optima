'use client';

import { useEffect } from 'react';

export default function SimpleParticlesTest() {
  useEffect(() => {
    const initParticles = () => {
      console.log('Checking for Particles...', typeof window !== 'undefined' ? window.Particles : 'undefined');
      
      if (typeof window !== 'undefined' && window.Particles) {

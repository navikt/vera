import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react';
import connectDB from '../lib/db';

function MyApp({ Component, pageProps }: AppProps) {
    useEffect(() => {
        connectDB();
        }, []);
  return <Component {...pageProps} />
}

export default MyApp

import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { DarkModeProvider } from '../lib/DarkModeContext';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Ocelot Admin Portal</title>
        <meta name="description" content="API Gateway Control Center" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>
      <DarkModeProvider>
        <Component {...pageProps} />
      </DarkModeProvider>
    </>
  );
}

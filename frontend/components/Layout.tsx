import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <>
      <div className="bg-animation"></div>
      <div className="container">
        <Sidebar />
        <main className="main-content">
          <Header title={title} subtitle={subtitle} />
          {children}
        </main>
      </div>
    </>
  );
}

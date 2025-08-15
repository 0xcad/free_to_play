import React, { useState,  useEffect, useCallback } from 'react';
import { Outlet  } from "react-router";

export default function MainLayout() {
  return (
    <>
    <div className="app-content flex-column">
      <header>
        <p>Free to Play</p>
      </header>
      <main className="p-3">
        <Outlet />
      </main>

      <div className="flex-grow align-end">
        <footer className="p-3 text-center">
          <p className="my-0">© 2025 Free to Play</p>
        </footer>
      </div>
      </div>
    </>
  );
};

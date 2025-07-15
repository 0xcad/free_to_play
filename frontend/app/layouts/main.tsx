import React, { useState,  useEffect, useCallback } from 'react';
import { Outlet  } from "react-router";

export default function MainLayout() {
  return (
    <>
      <main>
        <Outlet />
      </main>

      <div className="flex-grow">
        <footer>
          <p>© 2025 Free to Play</p>
        </footer>
      </div>
    </>
  );
};

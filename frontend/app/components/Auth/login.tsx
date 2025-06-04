import type { Route } from "./+types/login";
import React, { useState, useCallback } from 'react';
import useToggle from '~/hooks/useToggle';
import { useFormStatus } from "react-dom";

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';

import { Outlet } from "react-router";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Free to Play | Login" },
    { name: "description", content: "Free to Play Login" },
  ];
}


const Login: React.FC = () => {
  return (
    <Outlet />
  );
}

export default Login;

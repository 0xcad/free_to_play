import type { Route } from "./+types/tutorial";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Tutorial() {
  return (
    <p>tutorial</p>
  );
}

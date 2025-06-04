import type { Route } from "./+types/program";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Program() {
  return (
    <p>program</p>
  );
}

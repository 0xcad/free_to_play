import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

import routes from './constants/routes';


export default [
  index("./routes/home.tsx"),

  // auth
  //route(routes.login.link, "./components/Auth/login.tsx", [
  route("auth", "./components/Auth/login.tsx", [
    index("./components/Auth/verify.tsx"),
    route("login", "./components/Auth/form.tsx"),
    route("success", "./components/Auth/success.tsx"),
  ]),


  // shows game layout
  layout("./layouts/game.tsx", [
    // TODO: accounts
    //route("account/edit?", "./accounts/index.tsx");
    route("account", "./components/Account/index.tsx"),

    // TODO: store
    // index,
    // do we need individual item view? (id based/slug)

    route("program", "./components/Pages/program.tsx"),
    route("tutorial", "./components/Pages/tutorial.tsx"),

    route("stage", "./components/Stage/index.tsx"),
  ]),


] satisfies RouteConfig;


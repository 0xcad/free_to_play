import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

import routes from './constants/routes';

//import { RequireAuth, RequireJoin } from './layouts/guard';


export default [

  route("admin", "./components/Admin/index.tsx"),

  layout('./layouts/main.tsx', [
    // auth
    route("auth", "./components/Auth/login.tsx", [
      index("./components/Auth/verify.tsx"),
      route("join", "./components/Auth/join.tsx"),
      //route("login", "./components/Auth/form.tsx"),
      route("login-email", "./components/Auth/LoginEmail.tsx"),
    ]),
    index("./routes/home.tsx"),
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
    route("store", "./components/Store/index.tsx"),
  ]),


] satisfies RouteConfig;


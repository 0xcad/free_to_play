const routes = {
  /* Unprotected routes-------------------------- */
  home: {
    link: '/',
  },

  join: {
    link: '/auth/join',
  }, // if you're joined, redirect to stage

  loginEmail: {
    link: '/auth/login-email',
  }, // if you have no user, redirect to join

  verify: {
    link: '/auth',
  }, // if you're joined, redirect to stage

  program: {
    link: '/program',
  },
  tutorial: {
    link: '/tutorial',
  },
  //^end group

  /* Users here must be authenticated and joined */
  stage: {
    link: '/stage',
  },
  //^end group

  /* only admins here */
  admin: {
    link: '/admin',
  },
};

export default routes;

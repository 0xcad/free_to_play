# Free to Play (or Pay What You Will)

*Free to Play* was an interactive theatre performance that publicly premiered September 20th, 2025. Audience members could affect the direction of a live play via an interactive game, microtransactions, and chat and video features. This repo contains the codebase for the website.

*Free to Play* is funded in part, and generously by, the The Frank-Ratchye STUDIO for Creative Inquiry [CS+X grant](https://studioforcreativeinquiry.org/csx-grant)

## Website Features

* log in with Google SSO or get a one-time email link and join the play with a unique code
* send and receive chat messages with other audience members
* play a typing game to increase the score for the collective audience. This affects the play's dialog.
* buy "gems" (in game currency) with real money, and use these to purchase items in the store
   * items either affect what the actors do on stage (i.e, triggering a Dream Ballet sequence, having them wear funny hats) or novelly affect user chat settings
   * ex: the PA system plays the chat messages of all users who purchase "Super Chat" via TTS
* play livestream content from the play
* an admin interface (one one the frontend, one via Django) that helps crew moderate chat and track purchases

## Tech Stack / "Tech Features"

* Frontend: React + Typescript, Vite
    * misc npm libraries: React Router (used as framework), motion (animations)
    * state, UI, and websocket components were created from scratch as a learning experience
* Backend: Django with Django Rest Framework, Django Channels, Daphne (ASGI)
* Database: Just regular SQLite3
* Cache (for websockets and db): Redis
* Payment processing: Stripe

The website was Dockerized, and hosted on a [CMU Computer Club](https://www.cmucc.org/) server with nginx and Cloudflare.

## Post Mortem Notes

The website held up well with over 50 users simultaneously connected and messaging each other. One audience member told me after the show that he worked in tech, tried to break the app, and it still held up. If I restarted this process today, however, or had more concerns about bad actors, I would make several changes.

### Libraries

I initiially avoided frontend state libraries like Redux, just thinking that it was unnecessary for a relatively small app. Later significant scope creep, however, made me wish I had started with something like this from the beginning. However I think I learned a lot in designing my state manager with React context. A websocket library may also have been useful as well, or a CSS framework (I maintain that I enjoy writing my own CSS, but after this project I understand why class-based CSS libraries are so popular).

### Security

Most actual security considerations would probably (*probably*) be handled by the backend, where permissions were enforced. But definitely more could have been done. Sign on links work even after being used once. I never expired jwt tokens when users signed out (using a more feature-rich jwt library would've been a good idea, actually). Rate limiting was enforced by the frontend and *maybe* Cloudflare's Free Plan, not the backend. And there's probably an api endpoint or two that leaks the current play's join code, protected only by security through obscurity.

For just the frontend, I never spent too much time trying to get `AdminRoute` routes set up properly. Currently I just listen for 401/403 errors from the backend, then redirect the user to either the log in page or a less privileged page. For my use case, this seemed fine.

### Testing, Linting

I didn't write any tests! Nothing! No frontend nor backend tests. There were several breaking changes I made in re-iteration (regression and unit tests would've helped here). My backend and frontend sometimes got out of sync in terms of what each one expected in responses (using something like RTK Query would've helped avoid this, tests would've helped detect this). The night of the first performance I was also terrified the program would break with so many users. It scaled fine, but tests would've assuaged some of these prior concerns.

During the process of developing this web app, I also started a Real Job that required I install some LSP's into my nvim config. When I came back to this codebase after doing that, I was terrified. Type errors everywhere. Type errors still probably in this codebase, I stopped caring. As long as my code built, I shipped it -- my prod server my rules.

## Conclusion

I alternatingly experienced terror and pride as I watched so many audience members sign up on my little web app and interact with it. I laughed at their jokes and the ridiculousness of it all. Contributing to this play, with talented directors, crew, and actors, was an incredible privilege and I'd readily do it again. I'd love to find future projects that meet at this intersection between live performance and tech.

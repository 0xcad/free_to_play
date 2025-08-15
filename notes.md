ideas:

website changes
* make an opt out of random selection feature
* it would be crazy if we could get a game integration on the website, but it happens
* admin can just trigger a "game reset", which just flashes everyone's screen with a death message then chooses a new player
* make it easy af to make an account -- sign in with google, sign in with iphone, etc
* need emojis/gif reacts
* websocket for how much money is in john money's account -- or just periodically query backend endpoint on top of that, a la wrct now playing. and a list of purchased items?
    * TODO: talk to lucia to see how that's going to work.

problem:
* it doesn't work on chrome

questions:
* is the timer on the website?
    * on deck feature -- you'll be up next. you'll get an on deck notification in the last 30 seconds of the timer
        * pay money to be on deck next

game:
* need pictures of set on game background


# TODO:
login/authentication flow
* create an account
    * name, email (not required), participation (default true)
* log in
    * google oauth, sign in with apple id, sign in with twitter, whatever
    * for email log in, should we go no passcode? email based authentication
* log out

tutorial/virtual program

notifications
* websockets / periodically ping backend

chat
* chat
    * need emojis/gif reacts
    * idea: pay to send images/gifs in chat?
* moderation tools
    * kick, mute
    * select player to go next
        * opt in/opt out of playing online

manager?
* admin panel to progress the show. changes some api endpoint or smtg, and then lucias game will use that to add options

payment flow
* how does this work? do you pay for each thing individually? just add your credit card once? add a balance and spend from that? just get in debt?
    * batching payments is probably more effective for us, anyways, if players get in debt...
* payment api endpoint for lucia's game -- how much money is in the bank account?
* list of purchased items on the site / websocket for that? list of permanantly purchased items + how many tokens were spent

later
* progressive web application

# 2025-05-20

## design ideas
* pixel game art aestetic? old 90s click adventures?
    * I've been thinking bitmap font for header for a while now
    * fun checkboxes to mark smtg as selected or not/terminal style inputs
    * television scanlines? for legibility, probably on only part of the screen, like a header image.
* gacha games. treasure boxes, tons of colors, crazy sound effects

* idea: we put in fake/bot players who we display made a ton of purchases

## desired infrastructure:
pages should be able to know what's in the current state, and have access to that
* react reducer? react redux?

### things to store in state:
game
* current audience member who is playing (User)
* timer ? or timestamp for when timer started.
* inventory
    * items (Item array)
* status: waiting, running, or finished
* state
    * JohnBalance

chat
* loaded messages (ChatMessage array)

store
* items to buy (Item array)

account
* current user details
    * name, participation, balance, total spent

### types
item
* name
* image icon
* description
* cost
* whether its already been brought or not
* quantity?

User
* name, participation, balance, total spent
* maybe some brought perks, tbd

ChatMessage
* user
* description

## backend
I think it would be really convenient if we could have multiple games or instances. An admin can switch between active games, which essentially changes the interaction so far. So for example, you could have different games or instances for different nights of a performance (resetting everything), for debugging, etc. So frontend has no concept of PlayInstance, but when it makes its api requests, the backend will filter based on the active PlayInstance and respond accordingly

### models
PlayInstance
* debug status: default false
* name: null
* date created: default
* current player: user foreign key
* currentGameStart: datetime, time current game started
* status (waiting, running, finished)
* active (which one to host on the website?)
* this is hacky, but if later need to do like, a game state thing (booleans for what checks we've passed), I might just put it in a json dictionary for expansability
    * `JohnBalance`: how much money John has (store these keynames as constants?)

* admin view: reset (resets item purchases, clears game state, etc)

Account
* name, participation, oauth, balance, total spent
* isAdmin

Item
* name, cost, description
* category?
* display in item shop? i.e if it's a chat purchase or not?

ItemPurchase
* PlayInstance foreign key, item foreign key, user foreign key (user who purchased item)

ChatMessage
* datetime, user foriegn key, PlayInstance foreign key
* content (on frontend, or in a view we replace :emoji: with the emoji?)
* some kind of premium features


## login flow
* create account/ log in
    * sign in with apple
    * sign in with google
    * sign in with email ->
        * you give your email, name, participation checkbox
        * you get emailed a link that verifies your account
* account creation
    * takes you to a page with your name autofilled, participation status
    * "Show tutorial" button -> takes you to tutorial
    * "Continue to game" button -> takes you to home screen

## pages
game/chat/watch/stage (theatre icon?)
* watch the current player, send chat messages

store (chest icon?)
* add gems
* deals (I think it's funny, lol)
* shop by category
    * items
    * ambient
    * chat

account (person icon?)
* change name/participation status
* shows your balance / button to add tokens

program
* just static html for the show's program notes :P

tutorial (question icon, probably in top of screen)

## stage
* video of livestream
* show who the current player is
* timer
* tabbed interface - scroll up on it & it takes up more space?? ie going back into older messages
    * chat
        * view live chat feed
    * inventory
        * items purchased in john's account
        * how much money john has to spend
    * idea: game history?
        * game trees for previous players? or currently explored game tree?
    * idea: achievements?
        * achievements are associated with
* premium send / send a message (always visible)

## goals
* build/outline infrastructure
* create dead simple static page for like, "this will come" kinda thing
* login flow

## devnotes
* should I use componenet routes so that on each page I can have the react nav bar?
  * i just put that in root...
* likely use a client loader to get data on each page? or react redux?

# 2025-05-21
## goals
* login flow

## TODO
backend:
* create custom backend user
* email only authentication on backend
  * view to create users
  * success view to authenticate users / activate their accounts
  * resend email view

* TODO for later: change email backend / authenticate that, instead of just using console

frontend:
* submit form. on success show a "resend email" button with a timer
  * probably need to

## 2025-05-22
TODO:
* resend email frontend + backend

DONE:
* automatically logout if token is too old
* if we 401 go to login page
* log user in on page refresh
* logout link / clear cookie
  * put this under account details page

misc TODO:
* make protected routes
* make frontend logout link actually go to backend and invalidate access token? if that's needed
  * [this tutorial?](https://medium.com/django-rest/logout-django-rest-framework-eb1b53ac6d35)
* onboarding; frontend cookie where on login, show them a tutorial screen and a "buy gems" screen

## 2025-06-04
DONE:
* resend email frontend + backend finished
* bug fix on backend email
* create PlayInstance class in backend - DONE
* create ChatMessage model in backend

TODO:
* make a model view set for chat
* this would be great: chat websockets working in frontend. just need to be able to send messages.

# 2025-06-04
goal (DONE): I need a backend api endpoint that will return information about the PlayInstance. if it's started, current user, etc. The frontend needs to request this on page load. This will determine if we show a waiting message, or the actual game. You can only send chat messages if the current game is running.

goal (DONE): whenever an admin user updates the game state, it should automatically change for the users via a websocket, putting them into the game, as opposed to a waiting screen

DONE: to do this, the frontend app state needs to be expanded. it should have a class for PlayInstance, and another one for ChatMessages. I also probably need to have like, centralized websockets or something. because different django apps will also be sending their own websockets, I should really consider either combining these into one 'notifications' app, or just do something else...


join codes: how do we make sure a logged in user is actually in the audience? what if they saw a previous version of the show, and still have an account? I suggest join codes for this. You're joined if you're a member of the audience of the current game (put that into the UserSerializer, `is_joined`). When you make an account, you can scan a QR code that puts a url parameter. If it matches the join code of a game, we put you into that game. Otherwise, you're just not joined. If you're not joined on any of the app screens, we just render a join form for you.


DONE:
* model view for chat
* PlayInstance serializer
* playinstance save signal hook, to send a websocket to user on status change
* only send chat if current play instance is running status
* centralized websockets in backend in `notifications`
* change "Success" account creation language -- maybe, "One more step" - DONE
* PlayInstance List view
* frontend requests playinstance serializer on load
* frontend app state needs to be expanded
* centralized websocket in the frontend
* get game state (waiting/running), websocket for updating that
* simple waiting screen
* backend should have a view that just generates a QR code to join current game


chat goal: once the user knows the game is running, their frontend should make an initial request for messages. only load 20 messages at a time. if a user wants to load more messages, eventually I'll do infinite scroll, but for now they can just click a 'prev' button. this then uses the cursor navigation to get more messages.


MISC TODO:
* join/leave user websockets on login?
* keep track of which users have played before in PlayInstance ManyToMany + put that in UserSerializer...


Admin panel:
* The admin user should have a desktop interface that shows chat (and mute/kick controls), everyone in the audience, how much total has been spent/gems in circulation, inventory, game state. They should be able to change status of PlayInstance.
* They should be able to get a QR code for the current active game

## 2025-06-06
DONE:
* fix frontend join code + username bug
* join code frontend
* protected routes, kinda, in that game forces user to be joined :shrug:
* notifications with toastify
* game waiting indicator -- until the game starts, on all pages in the game layout, show a waiting spinner. when the game starts, navigate to the game screen and send a notification

## 2025-06-07

admin panel thoughts: the game admin should have a view to do the following things, optimized for their desktop:
* view the chat, and administrate that (kick, mute, delete, etc)
* view all audience members currently in the game
  * need websockets on login view, probably?
* select the new player to go next
  * re-roll + confirm ability
* start / pause / finish the game
  * confirm button on game finish
* get the join QR code thing
* ability to view/change/update the join code
* users should have like, a "call flight attendant" button, that just sends a websocket to the admin that they need help

what do we need to do this:
* if a user needs help, send a websocket to the backend. admin panel has a handler where we like, highlight their name or something

DONE:
* add backend permission for is joined + is authenticated for play views, chat views
* made backend also send play status on login, if joined
* chat messages should be a dictionary of id -> message, for ease of updating
* chat show prev messages button with cursor pagination
* send/receive chat messages + websockets

misc TODO:
* consider -- play model view set?
* consider -- get play status on join?

stage todo:
* add youtube video that's currently playing
* get the current user who's playing
* get the time current user has been playing for...

stage todo later:
* make it look pretty!
* add colors for who is who
* add like, an image/reaction keyboard if you pay for it
* pay for bold styling
* so currently I send out the entire user on every chat message, both in websockets and in api return. this leads to a lot of potential user duplication. i could send out just the userID, and make the frontend do a lookup of users it has in its system??

admin todo:
* chat moderation - DONE
* see a list of users in the audience - DONE
* select a user that is currently logged in and hasn't been chosen, to play - DONE
  * consider: each play needs to remember a couple of things per user. if they've played the game before, if they're muted, if they're kicked. should this be another model object?

accounts:
* update name - DONE
* update participation - DONE
* buy gems

store todo:
* make model for items to purchase - DONE
* make model for purchased items in play - DONE
* buy gems

# 2025-06-09

todo later:
* if you get muted, admins can still see your messages, you can send new ones, just other people can't see them - TODO

TODO:
* select the new player to go next - DONE
  * re-roll + confirm ability - DONE
* start / pause / finish the game - DONE
  * confirm button on game finish - TODO?
* get the join QR code thing - DONE
* ability to view/change/update the join code - DONE
* users should have like, a "call flight attendant" button, that just sends a websocket to the admin that they need help - TODO

what do we need to do this:
* if a user needs help, send a websocket to the backend. admin panel has a handler where we like, highlight their name or something
* new player to go next:
    * create an API endpoint that returns a random user who is not currently playing, and has not played before
    * admin panel has a button to select the next player, which calls that endpoint
      * updates the PlayInstance with the new player
    * admin panel can either confirm, or re-roll
* ^should probably create a model viewset for PlayInstance. have PATCH/partial updates for changing status, current player, join code

DONE:
* kick functionality
* mute functionality
* believe I fixed a bug where join was being slowed down
* admin panel has list of users / users join

# 2025-06-11
DONE:
* admin panel
  * change join code
  * change play status
* select user backend

backend:
* on play models.py, create a UserPlayInstance model (complemented eventually by ItemPlayInstance?) - DONE
  * fields: `is_muted`, `has_played`, `play_instance` (fk), `user` (fk). unique to `user` is a unique field per `play_instance` - DONE
  * update `user.is_muted` in serializers, probably some other view
  * create one of these every time a user joins an audience, if it doesn't already exist (can I do that with a signal?) - DONE, no signal
* create a `select-user` view on backend. looks through users that haven't played, using UserPlayInstance, and returns one. can't be an admin.
  * also updates `currentPlayer` on `PlayInstance`
^all of that is pretty done. todo next: get the frontend portion of this working

frontend:
* user presses select new player, sends a backend request
* gives them a pop-up modal. user can either hit confirm (literally just closes modal), or hit `re-roll`.
* on websocket, if you're the current player, show another pop-up with just an x in the corner...
* put buttons on audience list to just manually set current user.
* show who the current user is in the audience, too
* put a confirmation check/confirm modal around kicking users?

start timer: hit a backend api query. update start timer optimistically. backend should reply with the rely start timer, however. websocket will handle the update.
* under stage, create a new `Timer` component that takes in time as a prop, should be really easy to make.

mark player as *has played* on backend. maybe combine this with the mute thing? just an update view, likely

TODO:
* start game timer view

# 2025-06-12
DONE:
* select player frontend
* refactored accounts into model view, it's so fucking good now
* set has played on users
* player instance view set refactor
* custom modals

* created the timer, with start/stop/reset controls!

timer todo later: - DONE
* make it red when there's only so much time left on the clock...

misc todo later:
* have the play instance signal only send the updated fields, if provided, else send all fields.

stage todo:
* add youtube video that's currently playing

accounts: - DONE
* update name
* update participation
* buy gems

store todo:
* make model for items to purchase - DONE
* make model for purchased items in play - DONE
* in the stage, add an inventory for purchased items - DONE
  * users have a personal inventory, the play instance has its own inventory?
* buy gems with stripe

# 2025-07-10
God, it's been a fucking minute hasn't it?

goals:
* start working on store TODO

what store api endpoints do we need?
* list view for items to purchase, filter on visibility, too
* a way for a user to buy an item
* a way for a user to view their purchased items (inventory?)
* a way to see which items have been purchased for the game

idea later:
* maybe you should be able to buy items piecemeal. like, you can contribute half of the gems for it. crowdfunding.
  * it would be so fucking funny to call this like, "buy this in multiple easy installments".

DONE:
* update name/participation on account works
* basic "dummy" gem purchase flow
* store models created

# 2025-07-11

DONE:

* need to extend user model in frontend to have an inventory, a list of id's of items in the store
* need to add dictionary of items to frontend, and populate that from the store api endpoint

item viewset -  DONE

* Create/Update/Delete views are admin only
* /items/ -- list items available to purchase, grouped by category
* /items/<id> -- get item details
* /items/<id>/purchase -- purchase an item, returns the item purchased
* /items/inventory -- get the user's inventory, which items they have purchased
* /items/play -- get the items purchased for the current play instance (purchased items that have `item_type` of `play`)
* /buy_gems/ -- buy gems for the current user

TODO: -- pretty much DONE!
* deployment stuff. multiple django settings, docker, websockets working on nginx

# 2025-07-14
Goal:
* do a first pass of css for all pages

notes:
* to do "sign in with apple", first you have to be an apple developer, which costs $99 a year. skip that for now and likely future...

DONE:
* sign in with google implemented and finished :)) (might be a bug somewhere with env vars...)
* first pass of css for most pages

# 2025-07-17
bugs: FIXED
* backend env vars not working for google oauth -- fixed, I believe
* need to have client id be an env var in frontend -- fixed, I believe
* logout notification sending even when it shouldn't; check window pathname vs join page url in `const` folder -- could not replicate?
  * reproduced -- this actually


misc TODO:
* I think "send email" link should disable the button as soon as you click it
* bug "you need to log in again" notificaiton appears erroneously whenever you log in with email

DONE:
* fixed homepage navigate bug
* added a way to change stream url and display youtube video (i.e, try `https://www.youtube-nocookie.com/embed/iR1OvxoFD5I?si=BIF_ZSZnx8VbQgjD`)
* admin view css takes up full screen

# 2025-07-18

TODO:
* redo CSS; just make everything dark mode, don't do this green shit.
* CSS for stage page
* stripe payment flow for buying gems
* store page CSS + changes
* vanity purchase items for typing in chat
  * pay money to customize how your name appears -- choose an icon, choose your color from hex, etc
* admin css

DONE:
* timer now red when time is running out
* added icons
* some stage css -- but getting messages to scroll instead of overflow is killing me


stripe
* currently, I know how to make items to purchase in stripe, and charge the user for them
* show: a store page, with items to purchase (pile of gems, box of gems, crate of gems)
* user clicks on an item, which makes a backend request to create a stripe checkout session
* then, display the stripe checkout form
* on success, close the page
* a strip webhook that listens for successful purchases, and updates the user's balance - DONE
* TODO: in my webhook function, figure out how to get the quantity of gems purchased - DONE
  * done, I store this as metadata on the stripe *price* object, which is good because it's one fewer API call
  * If I want to deploy this, set up an event to listen to the endpoint, and make sure to copy over the new stripe webhook secret
  * https://dashboard.stripe.com/test/workbench/webhooks/we_1Rmf8D4N2pJVojh2Q3banRaE?fromWizard=true

# 2025-07-19
DONE:
* stripe webhooks now largely work.

next for stripe, create a backend model (just a view?) that gets all the products I have from stripe. - DONE
* frontend should call that exactly once, with the shop, then just save that information in state -- if buygemsmodal doesn't unmount, then done
* frontend should list those items on the store page - DONE
* you click on an item, which brings up the stripe checkout form. add the stripe product id to the checkout session url or post request. - DONE
* this gets the exact checkout form that we want. yay! - DONE

# 2025-08-06
oh damn it's been a while

need a backend endpoint that's probably post, or even get, where user somehow passes in the stripe product id, and then we create a checkout session for that product. this is so that the frontend can just call it, and get the checkout session url.

DONE:
* created `/api/store/stripe/products/` endpoint that returns all the products in stripe
  * added a cache to this, so it doesn't hit the stripe api every time
  * TODO: add an order metadata field to the stripe product, so we can order them in the frontend
* modified backend checkout session endpoint to take a product id, and create a checkout session for that product. made frontend use that.
* ^ essentially, purchasing gems now works lmao it's so good

TODO later:
* make checkout page take up more space, add a "close" button

# 2025-08-07

addictive design (funny)
* when you click, show immediate feedback in like, fireworks or something like that
* animations on tab switching. animations on whatever page you're visiting in nav
* bubble UI. lots of gradients
* the shop button should just repeatedly start glowing, like flashing yellow (drop shadow?)
* definitely needs to have sound effects, especially whenever you buy something
* the "navigating" loading screen needs to have a spinner and a fun icon/image

* the store button should just be shiny, and repeatedly flash. same with buy gems.

DONE:
* added icon shared class
* bubble UI buttons / modals
* new font
* active page icon is animated :))

# 2025-08-08

turns out all those stripe CSP issues were because of privacy badger, and also tamper monkey for some reason? should be fixed.

DONE:
* animated tabs, added motion library
* add gems count to gem store, duh
* redid account page styles, added more animations
* "limited time offer" for everything in store
* animate the modal pop ups

# 2025-08-09
DONE:
* styled timer (easy)
* new font
* sound effects on buying gems, and sound effect on being called up to play
* animate page switching
* navigating icon

# 2025-08-15
DONE:
* css refactor. it works! tabs scroll n everything!!
  * fixed a lot of overflow issues, scroling issues

TODO:
* eventually throttle chat api
* I uncommented Stripe because it was really slow. find out why.
* click animation: maybe just mimic the cashnado slot machine thing? that might be easier than sparkles
* make the credit card form take up more space in the modal
* add css to notifications -- the close x should be way bigger on mobile
* add chat novelty purchases.
    * ability to send reaction images.
    * mark the user text as gold, give them a special icon in chat. put laurels around their name
    * ability to change your name color, or select a custom icon. you can do this in the account page.
* IMPORTANT! special chat notification for when a user buys gems
* idea: pay "indulgences" to increase odds of being selected to play next?
* idea: a "continue" button with gems that lets you restart. you get one continue, it costs five dollars (in gems). you see a countdown for like 10 seconds, and then you get to play again.

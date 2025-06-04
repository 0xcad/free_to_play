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
* make backend login link a POST request instead of GET
* make frontend logout link actually go to backend and invalidate access token? if that's needed
* change "Success" account creation language -- maybe, "One more step"

## 2025-06-04
DONE:
* resend email frontend + backend finished
* bug fix on backend email

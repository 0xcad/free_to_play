# Docs

## How to add products to Stripe?
* Stripe product catalog > add product
* In *price* metadata add `gems` with number of gems it buys
* test webhook with `stripe listen --forward-to localhost:8000/api/store/stripe/webhook/`
  * if you do that, input webhook secret in `.env` file

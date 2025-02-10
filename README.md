## License

This project is licensed under the GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later).

This means that if you modify this software and use it to provide a service over a network, you must make your modified version available under the same license. For more details, see the [LICENSE](LICENSE) file in this repository.

# Getting started

You will need to set up environment variables from various providers such as OpenAI, Google, Supabase, etc.
Copy over the variables from `.env.example`.

# Stripe

In order to test subscriptions locally you'll need to set up ngrok and provide the url to stripe so you can receive webhooks.

# TODO

- Posthog
- Server logs (ocr payload, openai payload)
- Pass all rectangles and add a sensitive key

# ROADMAP

- Paste keyboard shortcut
- Save as (png/jpg/etc)
- Pixelated, Blur, Black bar
-

TODO:

- Get rid of s3 since we're using google storage
- get rid of excess pdf library /renderer?

from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import IntegrityError

APP_LABEL = "store"

class Command(BaseCommand):
    help = "Create/update ItemCategory ('Play', 'Swag') and predefined Items (update_or_create by name)."

    def handle(self, *args, **options):
        Item = apps.get_model(APP_LABEL, "Item")
        ItemCategory = apps.get_model(APP_LABEL, "ItemCategory")

        if Item is None or ItemCategory is None:
            self.stderr.write(self.style.ERROR(
                f"Could not find Item or ItemCategory in app '{APP_LABEL}'. Update APP_LABEL at top of this file."
            ))
            return

        # 1) Create or update categories
        try:
            play_cat, created_play = ItemCategory.objects.update_or_create(
                name="Play",
                defaults={
                    "description": "Items purchased will have real effects on how the play unfolds.",
                    "icon": "theater",
                    "order": 1,
                    "item_type": "play",
                }
            )
            swag_cat, created_swag = ItemCategory.objects.update_or_create(
                name="Swag",
                defaults={
                    "description": "These items affect how you appear to other users in the chat, and separate you from the riff-raff",
                    "icon": "swag",
                    "order": 2,
                    "item_type": "user",
                }
            )
            self.stdout.write(self.style.SUCCESS(
                f"Category Play: {'created' if created_play else 'updated'}; "
                f"Category Swag: {'created' if created_swag else 'updated'}"
            ))
        except IntegrityError as e:
            self.stderr.write(self.style.ERROR(f"IntegrityError creating categories: {e}"))
            return
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error creating categories: {e}"))
            return

        # 2) Items list (names include emojis as requested). Use simple slugs.
        items = [
            {
                "name": "🎭 Dream Ballet 🎶",
                "slug": "dream-ballet",
                "cost": 30,
                "description": "Triggers a dream ballet at the start of the next scene. Way better than Oklahoma.",
                "quantity": 1,
                "item_type": "play",
                "order": 1,
            },
            {
                "name": "🗣️ Simmish 🌀",
                "slug": "simmish",
                "cost": 25,
                "description": "Actors will perform the next 5 minutes of the play in Simmish",
                "quantity": 1,
                "item_type": "play",
                "order": 2,
            },
            {
                "name": "💡 Unlock Hints 🔓",
                "slug": "unlock-hints",
                "cost": 20,
                "description": "Somewhat replaces ads with helpful hints for the show",
                "quantity": 1,
                "item_type": "play",
                "order": 3,
            },
            {
                "name": "🎶 Accompaniment 🎻",
                "slug": "accompaniment",
                "cost": 15,
                "description": "Live musicians improvise scoring for the next 10 minutes",
                "quantity": 1,
                "item_type": "play",
                "order": 4,
            },
            {
                "name": "🎩 Fun Hats 🤡",
                "slug": "fun-hats",
                "cost": 5,
                "description": "The actors don silly hats. More purchases = more silly hats.",
                "quantity": 5,
                "item_type": "play",
                "order": 5,
            },
            {
                "name": "👩🏽‍🎨 Frida Play 🌸",
                "slug": "frida-play",
                "cost": 5,
                "description": "All actors draw tiny unibrows before the next scene",
                "quantity": 1,
                "item_type": "play",
                "order": 6,
            },
            {
                "name": "🌟 Be in the show 🎬",
                "slug": "be-in-the-show",
                "cost": 30,
                "description": "We'll actually pull you up onstage to be an actor in the show.",
                "quantity": 1,
                "item_type": "play",
                "order": 10,
            },
            {
                "name": "📱 DoomscrollGuy 🕶️",
                "slug": "doomscrollguy",
                "cost": 15,
                "description": "Someone will doomscoll tiktok on the side of the stage for 10 minutes and you can watch their feed!",
                "quantity": 1,
                "item_type": "play",
                "order": 11,
            },
            {
                "name": "🔐 Music Licensing 🎵",
                "slug": "music-licensing",
                "cost": 200,
                "description": "Pays for proper music licensing, allowing us to purchase the rights to the songs we'll play.",
                "quantity": 1,
                "item_type": "play",
                "order": 12,
            },
            {
                "name": "✅ F2P Premium++ 🔵",
                "slug": "verified",
                "cost": 5,
                "description": "To show how trustworthy you are as a person with money, a verification badge shows up next to your name. You don't have to stop buying at one, you'll just keep on getting verified.",
                "quantity": None,
                "item_type": "user",
                "order": 2,
            },
            {
                "name": "💬 Super Chat 🔊",
                "slug": "super-chat",
                "cost": 5,
                "description": "Your chat messages are read aloud for the rest of the show!",
                "quantity": 1,
                "item_type": "user",
                "order": 1,
            },
            {
                "name": "🎁 Donate to Streamer ❤️",
                "slug": "donate-to-streamer",
                "cost": 10,
                "description": "Get a shoutout from your parasocial bestie. We also prioritize donors in choosing audience members to play.",
                "quantity": 1,
                "item_type": "user",
                "order": 3,
            },
        ]

        created = 0
        updated = 0

        # Helper: map slug -> category instance (super-chat -> swag, all others -> play)
        for idx, item in enumerate(items, start=1):
            lookup = {"name": item["name"]}
            # choose category based on slug
            if item.get("item_type") == "user":
                category_instance = swag_cat
            else:
                category_instance = play_cat

            defaults = {
                "slug": item["slug"],
                "cost": item["cost"],
                "description": item["description"],
                "quantity": item["quantity"],
                "item_type": item["item_type"],
                "order": item.get("order", idx),
                "category": category_instance,  # assign FK instance
            }

            try:
                obj, was_created = Item.objects.update_or_create(defaults=defaults, **lookup)
                if was_created:
                    created += 1
                    self.stdout.write(self.style.SUCCESS(f"Created item: {item['name']} (slug: {item['slug']})"))
                else:
                    updated += 1
                    self.stdout.write(self.style.NOTICE(f"Updated item: {item['name']} (slug: {item['slug']})"))
            except IntegrityError as e:
                self.stderr.write(self.style.ERROR(f"IntegrityError for {item['name']}: {e}"))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error creating/updating {item['name']}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Done. Categories: Play({'created' if created_play else 'updated'}), Swag({'created' if created_swag else 'updated'})"))
        self.stdout.write(self.style.SUCCESS(f"Items - Created: {created}, Updated: {updated}"))



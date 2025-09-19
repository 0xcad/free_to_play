from django.db import models
from django.contrib.auth.models import AbstractUser

FREELANCE_TEXTS = [
    "WORSDT FUXKING NUKES IN STREEFREEVOO. FUXKING FUXK DAVE WHO RUNS THIS PLACE. HUGE AXSS HOLXE. One Star.",
    "Cancelled order after 3 months after Promising expedited delivery. I am not a happy camper. One Star.",
    "Where are my nukes, Dave? One Star.",
    "David, this is your last chance to deliver the arms as we agreed upon. Send them NOW.",
    "Dude doesn't complete internationsl orders (I live in Republic of Hulu and have been waiting forever.) One Star.",
    "Trust the other reviews, the guy is just not a good buisnessman. One Star.",
    "Went into his bunker to complete my order in person. He double charged me on a VERY expensive order and expected me not to notice. Incompetent fool. One Star.",
    "DAVE SUCKS, check out John Money in the Reboot District if you want a serious arms dealer. One Star.",
    "Poor quality nuke launches, exploded in the air and I haven't been breathing right for weeks. One Star.",
    "I mean, they're fine. Two stars.",
    "FU CK DAVE SHORT FU CK DAVE SHORT FU CK DAVE SHORT FU CK DAVE SHORT FU CK DAVE SHORT. One Star.",
    "Dude sold nukes to my d1ckhead neighbor. My whole family is dead now! One Star.",
    "Dave short makes all his money selling nuclear arms to our foreign adversaries (Tubi, Criterion Channel, and even those sick bastards at Hulu). DONT TRUST. One Star.",
    "scammed. One Star.",
    "Just reach out to john.money@gmail.com instead. You won't regret it. One Star.",
    "Sleazzzzzeee ball of a human. Dave Short sucks. One Star.",
    "This guys a creep and not a good buisness man. One Star.",
    "Don't know how he stays in buisness. and he's stinky! One Star.",
    "Dave short, short on everything! Get your armaments somewhere else! One Star.",
    "Dave Short ruined my life! One Star.",
    "Website is a bunch of LIES. Offers NO atomic weapons, only nukes. One Star.",
    "Doesn't do business with immigrants from Netflix. Extremely disappointing. One Star.",
    "Dave Short is short in every department. Yes. One Star.",
    "Suffered through business with this man for years. Now I shop from John Money. Much more reliable. One Star.",
    "Dave Short is an ugly, stinky man who knows nothing about what he is doing. One Star.",
]

class User(AbstractUser):
    name = models.CharField(max_length=64, default='')
    email = models.EmailField(max_length=254, unique=True, null=True)
    is_participating = models.BooleanField(default=True)
    is_muted = models.BooleanField(default=False)
    has_played = models.BooleanField(default=False)

    is_active = models.BooleanField(default=False)

    # how much money they have
    balance = models.PositiveIntegerField(default=0)
    spent = models.PositiveIntegerField(default=0)

    freelance_index = models.PositiveIntegerField(default=0)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    username = None

    def __str__(self):
        return self.name

    @property
    def is_joined(self):
        return bool(self.plays.filter(is_active=True))

    @property
    def inventory(self):
        return self.all_purchased_items.filter(play_instance__is_active=True, item__item_type="user")

    @property
    def has_superchat(self):
        return self.all_purchased_items.filter(play_instance__is_active=True, item__slug='super-chat').exists()

    @property
    def is_donor(self):
        return self.all_purchased_items.filter(play_instance__is_active=True, item__slug='donate-to-streamer').exists()

    @property
    def freelance_text(self):
        if self.freelance_index < len(FREELANCE_TEXTS):
            return FREELANCE_TEXTS[self.freelance_index].strip()
        return None

    '''
    def get_play_user(self):
        return self.play_user.filter(play_instance__is_active=True).first()

    @property
    def is_muted(self):
        play_user = self.get_play_user()
        if play_user:
            return play_user.is_muted
        return False
    '''

# Generated by Django 5.2 on 2025-06-05 22:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_user_balance_user_is_muted'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='spent',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
    ]

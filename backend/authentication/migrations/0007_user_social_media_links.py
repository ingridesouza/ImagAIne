from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0006_user_plan"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AddField(
                    model_name="user",
                    name="social_media_links",
                    field=models.JSONField(blank=True, default=dict),
                ),
            ],
        ),
    ]

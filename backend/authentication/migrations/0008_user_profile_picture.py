from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0007_user_social_media_links"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE authentication_user "
                        "ADD COLUMN IF NOT EXISTS profile_picture varchar(100);"
                    ),
                    reverse_sql=(
                        "ALTER TABLE authentication_user "
                        "DROP COLUMN IF EXISTS profile_picture;"
                    ),
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="user",
                    name="profile_picture",
                    field=models.CharField(blank=True, max_length=100, null=True),
                ),
            ],
        ),
    ]
